import { Pool } from 'pg';

// Client PostgreSQL direct pour Neon (plus fiable que Prisma)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_PRISMA_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Fonction pour créer une description courte
function createShortDescription(description, maxLength = 80) {
  if (!description) return '';
  if (description.length <= maxLength) return description;
  
  // Couper au dernier mot complet avant la limite
  const truncated = description.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.6) { // Si on a au moins 60% du texte
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
}

export async function GET() {
  try {
    console.log('🔌 Tentative de connexion à la base de données...');
    console.log('📋 DATABASE_URL disponible:', !!process.env.DATABASE_URL);
    
    const client = await pool.connect();
    console.log('✅ Connexion établie');
    
    const result = await client.query(`
      SELECT id, slug, name, description, price, category, subcategory, 
             "dayAvailable", available, image, rating, reviews, 
             "createdAt", "updatedAt"
      FROM products 
      ORDER BY id ASC
    `);
    
    console.log(`📊 ${result.rows.length} produits récupérés`);
    client.release();
    
    // Ajouter shortDescription à chaque produit
    const productsWithShortDesc = result.rows.map(product => ({
      ...product,
      shortDescription: createShortDescription(product.description)
    }));
    
    return new Response(JSON.stringify(productsWithShortDesc), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des produits:', error);
    console.error('📋 Détails de l\'erreur:', {
      message: error.message,
      code: error.code,
      stack: error.stack?.substring(0, 500)
    });
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la récupération des produits' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function PUT(request) {
  try {
    const products = await request.json();
    const client = await pool.connect();
    
    // Mettre à jour chaque produit avec PostgreSQL direct
    for (const product of products) {
      await client.query(`
        UPDATE products 
        SET name = $1, description = $2, price = $3, category = $4, 
            subcategory = $5, "dayAvailable" = $6, available = $7, 
            image = $8, rating = $9, reviews = $10, "updatedAt" = NOW()
        WHERE id = $11
      `, [
        product.name,
        product.description,
        product.price,
        product.category,
        product.subcategory,
        product.dayAvailable || null,
        product.available !== false,
        product.image || null,
        product.rating || null,
        product.reviews || null,
        product.id
      ]);
    }
    
    client.release();
    
    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des produits:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la mise à jour des produits' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
