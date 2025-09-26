import { v4 as uuidv4 } from 'uuid';
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
  console.log('=== DÉBUT SEND RESET EMAIL ===');
  
  try {
    const { email } = await req.json();
    console.log('Email reçu:', email);
    
    if (!email) {
      console.log('❌ Email manquant');
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    console.log('🔌 Test connexion DB...');
    const client = await pool.connect();
    console.log('✅ DB connectée');

    // Vérifier si l'utilisateur existe
    console.log('🔍 Recherche utilisateur...');
    const userQuery = 'SELECT id, email FROM users WHERE email = $1';
    const userResult = await client.query(userQuery, [email]);
    console.log('Résultat utilisateur:', userResult.rows.length);

    if (userResult.rows.length === 0) {
      client.release();
      console.log('❌ Utilisateur non trouvé');
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Générer un token unique
    const token = uuidv4();
    console.log('🔑 Token généré:', token.substring(0, 8) + '...');
    
    // Supprimer les anciens tokens
    console.log('🧹 Suppression anciens tokens...');
    const deleteOldTokensQuery = 'DELETE FROM reset_tokens WHERE email = $1';
    await client.query(deleteOldTokensQuery, [email]);

    // Créer le nouveau token
    console.log('💾 Création nouveau token...');
    try {
      const insertTokenQuery = `
        INSERT INTO reset_tokens (email, code, "expiresAt") 
        VALUES ($1, $2, $3)
      `;
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure
      console.log('💾 Paramètres insertion:', { email, token: token.substring(0, 8) + '...', expiresAt });
      
      const insertResult = await client.query(insertTokenQuery, [email, token, expiresAt]);
      console.log('✅ Token sauvé en DB, résultat:', insertResult.rowCount);
    } catch (insertError) {
      console.error('❌ ERREUR INSERTION TOKEN:', insertError.message);
      console.error('❌ Stack:', insertError.stack);
      client.release();
      return NextResponse.json({ 
        success: false, 
        error: `Erreur insertion token: ${insertError.message}` 
      }, { status: 500 });
    }

    client.release();

    // Lien de réinitialisation
    const baseUrl = 'https://chezlamother.vercel.app';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
    console.log('🔗 Reset URL créée');

    // Envoyer l'email avec votre template SendGrid
    console.log('📧 Envoi email SendGrid...');
    console.log('API Key existe:', !!process.env.SENDGRID_API_KEY);
    
    if (!process.env.SENDGRID_API_KEY) {
      console.log('❌ SENDGRID_API_KEY manquante');
      return NextResponse.json({ error: 'Configuration email manquante' }, { status: 500 });
    }

    const templateId = "d-4a2f20d2dfac4ed4b3c0f2d85bf5d2cf";
    
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
            userName: email.split('@')[0],
            siteName: "Chez La Mother"
          }
        }],
        from: { 
          email: "alexandrenasalan1@outlook.fr", 
          name: "Chez La Mother" 
        },
        template_id: templateId
      }),
    });

    console.log('SendGrid Status:', sendGridResponse.status);

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error('❌ SendGrid error:', sendGridResponse.status, errorText);
      return NextResponse.json({ 
        success: false, 
        error: `Erreur SendGrid: ${errorText}` 
      }, { status: 500 });
    }

    console.log('✅ Email envoyé avec succès!');
    console.log('=== FIN SEND RESET EMAIL ===');

    return NextResponse.json({ 
      success: true, 
      message: 'Email de réinitialisation envoyé avec succès' 
    }, { status: 200 });
    
  } catch (error) {
    console.error('=== ERREUR SEND RESET EMAIL ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('===============================');
    
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de l\'envoi de l\'email. Réessayez plus tard.' 
    }, { status: 500 });
  }
}