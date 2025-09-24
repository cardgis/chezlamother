import { Pool } from 'pg';

// Client PostgreSQL direct pour Neon
const getConnectionString = () => {
  // Fix temporaire : utiliser la bonne URL Neon si les variables pointent vers "base"
  const envUrl = process.env.DATABASE_URL || process.env.NEON_PRISMA_URL || process.env.POSTGRES_URL;
  
  if (envUrl && envUrl.includes('base')) {
    console.log('⚠️ URL invalide détectée, utilisation de l\'URL Neon correcte');
    return 'postgres://default:UpPh5bCk6iSZ@ep-snowy-union-a4t26bx0-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require';
  }
  
  return envUrl || 'postgres://default:UpPh5bCk6iSZ@ep-snowy-union-a4t26bx0-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require';
};

const pool = new Pool({
  connectionString: getConnectionString(),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function PATCH(request) {
  try {
    const { id, available } = await request.json();
    
    if (!id || typeof available !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'ID et disponibilité requis' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const client = await pool.connect();
    
    // Mettre à jour seulement la disponibilité
    const result = await client.query(`
      UPDATE products 
      SET available = $1, "updatedAt" = NOW()
      WHERE id = $2
      RETURNING id, name, available
    `, [available, id]);
    
    client.release();
    
    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Produit non trouvé' }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      product: result.rows[0] 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la disponibilité:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}