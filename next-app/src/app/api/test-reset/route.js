import { Pool } from 'pg';
import { NextResponse } from 'next/server';

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function GET() {
  try {
    console.log('=== TEST RESET SIMPLE ===');
    
    const client = await pool.connect();
    
    // Vérifier la structure de la table
    const tableInfoQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'reset_tokens' 
      ORDER BY ordinal_position;
    `;
    
    const tableInfo = await client.query(tableInfoQuery);
    console.log('Structure table reset_tokens:', tableInfo.rows);
    
    // Test d'insertion simple
    const testEmail = 'test@example.com';
    const testCode = 'test123';
    const testExpires = new Date(Date.now() + 60 * 60 * 1000);
    
    console.log('Test insertion avec colonnes essentielles...');
    
    // Nettoyer d'abord
    await client.query('DELETE FROM reset_tokens WHERE email = $1', [testEmail]);
    
    // Insérer avec colonnes minimales
    const insertQuery = `
      INSERT INTO reset_tokens (email, code, expires_at) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    
    const insertResult = await client.query(insertQuery, [testEmail, testCode, testExpires]);
    console.log('✅ Insertion réussie:', insertResult.rows[0]);
    
    // Nettoyer le test
    await client.query('DELETE FROM reset_tokens WHERE email = $1', [testEmail]);
    
    client.release();
    
    return NextResponse.json({
      success: true,
      message: 'Test reset réussi',
      tableStructure: tableInfo.rows,
      testInsert: insertResult.rows[0]
    });
    
  } catch (error) {
    console.error('=== ERREUR TEST RESET ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('=========================');
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}