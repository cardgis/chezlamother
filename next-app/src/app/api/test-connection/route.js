import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function GET() {
  try {
    console.log('=== TEST CONNEXION SIMPLE ===');
    console.log('DATABASE_URL existe:', !!process.env.DATABASE_URL);
    
    // Test connexion basique
    const client = await pool.connect();
    console.log('✅ Connexion établie');
    
    // Test requête simple
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Requête exécutée:', result.rows[0]);
    
    // Test si utilisateur existe
    const userQuery = 'SELECT COUNT(*) as count FROM users WHERE email = $1';
    const userResult = await client.query(userQuery, ['nasalangiscard@gmail.com']);
    console.log('✅ Utilisateur check:', userResult.rows[0]);
    
    // Test table reset_tokens
    const tokenQuery = 'SELECT COUNT(*) as count FROM reset_tokens';
    const tokenResult = await client.query(tokenQuery);
    console.log('✅ Table reset_tokens:', tokenResult.rows[0]);
    
    client.release();
    
    return NextResponse.json({
      success: true,
      dbConnected: true,
      currentTime: result.rows[0].current_time,
      userExists: parseInt(userResult.rows[0].count) > 0,
      resetTokensTable: true,
      tokenCount: tokenResult.rows[0].count
    });
    
  } catch (error) {
    console.error('=== ERREUR TEST DB ===');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('======================');
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 });
  }
}