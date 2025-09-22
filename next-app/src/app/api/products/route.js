import prisma from '../../../lib/prisma';

// Fonction pour créer une description courte
function createShortDescription(description, maxLength = 80) {
  if (!description) return '';
  if (description.length <= maxLength) return description;
  
  // Couper au dernier mot complet avant la limite
  const truncated = description.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.6) { // Si on a au moins 60% du texte
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        id: 'asc'
      }
    });
    
    // Ajouter shortDescription à chaque produit
    const productsWithShortDesc = products.map(product => ({
      ...product,
      shortDescription: createShortDescription(product.description)
    }));
    
    return new Response(JSON.stringify(productsWithShortDesc), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la récupération des produits' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function PUT(request) {
  try {
    const products = await request.json();
    
    // Mettre à jour chaque produit
    for (const product of products) {
      await prisma.product.upsert({
        where: { id: product.id },
        update: {
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          subcategory: product.subcategory,
          dayAvailable: product.dayAvailable || null,
          available: product.available !== false,
          image: product.image || null,
          rating: product.rating || null,
          reviews: product.reviews || null,
        },
        create: {
          slug: product.slug,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          subcategory: product.subcategory,
          dayAvailable: product.dayAvailable || null,
          available: product.available !== false,
          image: product.image || null,
          rating: product.rating || null,
          reviews: product.reviews || null,
        },
      });
    }
    
    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des produits:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la mise à jour des produits' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
