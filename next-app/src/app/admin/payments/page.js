"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending', 'paid', 'all'

  useEffect(() => {
    // Vérification admin
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
    if (!userStr) {
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    fetchOrders();
    
    // Auto-refresh toutes les 10 secondes
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' })
      });

      if (response.ok) {
        fetchOrders();
        alert('Paiement confirmé avec succès !');
      } else {
        alert('Erreur lors de la confirmation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la confirmation');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'pending') return order.status === 'pending' || order.status === 'confirmed';
    if (filter === 'paid') return order.status === 'paid';
    return true;
  });

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
  const paidOrders = orders.filter(o => o.status === 'paid');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des paiements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            💳 Gestion des Paiements Wave
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={fetchOrders}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              🔄 Actualiser
            </button>
            <button
              onClick={() => router.push('/admin/orders')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              📋 Voir les commandes
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-800">
                ⏳
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente de paiement</p>
                <p className="text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-800">
                ✅
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Payées aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-900">{paidOrders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-800">
                💰
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total collecté</p>
                <p className="text-2xl font-bold text-gray-900">
                  {paidOrders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ⏳ En attente ({pendingOrders.length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'paid' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ✅ Payées ({paidOrders.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' ? 'bg-gray-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📋 Toutes ({orders.length})
          </button>
        </div>

        {/* Liste des commandes */}
        <div className="bg-white rounded-lg shadow-sm">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">Aucune commande dans cette catégorie</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Heure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">#{order.id}</div>
                        <div className="text-sm text-gray-500">
                          {order.orderItems?.length || 0} article(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-gray-900">
                          {order.totalAmount?.toLocaleString()} FCFA
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status === 'paid' ? '✅ Payée' : '⏳ En attente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <a
                          href={`/paiement?orderId=${order.id}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          👁️ Voir QR
                        </a>
                        {order.status !== 'paid' && (
                          <button
                            onClick={() => confirmPayment(order.id)}
                            className="text-green-600 hover:text-green-900 ml-2"
                          >
                            ✅ Confirmer paiement
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Instructions Wave pour l'admin */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            📋 Instructions pour vérifier les paiements Wave
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-700">
            <div>
              <h4 className="font-semibold mb-2">Option 1: QR Code automatique</h4>
              <ol className="space-y-1">
                <li>1. Le client scanne le QR code</li>
                <li>2. Le système vérifie automatiquement</li>
                <li>3. Le statut se met à jour seul</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Option 2: Vérification manuelle</h4>
              <ol className="space-y-1">
                <li>1. Vérifiez le paiement dans votre app Wave</li>
                <li>2. Cherchez la référence "CMD[ID]"</li>
                <li>3. Cliquez "Confirmer paiement" ici</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}