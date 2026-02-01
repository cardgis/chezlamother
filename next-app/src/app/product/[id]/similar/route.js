import { Pool } from 'pg';
import { NextResponse } from 'next/server';

// Client PostgreSQL direct pour Neon
// HOTFIX: Force l'URL Neon correcte car les variables d'environnement Vercel ont un problème
const NEON_DB_URL = 'postgres://default:UpPh5bCk6iSZ@ep-snowy-union-a4t26bx0-pooler.us-east-1.aws.neon.tech/verceldb?pgbouncer=true&connect_timeout=15&sslmode=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || NEON_DB_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Fonction pour créer une description courte
function createShortDescription(description, maxLength = 80) {
  if (!description) return '';
  if (description.length <= maxLength) return description;
  
  const truncated = description.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.6) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params; // Await params for Next.js 15 compatibility
    const { id } = resolvedParams;

    function slugify(str) {
      return String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // retire les accents
        .replace(/['']/g, '') // retire apostrophes
        .replace(/\s+/g, '-')
        .replace(/[()]/g, '')
        .replace(/[^a-zA-Z0-9\-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
    }

    const client = await pool.connect();

    // Chercher le produit par ID ou par slug
    let product = null;
    
    // Essayer d'abord par ID numérique
    if (!isNaN(parseInt(id))) {
      const result = await client.query('SELECT * FROM products WHERE id = $1', [parseInt(id)]);
      product = result.rows[0];
    }
    
    // Si pas trouvé et si c'est un slug, chercher par slug
    if (!product) {
      const result = await client.query('SELECT * FROM products WHERE slug = $1', [String(id)]);
      product = result.rows[0];
    }
    
    // Si toujours pas trouvé, chercher par nom slugifié
    if (!product) {
      const allResult = await client.query('SELECT * FROM products');
      product = allResult.rows.find(p => slugify(p.name) === String(id));
    }

    if (!product) {
      client.release();
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Retourner maximum 4 produits similaires
    // Priorité à la sous-catégorie, puis à la catégorie si pas assez de résultats
    let similarResult = await client.query(`
      SELECT * FROM products 
      WHERE id != $1 AND subcategory = $2 
      LIMIT 4
    `, [product.id, product.subcategory]);
    
    let similar = similarResult.rows;
    
    // Si moins de 4 produits avec la même sous-catégorie, compléter avec la même catégorie
    if (similar.length < 4) {
      const existingIds = similar.map(p => p.id);
      const placeholders = existingIds.map((_, i) => `$${i + 4}`).join(',');
      
      const additionalResult = await client.query(`
        SELECT * FROM products 
        WHERE id != $1 
        AND category = $2 
        AND subcategory != $3
        ${existingIds.length > 0 ? `AND id NOT IN (${placeholders})` : ''}
        LIMIT $${existingIds.length + 4}
      `, [product.id, product.category, product.subcategory, ...existingIds, 4 - similar.length]);
      
      similar = [...similar, ...additionalResult.rows];
    }
    
    client.release();
    
    // Ajouter shortDescription aux produits similaires
    const similarWithShortDesc = similar.map(product => ({
      ...product,
      shortDescription: createShortDescription(product.description)
    }));
    
    return NextResponse.json(similarWithShortDesc);
  } catch (e) {
    console.error('Erreur dans l\'API des produits similaires:', e);
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}