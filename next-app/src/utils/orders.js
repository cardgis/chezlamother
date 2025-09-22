// Exemple de structure de commandes
export const ordersData = [
  {
    id: 'CMD001',
    date: '2025-09-05',
    status: 'en attente',
    client: 'Client 1',
    products: [
      { id: 2, name: 'Mafé Bœuf', quantity: 1, price: 1500 },
      { id: 5, name: 'Thiéb Rouge', quantity: 2, price: 1500 }
    ]
  },
  {
    id: 'CMD002',
    date: '2025-09-05',
    status: 'validée',
    client: 'Client 2',
    products: [
      { id: 7, name: 'Pizza Régina', quantity: 1, price: 2500 }
    ]
  }
];
