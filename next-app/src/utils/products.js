// Data and helpers for products (migrated from foodie/frontend/src/data/products.js)

// Fonction pour charger les produits via l'API côté client
export async function fetchProductsData() {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error('Erreur de chargement des produits');
  return await res.json();
}

export const productSections = [
  {
    title: "Plats du Midi",
    subtitle: "Nos spécialités quotidiennes",
    key: "plats_midi"
  },
  {
    title: "Grillades à la Carte",
    subtitle: "Viandes et poissons grillés",
    key: "a_la_carte"
  },
  {
    title: "Pizzas Artisanales",
    subtitle: "Pâtes fraîches et garnitures généreuses",
    key: "pizzas"
  },
  {
    title: "Boissons Traditionnelles",
    subtitle: "Jus naturels et boissons chaudes",
    key: "boissons"
  },
  {
    title: "Accompagnements",
    subtitle: "Complétez vos plats favoris",
    key: "accompagnements"
  },
  {
    title: "Desserts Gourmands",
    subtitle: "Douceurs pour finir en beauté",
    key: "desserts"
  }
];

export const formatPrice = (price) => {
  return `${price.toLocaleString('fr-FR')} F`;
};
