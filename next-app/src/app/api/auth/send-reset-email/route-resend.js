import { pool } from '../../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Envoyer l'email avec Resend (alternative à SendGrid)
    console.log('Envoi email avec Resend vers:', email);
    
    const { data, error } = await resend.emails.send({
      from: 'Chez La Mother <onboarding@resend.dev>', // Adresse par défaut Resend
      to: [email],
      subject: 'Réinitialisation de votre mot de passe - Chez La Mother',
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
    });

    if (error) {
      console.error('Erreur Resend:', error);
      throw new Error(`Erreur Resend: ${error.message}`);
    }

    console.log('Email envoyé avec succès via Resend:', data);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email de réinitialisation envoyé avec succès' 
    }), { status: 200 });
    
  } catch (error) {
    console.error('=== ERREUR RESET PASSWORD (RESEND) ===');
    console.error('Message:', error.message);
    console.error('==============================');
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Erreur lors de l'envoi de l'email: ${error.message}` 
    }), { status: 500 });
  }
}