import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET() {
  try {
    console.log('🔍 Debug Neon Database depuis Vercel...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Définie' : 'Manquante');
    
    const client = await pool.connect();
    
    // Test 1: Connexion
    const timeResult = await client.query('SELECT NOW() as current_time');
    
    // Test 2: Tables existantes
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    // Test 3: Count des produits
    const countResult = await client.query('SELECT COUNT(*) FROM products');
    
    // Test 4: Premiers produits
    const productsResult = await client.query(`
      SELECT id, name, category, price 
      FROM products 
      ORDER BY id 
      LIMIT 10
    `);
    
    // Test 5: Catégories
    const categoriesResult = await client.query(`
      SELECT category, COUNT(*) as count 
      FROM products 
      GROUP BY category 
      ORDER BY category
    `);
    
    client.release();
    
    const debugInfo = {
      timestamp: timeResult.rows[0].current_time,
      database_url_defined: !!process.env.DATABASE_URL,
      tables: tablesResult.rows.map(r => r.table_name),
      products_count: parseInt(countResult.rows[0].count),
      sample_products: productsResult.rows,
      categories: categoriesResult.rows,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: !!process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV
      }
    };
    
    return Response.json(debugInfo, { status: 200 });
    
  } catch (error) {
    console.error('❌ Erreur debug Neon:', error);
    
    return Response.json({
      error: error.message,
      stack: error.stack,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'Définie' : 'Manquante',
        VERCEL: !!process.env.VERCEL
      }
    }, { status: 500 });
  }
}