import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function GET() {
  try {
    console.log('=== ANALYSE TABLE RESET_TOKENS ===');
    
    const client = await pool.connect();
    
    // Voir la structure de la table reset_tokens
    const structureQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'reset_tokens' 
      ORDER BY ordinal_position;
    `;
    
    const structureResult = await client.query(structureQuery);
    console.log('Structure actuelle:', structureResult.rows);
    
    // Ajouter la colonne expires_at si elle manque
    const columns = structureResult.rows.map(row => row.column_name);
    
    if (!columns.includes('expires_at')) {
      console.log('❌ Colonne expires_at manquante, ajout en cours...');
      
      const addColumnQuery = `
        ALTER TABLE reset_tokens 
        ADD COLUMN expires_at TIMESTAMP;
      `;
      
      await client.query(addColumnQuery);
      console.log('✅ Colonne expires_at ajoutée');
    } else {
      console.log('✅ Colonne expires_at existe déjà');
    }
    
    // Ajouter d'autres colonnes si nécessaires
    if (!columns.includes('used')) {
      console.log('❌ Colonne used manquante, ajout en cours...');
      
      const addUsedQuery = `
        ALTER TABLE reset_tokens 
        ADD COLUMN used BOOLEAN DEFAULT FALSE;
      `;
      
      await client.query(addUsedQuery);
      console.log('✅ Colonne used ajoutée');
    }
    
    if (!columns.includes('created_at')) {
      console.log('❌ Colonne created_at manquante, ajout en cours...');
      
      const addCreatedQuery = `
        ALTER TABLE reset_tokens 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `;
      
      await client.query(addCreatedQuery);
      console.log('✅ Colonne created_at ajoutée');
    }
    
    if (!columns.includes('updated_at')) {
      console.log('❌ Colonne updated_at manquante, ajout en cours...');
      
      const addUpdatedQuery = `
        ALTER TABLE reset_tokens 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `;
      
      await client.query(addUpdatedQuery);
      console.log('✅ Colonne updated_at ajoutée');
    }
    
    // Vérifier la structure finale
    const finalStructure = await client.query(structureQuery);
    console.log('Structure finale:', finalStructure.rows);
    
    client.release();
    
    return NextResponse.json({
      success: true,
      message: 'Table reset_tokens mise à jour',
      initialColumns: columns,
      finalStructure: finalStructure.rows
    });
    
  } catch (error) {
    console.error('=== ERREUR MISE À JOUR TABLE ===');
    console.error('Message:', error.message);
    console.error('================================');
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}