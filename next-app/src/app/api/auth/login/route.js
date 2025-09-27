import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  createAuthCookies 
} from '@/utils/jwt';

// FORCER LE RUNTIME NODE.JS
export const runtime = "nodejs";

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
    const { email, password } = await request.json();
    
    console.log('=== CONNEXION JWT ===');
    console.log('Email:', email);
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
    }

    const client = await pool.connect();
    
    // Chercher l'utilisateur dans la base de données
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    client.release();

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
    }

    // Vérifier le mot de passe
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log('❌ Mot de passe incorrect');
      return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 });
    }

    // Générer les tokens JWT
    const payload = { 
      userId: user.id,
      email: user.email, 
      role: user.role 
    };
    
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    
    console.log('✅ Tokens générés pour:', user.email);
    
    // Créer la réponse avec les cookies sécurisés
    const response = NextResponse.json({ 
      success: true,
      user: { 
        id: user.id,
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      message: 'Connexion réussie'
    });
    
    // Ajouter les cookies d'authentification
    const [accessCookie, refreshCookie] = createAuthCookies(accessToken, refreshToken);
    response.headers.set('Set-Cookie', accessCookie);
    response.headers.append('Set-Cookie', refreshCookie);
    
    console.log('✅ Cookies sécurisés définis');
    console.log('=== FIN CONNEXION JWT ===');
    
    return response;
    
  } catch (error) {
    console.error('=== ERREUR CONNEXION ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================');
    
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' }, 
      { status: 500 }
    );
  }
}
