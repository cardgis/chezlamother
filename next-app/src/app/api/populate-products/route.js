import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Données des produits de Chez La Mother
const productsData = [
  // Plats du Midi
  {
    slug: 'yassa-poulet',
    name: 'Yassa Poulet',
    description: 'Poulet mariné au citron et oignons, servi avec du riz et des légumes',
    shortDescription: 'Poulet mariné au citron et oignons',
    price: 15000,
    category: 'plats_midi',
    subcategory: 'plats_principaux',
    dayAvailable: 'tous_les_jours',
    available: true,
    image: '/images/yassa-poulet.jpg',
    rating: 4.8,
    reviews: 45
  },
  {
    slug: 'mafe-beef',
    name: 'Mafé Bœuf',
    description: 'Bœuf mijoté dans une sauce arachide crémeuse, servi avec du riz',
    shortDescription: 'Bœuf dans une sauce arachide crémeuse',
    price: 18000,
    category: 'plats_midi',
    subcategory: 'plats_principaux',
    dayAvailable: 'lundi',
    available: true,
    image: '/images/mafe-beef.jpg',
    rating: 4.7,
    reviews: 32
  },
  {
    slug: 'thieb-djenne',
    name: 'Thiéb Dienne',
    description: 'Poisson frais cuit dans une sauce tomate avec riz et légumes',
    shortDescription: 'Poisson frais en sauce tomate',
    price: 20000,
    category: 'plats_midi',
    subcategory: 'plats_principaux',
    dayAvailable: 'mardi',
    available: true,
    image: '/images/thieb-djenne.jpg',
    rating: 4.9,
    reviews: 28
  },
  {
    slug: 'grilled-fish',
    name: 'Poisson Grillé',
    description: 'Poisson frais grillé avec légumes et sauce spéciale',
    shortDescription: 'Poisson frais grillé avec légumes',
    price: 17000,
    category: 'plats_midi',
    subcategory: 'plats_principaux',
    dayAvailable: 'mercredi',
    available: true,
    image: '/images/grilled-fish.jpg',
    rating: 4.6,
    reviews: 19
  },
  {
    slug: 'chicken-curry',
    name: 'Poulet Curry',
    description: 'Poulet au curry avec riz basmati et légumes',
    shortDescription: 'Poulet au curry épicé',
    price: 16000,
    category: 'plats_midi',
    subcategory: 'plats_principaux',
    dayAvailable: 'jeudi',
    available: true,
    image: '/images/chicken-curry.jpg',
    rating: 4.5,
    reviews: 22
  },
  {
    slug: 'lamb-stew',
    name: 'Ragoût d\'Agneau',
    description: 'Agneau tendre mijoté avec légumes et épices',
    shortDescription: 'Agneau tendre mijoté aux épices',
    price: 19000,
    category: 'plats_midi',
    subcategory: 'plats_principaux',
    dayAvailable: 'vendredi',
    available: true,
    image: '/images/lamb-stew.jpg',
    rating: 4.7,
    reviews: 15
  },

  // À la carte - Grillades
  {
    slug: 'grilled-chicken',
    name: 'Poulet Grillé',
    description: 'Poulet grillé mariné aux épices africaines',
    shortDescription: 'Poulet grillé aux épices',
    price: 12000,
    category: 'a_la_carte',
    subcategory: 'grillades',
    available: true,
    image: '/images/grilled-chicken.jpg',
    rating: 4.4,
    reviews: 38
  },
  {
    slug: 'beef-kebab',
    name: 'Kebab Bœuf',
    description: 'Brochettes de bœuf grillées avec légumes',
    shortDescription: 'Brochettes de bœuf grillées',
    price: 14000,
    category: 'a_la_carte',
    subcategory: 'grillades',
    available: true,
    image: '/images/beef-kebab.jpg',
    rating: 4.3,
    reviews: 25
  },
  {
    slug: 'grilled-fish-steak',
    name: 'Steak de Poisson',
    description: 'Steak de poisson frais grillé',
    shortDescription: 'Steak de poisson grillé',
    price: 15000,
    category: 'a_la_carte',
    subcategory: 'grillades',
    available: true,
    image: '/images/grilled-fish-steak.jpg',
    rating: 4.5,
    reviews: 31
  },

  // Accompagnements
  {
    slug: 'jollof-rice',
    name: 'Riz Jollof',
    description: 'Riz parfumé à la tomate et aux épices',
    shortDescription: 'Riz parfumé à la tomate',
    price: 3000,
    category: 'accompagnements',
    subcategory: 'riz',
    available: true,
    image: '/images/jollof-rice.jpg',
    rating: 4.2,
    reviews: 67
  },
  {
    slug: 'fried-rice',
    name: 'Riz Cantonais',
    description: 'Riz frit avec légumes et œufs',
    shortDescription: 'Riz frit aux légumes',
    price: 3500,
    category: 'accompagnements',
    subcategory: 'riz',
    available: true,
    image: '/images/fried-rice.jpg',
    rating: 4.1,
    reviews: 43
  },
  {
    slug: 'plantains',
    name: 'Bananes Plantains',
    description: 'Bananes plantains frites croustillantes',
    shortDescription: 'Bananes plantains frites',
    price: 2500,
    category: 'accompagnements',
    subcategory: 'frites',
    available: true,
    image: '/images/plantains.jpg',
    rating: 4.0,
    reviews: 52
  },
  {
    slug: 'french-fries',
    name: 'Frites',
    description: 'Frites dorées et croustillantes',
    shortDescription: 'Frites dorées croustillantes',
    price: 2000,
    category: 'accompagnements',
    subcategory: 'frites',
    available: true,
    image: '/images/french-fries.jpg',
    rating: 3.9,
    reviews: 78
  },

  // Pizzas
  {
    slug: 'margherita-pizza',
    name: 'Pizza Margherita',
    description: 'Tomate, mozzarella, basilic frais',
    shortDescription: 'Tomate, mozzarella, basilic',
    price: 8000,
    category: 'pizzas',
    subcategory: 'classiques',
    available: true,
    image: '/images/margherita-pizza.jpg',
    rating: 4.3,
    reviews: 29
  },
  {
    slug: 'chicken-pizza',
    name: 'Pizza Poulet',
    description: 'Poulet grillé, fromage, légumes',
    shortDescription: 'Poulet grillé et fromage',
    price: 10000,
    category: 'pizzas',
    subcategory: 'speciales',
    available: true,
    image: '/images/chicken-pizza.jpg',
    rating: 4.4,
    reviews: 21
  },

  // Boissons
  {
    slug: 'jus-orange',
    name: 'Jus d\'Orange',
    description: 'Jus d\'orange frais pressé',
    shortDescription: 'Jus d\'orange frais',
    price: 2000,
    category: 'boissons',
    subcategory: 'jus_naturels',
    available: true,
    image: '/images/jus-orange.jpg',
    rating: 4.1,
    reviews: 89
  },
  {
    slug: 'jus-bissap',
    name: 'Jus de Bissap',
    description: 'Jus d\'hibiscus rafraîchissant',
    shortDescription: 'Jus d\'hibiscus traditionnel',
    price: 1500,
    category: 'boissons',
    subcategory: 'jus_traditionnels',
    available: true,
    image: '/images/jus-bissap.jpg',
    rating: 4.2,
    reviews: 76
  },
  {
    slug: 'cafe-au-lait',
    name: 'Café au Lait',
    description: 'Café chaud avec du lait',
    shortDescription: 'Café chaud avec lait',
    price: 1000,
    category: 'boissons',
    subcategory: 'chaudes',
    available: true,
    image: '/images/cafe-au-lait.jpg',
    rating: 3.8,
    reviews: 45
  },

  // Desserts
  {
    slug: 'chocolate-cake',
    name: 'Gâteau au Chocolat',
    description: 'Gâteau au chocolat fondant',
    shortDescription: 'Gâteau au chocolat fondant',
    price: 4000,
    category: 'desserts',
    subcategory: 'gateaux',
    available: true,
    image: '/images/chocolate-cake.jpg',
    rating: 4.5,
    reviews: 34
  },
  {
    slug: 'fruit-salad',
    name: 'Salade de Fruits',
    description: 'Mélange de fruits frais de saison',
    shortDescription: 'Fruits frais de saison',
    price: 3000,
    category: 'desserts',
    subcategory: 'salades',
    available: true,
    image: '/images/fruit-salad.jpg',
    rating: 4.0,
    reviews: 28
  }
];

export async function GET() {
  const client = await pool.connect();

  try {
    console.log('📦 Import des produits...\n');

    console.log(`📊 ${productsData.length} produits à importer`);

    for (const product of productsData) {
      const query = `
        INSERT INTO products (
          slug, name, description, "shortDescription", price, category, subcategory,
          "dayAvailable", available, image, rating, reviews, "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING
      `;

      const values = [
        product.slug,
        product.name,
        product.description,
        product.shortDescription || null,
        Math.round(parseFloat(product.price) * 100), // Convertir en centimes
        product.category,
        product.subcategory,
        product.dayAvailable || null,
        product.available !== false,
        product.image || null,
        product.rating || null,
        product.reviews || 0
      ];

      await client.query(query, values);
      console.log(`✅ Produit ajouté: ${product.name}`);
    }

    client.release();

    return NextResponse.json({
      success: true,
      message: `${productsData.length} produits importés avec succès`
    });

  } catch (error) {
    client.release();
    console.error('❌ Erreur lors de l\'import des produits :', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'import des produits', details: error.message },
      { status: 500 }
    );
  }
}