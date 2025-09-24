import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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

export async function POST(request) {
  try {
    const { name, email, password, role, phone } = await request.json();
    
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
    }
    
    // Password strength validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial." }, { status: 400 });
    }
    
    // Normalisation du numéro (enlève espaces, tirets, points, accepte +221 ou 00221)
    let normalizedPhone = phone;
    if (phone) {
      normalizedPhone = phone.replace(/[\s\-.]/g, "");
      // Accepte +221 ou 00221 ou rien
      const regex = /^(\+221|00221)?[7-9][0-9]{8}$/;
      if (regex.test(normalizedPhone)) {
        // Ajoute le préfixe +221 si absent
        if (!normalizedPhone.startsWith("+221")) {
          normalizedPhone = "+221" + normalizedPhone.replace(/^00221/, "");
        }
      } else {
        return NextResponse.json({ error: "Format du numéro invalide. Exemple: +221 78 879 43 71 ou +221788794371" }, { status: 400 });
      }
    }

    // Vérifier si l'utilisateur existe déjà
    const client = await pool.connect();
    
    const existingResult = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingResult.rows.length > 0) {
      client.release();
      return NextResponse.json({ error: 'Email déjà utilisé.' }, { status: 409 });
    }

    // Hasher le mot de passe et créer l'utilisateur
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await client.query(`
      INSERT INTO users (name, email, password, role, phone, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, name, email, role, phone, "createdAt"
    `, [name, email, hashedPassword, role, normalizedPhone || null]);
    
    const newUser = result.rows[0];
    client.release();

    return NextResponse.json({ 
      message: 'Inscription réussie.',
      user: newUser
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:', error);
    console.error('📋 Détails:', {
      message: error.message,
      code: error.code,
      stack: error.stack?.substring(0, 500)
    });
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'inscription',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { status: 500 }
    );
  }
}
