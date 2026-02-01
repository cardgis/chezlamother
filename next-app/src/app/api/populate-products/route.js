import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function GET() {
  const client = await pool.connect();

  try {
    console.log('📦 Import des produits...\n');

    // Importer les produits depuis le fichier JSON
    const productsDataPath = path.join(process.cwd(), 'src', 'utils', 'productsData.json');
    const productsData = JSON.parse(fs.readFileSync(productsDataPath, 'utf-8'));

    console.log(`📊 ${productsData.length} produits trouvés dans le fichier`);

    for (const product of productsData) {
      const query = `
        INSERT INTO products (
          slug, name, description, "shortDescription", price, category, subcategory,
          "dayAvailable", available, image, rating, reviews, "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING
      `;

      const values = [
        product.slug,
        product.name,
        product.description,
        product.shortDescription || null,
        Math.round(parseFloat(product.price) * 100), // Convertir en centimes
        product.category,
        product.subcategory,
        product.dayAvailable || null,
        product.available !== false,
        product.image || null,
        product.rating || null,
        product.reviews || 0
      ];

      await client.query(query, values);
      console.log(`✅ Produit ajouté: ${product.name}`);
    }

    client.release();

    return NextResponse.json({
      success: true,
      message: `${productsData.length} produits importés avec succès`
    });

  } catch (error) {
    client.release();
    console.error('❌ Erreur lors de l\'import des produits :', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'import des produits', details: error.message },
      { status: 500 }
    );
  }
}