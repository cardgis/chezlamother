import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function GET() {
  try {
    console.log('=== CRÉATION TABLE RESET_TOKENS ===');
    
    const client = await pool.connect();
    
    // Créer la table reset_tokens si elle n'existe pas
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS reset_tokens (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(createTableQuery);
    console.log('✅ Table reset_tokens créée/vérifiée');
    
    // Créer un index sur l'email pour optimiser les requêtes
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_reset_tokens_email 
      ON reset_tokens (email);
    `;
    
    await client.query(createIndexQuery);
    console.log('✅ Index créé');
    
    // Nettoyer les tokens expirés
    const cleanupQuery = `
      DELETE FROM reset_tokens 
      WHERE expires_at < NOW() OR used = TRUE;
    `;
    
    const cleanupResult = await client.query(cleanupQuery);
    console.log('🧹 Tokens expirés supprimés:', cleanupResult.rowCount);
    
    client.release();
    
    return NextResponse.json({
      success: true,
      message: 'Table reset_tokens initialisée avec succès',
      tokensDeleted: cleanupResult.rowCount
    });
    
  } catch (error) {
    console.error('=== ERREUR INITIALISATION ===');
    console.error('Message:', error.message);
    console.error('=============================');
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}