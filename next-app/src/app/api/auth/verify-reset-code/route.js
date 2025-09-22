import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  const { phone, code } = await req.json();
  
  if (!phone || !code) {
    return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
  }

  try {
    // Chercher l'utilisateur par téléphone
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
      return NextResponse.json({ error: "Utilisateur non trouvé." }, { status: 404 });
    }

    // Chercher le code de réinitialisation valide
    const resetToken = await prisma.resetToken.findFirst({
      where: {
        email: user.email,
        code: code,
        used: false,
        expiresAt: {
          gt: new Date() // Code non expiré
        }
      }
    });

    if (!resetToken) {
      return NextResponse.json({ error: "Code expiré ou inexistant." }, { status: 400 });
    }

    // Marquer le code comme utilisé et générer un token pour la réinitialisation
    await prisma.resetToken.update({
      where: { id: resetToken.id },
      data: { used: true }
    });

    // Créer un nouveau token pour la page de réinitialisation
    const resetPasswordToken = await prisma.resetToken.create({
      data: {
        email: user.email,
        code: `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      }
    });

    return NextResponse.json({ 
      success: true, 
      resetToken: resetPasswordToken.code 
    });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
