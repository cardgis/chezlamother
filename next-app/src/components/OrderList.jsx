"use client";
import React, { useState, useEffect } from "react";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('paid');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Auto-refresh toutes les 30 secondes
    if (autoRefresh) {
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchOrders(); // Recharger la liste
      } else {
        console.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'paid') return order.status === 'paid' || order.status === 'confirmed';
    if (filter === 'preparing') return order.status === 'preparing';
    if (filter === 'ready') return order.status === 'ready';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ready':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'delivered':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
      case 'confirmed':
        return 'Payée - À préparer';
      case 'preparing':
        return 'En préparation';
      case 'ready':
        return 'Prête';
      case 'delivered':
        return 'Livrée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
        <span className="ml-2">Chargement des commandes...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      {/* Header avec contrôles */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-800">
          🍽️ Gestion des Commandes Cuisine
        </h2>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Actualisation auto (30s)</span>
          </label>

          <button
            onClick={fetchOrders}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
          >
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            filter === 'paid' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🟢 À préparer ({orders.filter(o => o.status === 'paid' || o.status === 'confirmed').length})
        </button>
        
        <button
          onClick={() => setFilter('preparing')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            filter === 'preparing' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🟡 En préparation ({orders.filter(o => o.status === 'preparing').length})
        </button>
        
        <button
          onClick={() => setFilter('ready')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            filter === 'ready' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🔵 Prêtes ({orders.filter(o => o.status === 'ready').length})
        </button>
        
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            filter === 'all' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📋 Toutes ({orders.length})
        </button>
      </div>

      {/* Liste des commandes */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">🍽️ Aucune commande dans cette catégorie</p>
          <p className="text-sm mt-2">Les nouvelles commandes apparaîtront ici automatiquement</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* En-tête de commande */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-green-800">
                    📋 Commande #{order.id}
                  </h3>
                  <div className="text-sm text-gray-600 mt-1">
                    <p>👤 {order.user?.name || order.customerName}</p>
                    <p>📧 {order.user?.email || order.customerEmail}</p>
                    <p>📞 {order.customerPhone}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <div className="text-sm text-gray-600 mt-2">
                    <p>🕐 {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p>📅 {new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              {/* Détails des produits */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-800 mb-3">🍽️ Détails de la commande :</h4>
                <div className="space-y-2">
                  {order.orderItems && order.orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <div className="flex-1">
                        <span className="font-medium">{item.product?.name || `Produit ${item.productId}`}</span>
                        <span className="text-sm text-gray-600 ml-2">(#{item.productId})</span>
                      </div>
                      <div className="text-center min-w-[80px]">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-bold">
                          ×{item.quantity}
                        </span>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <span className="font-medium">{item.price} FCFA</span>
                        <div className="text-sm text-gray-600">
                          = {item.price * item.quantity} FCFA
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total */}
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">💰 TOTAL :</span>
                    <span className="text-xl font-bold text-green-700">
                      {order.totalAmount} FCFA
                    </span>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex space-x-2 justify-end">
                {(order.status === 'paid' || order.status === 'confirmed') && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                  >
                    🔄 Commencer préparation
                  </button>
                )}
                
                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    ✅ Marquer comme prête
                  </button>
                )}
                
                {order.status === 'ready' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    🚚 Marquer comme livrée
                  </button>
                )}
                
                {(order.status === 'paid' || order.status === 'confirmed' || order.status === 'preparing') && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  >
                    ❌ Annuler
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Statistiques */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-100 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-700">
            {orders.filter(o => o.status === 'paid' || o.status === 'confirmed').length}
          </div>
          <div className="text-sm text-green-600">À préparer</div>
        </div>
        
        <div className="bg-yellow-100 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-700">
            {orders.filter(o => o.status === 'preparing').length}
          </div>
          <div className="text-sm text-yellow-600">En cours</div>
        </div>
        
        <div className="bg-blue-100 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-700">
            {orders.filter(o => o.status === 'ready').length}
          </div>
          <div className="text-sm text-blue-600">Prêtes</div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-700">
            {orders.filter(o => o.status === 'delivered').length}
          </div>
          <div className="text-sm text-gray-600">Livrées</div>
        </div>
      </div>
    </div>
  );
}