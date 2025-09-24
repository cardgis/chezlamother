import { Pool } from 'pg';

// Configuration de test de connexion
// HOTFIX: Force l'URL Neon correcte car les variables d'environnement Vercel ont un problème
const NEON_DB_URL = 'postgres://default:UpPh5bCk6iSZ@ep-snowy-union-a4t26bx0-pooler.us-east-1.aws.neon.tech/verceldb?pgbouncer=true&connect_timeout=15&sslmode=require';

const pool = new Pool({
  connectionString: process.env.NODE_ENV === 'production' ? NEON_DB_URL : (process.env.DATABASE_URL || NEON_DB_URL),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function GET() {
  try {
    console.log('🧪 Test de connexion à la base de données');
    console.log('🔐 NODE_ENV:', process.env.NODE_ENV);
    console.log('📋 DATABASE_URL existe:', !!process.env.DATABASE_URL);
    console.log('� NEON_PRISMA_URL existe:', !!process.env.NEON_PRISMA_URL);
    console.log('📋 POSTGRES_URL existe:', !!process.env.POSTGRES_URL);
    
    const dbUrl = process.env.DATABASE_URL || process.env.NEON_PRISMA_URL || process.env.POSTGRES_URL;
    console.log('🔗 URL utilisée (masquée):', dbUrl?.replace(/\/\/.*@/, '//***@'));
    
    const client = await pool.connect();
    console.log('✅ Connexion réussie');
    
    // Test simple
    const result = await client.query('SELECT COUNT(*) as count FROM products');
    const count = result.rows[0].count;
    
    console.log(`📊 Nombre de produits: ${count}`);
    
    client.release();
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Connexion à la base de données réussie',
      productCount: parseInt(count),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}