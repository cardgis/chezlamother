import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

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
    return new Response(JSON.stringify({ error: 'Token et nouveau mot de passe requis' }), { status: 400 });
  }

  if (passwordToUse.length < 6) {
    return new Response(JSON.stringify({ error: 'Le mot de passe doit contenir au moins 6 caractères' }), { status: 400 });
  }

  try {
    // Vérifier le token de réinitialisation
    const tokenQuery = `
      SELECT email, expires_at, used 
      FROM reset_tokens 
      WHERE code = $1 AND used = false AND expires_at > NOW()
    `;
    const tokenResult = await pool.query(tokenQuery, [token]);

    if (tokenResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Token invalide ou expiré' }), { status: 400 });
    }

    const { email } = tokenResult.rows[0];

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(passwordToUse, 12);

    // Mettre à jour le mot de passe de l'utilisateur
    const updateUserQuery = `
      UPDATE users 
      SET password = $1, updated_at = NOW() 
      WHERE email = $2
    `;
    await pool.query(updateUserQuery, [hashedPassword, email]);

    // Marquer le token comme utilisé
    const updateTokenQuery = `
      UPDATE reset_tokens 
      SET used = true, updated_at = NOW() 
      WHERE code = $1
    `;
    await pool.query(updateTokenQuery, [token]);

    // Supprimer tous les autres tokens de cet utilisateur
    const deleteOtherTokensQuery = 'DELETE FROM reset_tokens WHERE email = $1 AND code != $2';
    await pool.query(deleteOtherTokensQuery, [email, token]);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Mot de passe réinitialisé avec succès' 
    }), { status: 200 });

  } catch (error) {
    console.error('Reset password error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur lors de la réinitialisation du mot de passe' 
    }), { status: 500 });
  }
}