import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  const { token, password } = await req.json();
  
  // Password strength validation
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial." }, { status: 400 });
  }
  
  if (!token || !password) {
    return NextResponse.json({ error: "Token et mot de passe requis." }, { status: 400 });
  }

  try {
    // Chercher le token valide dans Prisma
    const resetToken = await prisma.resetToken.findFirst({
      where: {
        code: token,
        used: false,
        expiresAt: {
          gt: new Date() // Token non expiré
        }
      }
    });

    if (!resetToken) {
      return NextResponse.json({ error: "Token invalide ou expiré." }, { status: 400 });
    }

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé." }, { status: 400 });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    });

    // Marquer le token comme utilisé
    await prisma.resetToken.update({
      where: { id: resetToken.id },
      data: { used: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
