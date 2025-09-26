import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';
import { NextResponse } from 'next/server';

// FORCER LE RUNTIME NODE.JS (obligatoire pour SendGrid lib)
export const runtime = "nodejs";

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

    // Envoyer l'email avec SendGrid API directe (compatible Edge + Node.js)
    console.log('Configuration SendGrid:', {
      apiKeyExists: !!process.env.SENDGRID_API_KEY,
      apiKeyStart: process.env.SENDGRID_API_KEY?.substring(0, 8),
      email: email
    });

    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY manquante");
    }

    // Utilisation d'un template SendGrid (plus professionnel)
    const templateId = "d-VOTRE_TEMPLATE_ID"; // À remplacer par votre vrai template ID
    
    const sendGridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ 
          to: [{ email: email }],
          dynamic_template_data: {
            resetUrl: resetUrl,
            userEmail: email,
            // Ajoutez d'autres variables selon votre template
          }
        }],
        from: { 
          email: "alexandrenasalan1@outlook.fr", 
          name: "Chez La Mother" 
        },
        template_id: templateId
      }),
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error("SendGrid error:", sendGridResponse.status, errorText);
      throw new Error(`SendGrid ${sendGridResponse.status}: ${errorText}`);
    }

    console.log('Email envoyé avec succès via SendGrid API!');
    return NextResponse.json({ 
      success: true, 
      message: 'Email de réinitialisation envoyé avec succès' 
    }, { status: 200 });
    
  } catch (error) {
    console.error('=== ERREUR RESET PASSWORD ===');
    console.error('Message:', error.message);
    console.error('==============================');
    
    // Gestion d'erreurs spécifiques SendGrid
    if (error.message.includes('401')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuration email incorrecte. Contactez l\'administrateur.' 
      }, { status: 500 });
    }
    
    if (error.message.includes('403')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email non autorisé. Vérifiez votre adresse.' 
      }, { status: 500 });
    }
    
    if (error.message.includes('SENDGRID_API_KEY manquante')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuration email manquante.' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de l\'envoi de l\'email. Réessayez plus tard.' 
    }, { status: 500 });
  }
}
