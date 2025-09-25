import sgMail from '@sendgrid/mail';

import { v4 as uuidv4 } from 'uuid';import sgMail from '@sendgrid/mail';

import { Pool } from 'pg';import { v4 as uuidv4 } from 'uuid';

import { PrismaClient } from "@prisma/client";

// Configuration de la connexion PostgreSQL directe

const pool = new Pool({const prisma = new PrismaClient();

  connectionString: process.env.DATABASE_URL,

  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : falseexport async function POST(req) {

});  const { email } = await req.json();

  if (!email) {

export async function POST(req) {    return new Response(JSON.stringify({ error: 'Email requis' }), { status: 400 });

  const { email } = await req.json();  }

  if (!email) {

    return new Response(JSON.stringify({ error: 'Email requis' }), { status: 400 });  try {

  }    // Vérifier si l'utilisateur existe

    const user = await prisma.user.findUnique({

  try {      where: { email }

    // Vérifier si l'utilisateur existe    });

    const userQuery = 'SELECT id, email FROM users WHERE email = $1';

    const userResult = await pool.query(userQuery, [email]);    if (!user) {

      return new Response(JSON.stringify({ error: 'Utilisateur non trouvé' }), { status: 404 });

    if (userResult.rows.length === 0) {    }

      return new Response(JSON.stringify({ error: 'Utilisateur non trouvé' }), { status: 404 });

    }    // Générer un token unique

    const token = uuidv4();

    // Générer un token unique    

    const token = uuidv4();    // Supprimer les anciens tokens pour cet email

        await prisma.resetToken.deleteMany({

    // Supprimer les anciens tokens pour cet email      where: { email }

    const deleteOldTokensQuery = 'DELETE FROM reset_tokens WHERE email = $1';    });

    await pool.query(deleteOldTokensQuery, [email]);

    // Créer le nouveau token avec expiration dans 1 heure

    // Créer le nouveau token avec expiration dans 1 heure    await prisma.resetToken.create({

    const insertTokenQuery = `      data: {

      INSERT INTO reset_tokens (email, code, expires_at, created_at, updated_at)         email,

      VALUES ($1, $2, $3, NOW(), NOW())        code: token,

    `;        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 heure

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure      }

    await pool.query(insertTokenQuery, [email, token, expiresAt]);    });



    // Lien de réinitialisation    // Lien de réinitialisation

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`;    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`;



    // Envoyer l'email avec SendGrid    // Envoyer l'email avec SendGrid

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {    const msg = {

      to: email,      to: email,

      from: 'alexandrenasalan1@outlook.fr',      from: 'alexandrenasalan1@outlook.fr',

      replyTo: 'alexandrenasalan1@outlook.fr',      replyTo: 'alexandrenasalan1@outlook.fr',

      templateId: 'd-4a2f20d2dfac4ed4b3c0f2d85bf5d2cf',      templateId: 'd-4a2f20d2dfac4ed4b3c0f2d85bf5d2cf',

      dynamic_template_data: {      dynamic_template_data: {

        resetUrl: resetUrl        resetUrl: resetUrl

      }      }

    };    };

        

    await sgMail.send(msg);    await sgMail.send(msg);

    return new Response(JSON.stringify({ success: true, message: 'Email de réinitialisation envoyé' }), { status: 200 });    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {  } catch (error) {

    console.error('Reset password error:', error);    console.error('Reset password error:', error);

    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });

  }  } finally {

}    await prisma.$disconnect();
  }
}
