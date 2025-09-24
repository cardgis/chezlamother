import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
    }

    const client = await pool.connect();
    
    // Chercher l'utilisateur dans la base de données
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    client.release();

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
    }

    // Vérifier le mot de passe
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 });
    }

    // Générer le token JWT
    const token = jwt.sign({ 
      userId: user.id,
      email: user.email, 
      role: user.role 
    }, JWT_SECRET, { expiresIn: '2h' });
    
    return NextResponse.json({ 
      token, 
      user: { 
        id: user.id,
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' }, 
      { status: 500 }
    );
  }
}
