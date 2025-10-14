"use client";
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function OrderStatusPage() {
  const { isAuthenticated, user: authUser } = useAuth();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckStatus = async () => {
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch('/api/orders');
      const all = await res.json();
      // Ne garder que les objets qui ont un champ 'status' (commandes)
      const orders = all.filter(o => typeof o.status === 'string');
      const found = orders.find(o => o.id === orderId);
      if (found) {
        setOrder(found);
      } else {
        setError('Aucune commande trouvée avec ce numéro.');
      }
    } catch {
      setError('Erreur lors de la récupération des commandes.');
    }
    setLoading(false);
  };

  // Redirection vers la page paiement si commande validée
  React.useEffect(() => {
    if (order && order.status === 'validée') {
      const timer = setTimeout(() => {
        window.location.href = `/paiement?orderId=${order.id}`;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [order]);

  return (
    <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded-lg shadow text-black">
      <h1 className="text-2xl font-bold mb-4 text-center">Suivi de commande</h1>
      <div className="mb-4">
        <label className="block mb-2 font-semibold text-black">Numéro de commande :</label>
        <input
          type="text"
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
          className="border rounded px-3 py-2 w-full text-black"
          placeholder="Ex: CMD123456"
        />
      </div>
      <button
        className="w-full bg-green-700 text-white py-2 rounded font-semibold mb-4"
        onClick={handleCheckStatus}
        disabled={loading || !orderId}
      >Vérifier le statut</button>
      {loading && <div className="text-center text-black">Chargement...</div>}
      {error && <div className="text-center text-red-600 font-bold">{error}</div>}
      {order && (
        <div className="mt-6 border-t pt-4">
          <div className="text-lg font-bold mb-2 text-center text-black">Statut : <span className="text-green-700">{order.status}</span></div>
          <div className="mb-2 text-center text-black">Numéro : <span className="font-mono">{order.id}</span></div>
          {order.status === 'validée' && (
            <>
              <div className="text-center text-green-700 font-bold text-xl">Votre commande est validée !</div>
              <div className="text-center text-black mt-2 text-sm">Redirection vers la page de paiement...</div>
            </>
          )}
          <div className="mt-4">
            <div className="font-semibold mb-2 text-black">Produits :</div>
            <ul className="list-disc pl-6 text-black">
              {(order.products || []).map((p, idx) => (
                <li key={p.id + '-' + idx}>{p.name} x {p.quantity} ({p.price} F)</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
