import sgMail from '@sendgrid/mail';
import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';

// Configuration de la connexion PostgreSQL directe
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function POST(req) {
  const { email } = await req.json();
  if (!email) {
    return new Response(JSON.stringify({ error: 'Email requis' }), { status: 400 });
  }

  try {
    // Vérifier si l'utilisateur existe
    const userQuery = 'SELECT id, email FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Utilisateur non trouvé' }), { status: 404 });
    }

    // Générer un token unique
    const token = uuidv4();
    
    // Supprimer les anciens tokens pour cet email
    const deleteOldTokensQuery = 'DELETE FROM reset_tokens WHERE email = $1';
    await pool.query(deleteOldTokensQuery, [email]);

    // Créer le nouveau token avec expiration dans 1 heure
    const insertTokenQuery = `
      INSERT INTO reset_tokens (email, code, expires_at, created_at, updated_at) 
      VALUES ($1, $2, $3, NOW(), NOW())
    `;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure
    await pool.query(insertTokenQuery, [email, token, expiresAt]);

    // Lien de réinitialisation
    const baseUrl = 'https://chezlamother.vercel.app';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    // Envoyer l'email avec SendGrid (avec retry automatique)
    console.log('Configuration SendGrid:', {
      apiKeyExists: !!process.env.SENDGRID_API_KEY,
      apiKeyStart: process.env.SENDGRID_API_KEY?.substring(0, 8),
      email: email
    });

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: email,
      from: 'alexandrenasalan1@outlook.fr',
      replyTo: 'alexandrenasalan1@outlook.fr',
      subject: 'Réinitialisation de votre mot de passe - Chez La Mother',
      text: `Bonjour,\n\nVous avez demandé la réinitialisation de votre mot de passe.\n\nCliquez sur ce lien pour réinitialiser votre mot de passe :\n${resetUrl}\n\nCe lien expire dans 1 heure.\n\nSi vous n'avez pas demandé cette réinitialisation, ignorez cet email.\n\nÉquipe Chez La Mother`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d97706;">Réinitialisation de votre mot de passe</h2>
          <p>Bonjour,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Chez La Mother.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p><strong>Ce lien expire dans 1 heure.</strong></p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Équipe Chez La Mother</p>
        </div>
      `
    };
    
    // Retry automatique en cas d'échec réseau
    let emailSent = false;
    let lastError = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Tentative ${attempt}/3 d'envoi email vers:`, email);
        await sgMail.send(msg);
        console.log('Email envoyé avec succès!');
        emailSent = true;
        break;
      } catch (retryError) {
        console.log(`Échec tentative ${attempt}:`, retryError.message);
        lastError = retryError;
        if (attempt < 3) {
          // Attendre 2 secondes avant la prochaine tentative
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    if (!emailSent) {
      throw lastError;
    }
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email de réinitialisation envoyé avec succès' 
    }), { status: 200 });
    
  } catch (error) {
    console.error('=== ERREUR RESET PASSWORD (SENDGRID) ===');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('==============================');
    
    // Gestion d'erreurs spécifiques SendGrid
    if (error.code === 'ENOTFOUND') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Problème temporaire de réseau. Réessayez dans quelques minutes.' 
      }), { status: 500 });
    }
    
    if (error.response && error.response.status === 401) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Configuration email incorrecte. Contactez l\'administrateur.' 
      }), { status: 500 });
    }
    
    if (error.response && error.response.status === 403) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email non autorisé. Vérifiez votre adresse.' 
      }), { status: 500 });
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur temporaire. Réessayez dans quelques minutes.' 
    }), { status: 500 });
  }
}
