import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Client PostgreSQL direct pour Neon
const NEON_DB_URL = 'postgres://default:UpPh5bCk6iSZ@ep-snowy-union-a4t26bx0-pooler.us-east-1.aws.neon.tech/verceldb?pgbouncer=true&connect_timeout=15&sslmode=require';

const pool = new Pool({
  connectionString: process.env.NODE_ENV === 'production' ? NEON_DB_URL : (process.env.DATABASE_URL || NEON_DB_URL),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function GET() {
  try {
    console.log('🧪 Test de l\'API d\'inscription');
    
    const client = await pool.connect();
    
    // Tester la connexion
    const testQuery = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`📊 ${testQuery.rows[0].count} utilisateurs dans la base`);
    
    // Tester la structure de la table users
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    client.release();
    
    return NextResponse.json({
      success: true,
      message: 'API d\'inscription fonctionnelle',
      userCount: parseInt(testQuery.rows[0].count),
      tableStructure: structure.rows,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erreur test inscription:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('📋 Test POST inscription avec:', {
      name: body.name,
      email: body.email,
      role: body.role,
      hasPassword: !!body.password
    });
    
    return NextResponse.json({
      success: true,
      message: 'Test POST réussi',
      receivedFields: Object.keys(body)
    });
    
  } catch (error) {
    console.error('❌ Erreur test POST:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}