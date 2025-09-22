
import sgMail from '@sendgrid/mail';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  const { email } = await req.json();
  if (!email) {
    return new Response(JSON.stringify({ error: 'Email requis' }), { status: 400 });
  }

  try {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'Utilisateur non trouvé' }), { status: 404 });
    }

    // Générer un token unique
    const token = uuidv4();
    
    // Supprimer les anciens tokens pour cet email
    await prisma.resetToken.deleteMany({
      where: { email }
    });

    // Créer le nouveau token avec expiration dans 1 heure
    await prisma.resetToken.create({
      data: {
        email,
        code: token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 heure
      }
    });

    // Lien de réinitialisation
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`;

    // Envoyer l'email avec SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: email,
      from: 'alexandrenasalan1@outlook.fr',
      replyTo: 'alexandrenasalan1@outlook.fr',
      templateId: 'd-4a2f20d2dfac4ed4b3c0f2d85bf5d2cf',
      dynamic_template_data: {
        resetUrl: resetUrl
      }
    };
    
    await sgMail.send(msg);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
