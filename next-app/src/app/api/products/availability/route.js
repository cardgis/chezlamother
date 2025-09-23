import { Pool } from 'pg';

// Client PostgreSQL direct pour Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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