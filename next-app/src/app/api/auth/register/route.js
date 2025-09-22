import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '../../../../lib/prisma';

export async function POST(request) {
  try {
    const { name, email, password, role, phone } = await request.json();
    
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
    }
    
    // Password strength validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial." }, { status: 400 });
    }
    
    // Normalisation du numéro (enlève espaces, tirets, points, accepte +221 ou 00221)
    let normalizedPhone = phone;
    if (phone) {
      normalizedPhone = phone.replace(/[\s\-.]/g, "");
      // Accepte +221 ou 00221 ou rien
      const regex = /^(\+221|00221)?[7-9][0-9]{8}$/;
      if (regex.test(normalizedPhone)) {
        // Ajoute le préfixe +221 si absent
        if (!normalizedPhone.startsWith("+221")) {
          normalizedPhone = "+221" + normalizedPhone.replace(/^00221/, "");
        }
      } else {
        return NextResponse.json({ error: "Format du numéro invalide. Exemple: +221 78 879 43 71 ou +221788794371" }, { status: 400 });
      }
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email déjà utilisé.' }, { status: 409 });
    }

    // Hasher le mot de passe et créer l'utilisateur
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone: normalizedPhone || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true
      }
    });

    return NextResponse.json({ 
      message: 'Inscription réussie.',
      user: newUser
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' }, 
      { status: 500 }
    );
  }
}
