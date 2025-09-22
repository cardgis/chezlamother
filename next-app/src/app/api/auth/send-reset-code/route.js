import { NextResponse } from "next/server";
import twilio from "twilio";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fonction pour générer un code à 6 chiffres
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Twilio config (remplace par tes infos réelles)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;
if (!accountSid || !authToken || !twilioPhone) {
  console.error('Twilio env variables missing:', { accountSid, authToken, twilioPhone });
}
const client = twilio(accountSid, authToken);

export async function POST(req) {
  const { phone } = await req.json();
  if (!phone) {
    return NextResponse.json({ error: "Numéro de téléphone requis." }, { status: 400 });
  }

  try {
    // Cherche l'utilisateur par numéro dans Prisma
    const normalize = num => num.replace(/[\s\-.]/g, "").replace(/^\+/, "").replace(/^00221/, "221");
    const normalizedPhone = normalize(phone);
    
    const user = await prisma.user.findFirst({
      where: {
        phone: {
          contains: normalizedPhone
        }
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé pour ce numéro." }, { status: 404 });
    }

    // Limitation anti-abus (1 demande/minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentToken = await prisma.resetToken.findFirst({
      where: {
        email: user.email,
        createdAt: {
          gte: oneMinuteAgo
        }
      }
    });

    if (recentToken) {
      return NextResponse.json({ error: "Veuillez patienter avant une nouvelle demande." }, { status: 429 });
    }

    // Supprimer les anciens tokens expirés pour cet utilisateur
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    await prisma.resetToken.deleteMany({
      where: {
        email: user.email,
        createdAt: {
          lt: tenMinutesAgo
        }
      }
    });

    // Génération du code et sauvegarde en base
    const code = generateCode();
    await prisma.resetToken.create({
      data: {
        email: user.email,
        code: code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      }
    });

    // Envoi du code par SMS (Twilio)
    try {
      await client.messages.create({
        body: `Votre code de réinitialisation : ${code}`,
        from: twilioPhone,
        to: phone
      });
    } catch (e) {
      console.error("Twilio error:", e);
      return NextResponse.json({ error: "Erreur d'envoi SMS", details: e.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
