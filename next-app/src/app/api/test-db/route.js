import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function GET() {
  try {
    console.log('=== TEST BASE DE DONNÉES ===');
    console.log('DATABASE_URL existe:', !!process.env.DATABASE_URL);
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connexion DB établie');
    
    // Test si utilisateur existe
    const userQuery = 'SELECT id, email FROM users WHERE email = $1';
    const userResult = await client.query(userQuery, ['nasalangiscard@gmail.com']);
    
    console.log('Utilisateur trouvé:', userResult.rows.length > 0);
    if (userResult.rows.length > 0) {
      console.log('Email utilisateur:', userResult.rows[0].email);
    }
    
    // Test si table reset_tokens existe
    const tableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'reset_tokens'
      );
    `;
    const tableResult = await client.query(tableQuery);
    console.log('Table reset_tokens existe:', tableResult.rows[0].exists);
    
    client.release();
    
    return NextResponse.json({
      dbConnected: true,
      userExists: userResult.rows.length > 0,
      resetTokensTableExists: tableResult.rows[0].exists,
      userEmail: userResult.rows[0]?.email || null
    });
    
  } catch (error) {
    console.error('=== ERREUR DB ===');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('================');
    
    return NextResponse.json({
      error: error.message,
      code: error.code,
      dbConnected: false
    }, { status: 500 });
  }
}