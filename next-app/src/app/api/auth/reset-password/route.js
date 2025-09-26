import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { NextResponse } from 'next/server';

// FORCER LE RUNTIME NODE.JS
export const runtime = "nodejs";

// Configuration de la connexion PostgreSQL directe
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function POST(req) {
  const { token, password, newPassword } = await req.json();
  
  // Accepter soit 'password' soit 'newPassword' pour compatibilité
  const passwordToUse = newPassword || password;
  
  if (!token || !passwordToUse) {
    return NextResponse.json({ error: 'Token et nouveau mot de passe requis' }, { status: 400 });
  }

  // Validation du mot de passe renforcée (même que côté client)
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  if (!passwordRegex.test(passwordToUse)) {
    return NextResponse.json({ 
      error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.' 
    }, { status: 400 });
  }

  try {
    // Vérifier le token de réinitialisation
    const tokenQuery = `
      SELECT email, "expiresAt", used 
      FROM reset_tokens 
      WHERE code = $1 AND used = false AND "expiresAt" > NOW()
    `;
    const tokenResult = await pool.query(tokenQuery, [token]);

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 400 });
    }

    const { email } = tokenResult.rows[0];

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(passwordToUse, 12);

    // Mettre à jour le mot de passe de l'utilisateur
    const updateUserQuery = `
      UPDATE users 
      SET password = $1, "updatedAt" = NOW() 
      WHERE email = $2
    `;
    await pool.query(updateUserQuery, [hashedPassword, email]);

    // Marquer le token comme utilisé
    const updateTokenQuery = `
      UPDATE reset_tokens 
      SET used = true, "updatedAt" = NOW() 
      WHERE code = $1
    `;
    await pool.query(updateTokenQuery, [token]);

    // Supprimer tous les autres tokens de cet utilisateur
    const deleteOtherTokensQuery = 'DELETE FROM reset_tokens WHERE email = $1 AND code != $2';
    await pool.query(deleteOtherTokensQuery, [email, token]);

    return NextResponse.json({ 
      success: true, 
      message: 'Mot de passe réinitialisé avec succès' 
    }, { status: 200 });

  } catch (error) {
    console.error('=== ERREUR RESET PASSWORD ===')
    console.error('Message:', error.message);
    console.error('==============================');
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la réinitialisation du mot de passe' 
    }, { status: 500 });
  }
}