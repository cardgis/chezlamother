
"use client";
import React from 'react';
import { ordersData } from '../utils/orders';
import { fetchProductsData } from '../utils/products';

// Marquer une commande comme payée (changer le statut à 'payée')
const handlePayOrder = (orderId) => {
  const newOrders = orders.map(order =>
    order.id === orderId
      ? { ...order, status: 'payée' }
      : order
  );
  fetch('/api/orders', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newOrders)
  })
    .then(res => res.json())
    .then(() => setOrders(newOrders));
};

const statusColors = {
  'en attente': 'bg-yellow-100 text-yellow-800',
  'validée': 'bg-green-100 text-green-800',
  'payée': 'bg-blue-100 text-blue-800',
  'annulée': 'bg-red-100 text-red-800',
};

export default function OrderList() {
  // Annuler une commande (changer le statut à 'annulée')
  const handleCancelOrder = (orderId) => {
    const newOrders = orders.map(order =>
      order.id === orderId
        ? { ...order, status: 'annulée' }
        : order
    );
    fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrders)
    })
      .then(res => res.json())
      .then(() => setOrders(newOrders));
    setEditOrderId(null);
  };
  // Annuler une commande (changer le statut à 'annulée')
  // Récupérer le nom de l'utilisateur connecté
  let currentUserName = '';
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        currentUserName = JSON.parse(user).name;
      } catch {}
    }
  }
  const [editOrderId, setEditOrderId] = React.useState(null);
  const [editOrders, setEditOrders] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  // Charger les commandes depuis l'API au montage
  React.useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);
  // Activer l'édition d'une commande
  const handleEditOrder = (orderId) => {
    setEditOrderId(orderId);
    setEditOrders(orders.map(o => ({ ...o }))); // Copie pour édition
  };

  // Sauvegarder la commande modifiée
  const handleSaveOrder = () => {
    fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editOrders)
    })
      .then(res => res.json())
      .then(() => {
        setOrders(editOrders);
        setEditOrderId(null);
      });
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditOrderId(null);
  };

  // Modifier la quantité en mode édition
  const handleEditChangeQuantity = (orderId, productId, newQty) => {
    setEditOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, products: order.products.map(p => p.id === productId ? { ...p, quantity: newQty } : p) }
        : order
    ));
  };

  // Supprimer un produit en mode édition
  const handleEditRemoveProduct = (orderId, productId) => {
    setEditOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, products: order.products.filter(p => p.id !== productId) }
        : order
    ));
  };

  // Ajouter un produit en mode édition
  const handleEditAddProduct = () => {
    if (!selectedProductId || !editOrderId) return;
    const product = productsData.find(p => String(p.id) === String(selectedProductId));
    if (!product) return;
    setEditOrders(prev => prev.map(order =>
      order.id === editOrderId
        ? {
            ...order,
            products: [...order.products, { id: product.id, name: product.name, quantity: 1, price: product.price }]
          }
        : order
    ));
    setSelectedProductId('');
  };
  // ...existing code...
  // ...existing code...

  // Liste de tous les produits disponibles
  const [productsData, setProductsData] = React.useState([]);
  React.useEffect(() => {
    fetchProductsData()
      .then(data => setProductsData(data))
      .catch(() => setProductsData([]));
  }, []);
  const [selectedProductId, setSelectedProductId] = React.useState('');
  const [selectedOrderId, setSelectedOrderId] = React.useState('');

  // Ajouter un produit à une commande
  const handleAddProduct = () => {
    if (!selectedProductId || !selectedOrderId) return;
    const product = productsData.find(p => String(p.id) === String(selectedProductId));
    if (!product) return;
    const newOrders = orders.map(order =>
      order.id === selectedOrderId
        ? {
            ...order,
            products: [...order.products, { id: product.id, name: product.name, quantity: 1, price: product.price }]
          }
        : order
    );
    fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrders)
    })
      .then(res => res.json())
      .then(() => {
        setOrders(newOrders);
        setSelectedProductId('');
        setSelectedOrderId('');
      });
  };

  // Supprimer un produit du panier
  const handleRemoveProduct = (orderId, productId) => {
    const newOrders = orders.map(order =>
      order.id === orderId
        ? { ...order, products: order.products.filter(p => p.id !== productId) }
        : order
    );
    fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrders)
    })
      .then(res => res.json())
      .then(() => setOrders(newOrders));
  };

  // Modifier la quantité d'un produit
  const handleChangeQuantity = (orderId, productId, newQty) => {
    const newOrders = orders.map(order =>
      order.id === orderId
        ? { ...order, products: order.products.map(p => p.id === productId ? { ...p, quantity: newQty } : p) }
        : order
    );
    fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrders)
    })
      .then(res => res.json())
      .then(() => setOrders(newOrders));
  };

  // Valider la commande (changer le statut en 'validée')
  const handleValidateOrder = (orderId) => {
    const newOrders = orders.map(order =>
      order.id === orderId
        ? { ...order, status: 'validée', date: new Date().toISOString().slice(0, 10) }
        : order
    );
    fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrders)
    })
      .then(res => res.json())
      .then(() => setOrders(newOrders));
  };

  return null;
}
