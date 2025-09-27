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
  console.log('=== DÉBUT RESET PASSWORD ===');
  
  const { token, password, newPassword } = await req.json();
  console.log('Token reçu:', token ? token.substring(0, 8) + '...' : 'undefined');
  
  // Accepter soit 'password' soit 'newPassword' pour compatibilité
  const passwordToUse = newPassword || password;
  console.log('Mot de passe reçu:', passwordToUse ? 'Oui (' + passwordToUse.length + ' chars)' : 'undefined');
  
  if (!token || !passwordToUse) {
    console.log('❌ Données manquantes - Token:', !!token, 'Password:', !!passwordToUse);
    return NextResponse.json({ error: 'Token et nouveau mot de passe requis' }, { status: 400 });
  }

  // Validation du mot de passe renforcée (même que côté client)
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  if (!passwordRegex.test(passwordToUse)) {
    console.log('❌ Mot de passe invalide - Regex failed');
    return NextResponse.json({ 
      error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.' 
    }, { status: 400 });
  }
  
  console.log('✅ Validation mot de passe OK');

  try {
    console.log('🔍 Vérification token...');
    // Vérifier le token de réinitialisation
    const tokenQuery = `
      SELECT email, "expiresAt", used 
      FROM reset_tokens 
      WHERE code = $1 AND used = false AND "expiresAt" > NOW()
    `;
    const tokenResult = await pool.query(tokenQuery, [token]);
    console.log('🔍 Résultat token:', tokenResult.rows.length, 'tokens trouvés');

    if (tokenResult.rows.length === 0) {
      console.log('❌ Token invalide, expiré ou déjà utilisé');
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 400 });
    }

    const { email } = tokenResult.rows[0];
    console.log('✅ Token valide pour:', email);

    // Hasher le nouveau mot de passe
    console.log('🔐 Hashage mot de passe...');
    const hashedPassword = await bcrypt.hash(passwordToUse, 12);
    console.log('✅ Mot de passe hashé');

    // Mettre à jour le mot de passe de l'utilisateur
    console.log('💾 Mise à jour utilisateur...');
    const updateUserQuery = `
      UPDATE users 
      SET password = $1 
      WHERE email = $2
    `;
    await pool.query(updateUserQuery, [hashedPassword, email]);
    console.log('✅ Utilisateur mis à jour');

    // Marquer le token comme utilisé
    console.log('🔒 Marquage token comme utilisé...');
    const updateTokenQuery = `
      UPDATE reset_tokens 
      SET used = true 
      WHERE code = $1
    `;
    await pool.query(updateTokenQuery, [token]);
    console.log('✅ Token marqué comme utilisé');

    // Supprimer tous les autres tokens de cet utilisateur
    console.log('🧹 Nettoyage autres tokens...');
    const deleteOtherTokensQuery = 'DELETE FROM reset_tokens WHERE email = $1 AND code != $2';
    const cleanupResult = await pool.query(deleteOtherTokensQuery, [email, token]);
    console.log('✅ Nettoyage terminé:', cleanupResult.rowCount, 'tokens supprimés');

    console.log('🎉 Reset password réussi !');
    console.log('=== FIN RESET PASSWORD ===');

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