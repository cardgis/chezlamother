import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

// Fonction pour créer une description courte
function createShortDescription(description, maxLength = 80) {
  if (!description) return '';
  if (description.length <= maxLength) return description;
  
  const truncated = description.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.6) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params; // Await params for Next.js 15 compatibility
    const { id } = resolvedParams;

    function slugify(str) {
      return String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // retire les accents
        .replace(/['']/g, '') // retire apostrophes
        .replace(/\s+/g, '-')
        .replace(/[()]/g, '')
        .replace(/[^a-zA-Z0-9\-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
    }

    // Chercher le produit par ID ou par slug
    let product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: isNaN(parseInt(id)) ? undefined : parseInt(id) },
          { slug: String(id) }
        ]
      }
    });

    // Si pas trouvé par slug, essayer avec le nom slugifié
    if (!product) {
      const allProducts = await prisma.product.findMany();
      product = allProducts.find(p => slugify(p.name) === String(id));
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Retourner maximum 4 produits similaires
    // Priorité à la sous-catégorie, puis à la catégorie si pas assez de résultats
    let similar = await prisma.product.findMany({
      where: {
        AND: [
          { id: { not: product.id } },
          { subcategory: product.subcategory }
        ]
      },
      take: 4
    });
    
    // Si moins de 4 produits avec la même sous-catégorie, compléter avec la même catégorie
    if (similar.length < 4) {
      const existingIds = similar.map(p => p.id);
      const additionalProducts = await prisma.product.findMany({
        where: {
          AND: [
            { id: { not: product.id } },
            { id: { notIn: existingIds } },
            { category: product.category },
            { subcategory: { not: product.subcategory } }
          ]
        },
        take: 4 - similar.length
      });
      similar = [...similar, ...additionalProducts];
    }
    
    // Ajouter shortDescription aux produits similaires
    const similarWithShortDesc = similar.map(product => ({
      ...product,
      shortDescription: createShortDescription(product.description)
    }));
    
    return NextResponse.json(similarWithShortDesc);
  } catch (e) {
    console.error('Erreur dans l\'API des produits similaires:', e);
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}