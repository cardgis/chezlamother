"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cart } from '../utils/cart';
import { formatPrice } from '../utils/products';

const CartModal = ({ isOpen, onClose }) => {
  const { isAuthenticated, user: authUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [orderPopup, setOrderPopup] = useState(null);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    setCartItems(cart.getItems());
    const update = items => setCartItems([...items]);
    cart.addListener(update);
    return () => cart.removeListener(update);
  }, []);

  const handleUpdateQuantity = (id, quantity) => {
    cart.updateQuantity(id, quantity);
  };

  const handleRemove = (id) => {
    cart.removeItem(id);
  };

  const handleFinalizeOrder = async () => {
    let user = null;
    if (isAuthenticated && authUser) {
      user = authUser;
    } else if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        try {
          user = JSON.parse(userStr);
        } catch {}
      }
    }
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }
    const orderId = 'CMD' + Date.now();
    const clientName = user.name;
    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const newOrder = {
      customerName: clientName,
      customerEmail: user.email || null,
      customerPhone: user.phone || null,
      deliveryAddress: user.address || null,
      totalAmount: totalAmount,
      status: 'pending',
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price
      }))
    };
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    });
    if (res.ok) {
      const createdOrder = await res.json();
      cart.clear();
      window.location.href = `/paiement?orderId=${createdOrder.id}`;
    } else {
      let errorMsg = "Erreur lors de l'enregistrement de la commande. Veuillez réessayer ou contacter le restaurant.";
      try {
        const err = await res.json();
        if (err && err.error) errorMsg += "\n" + err.error;
      } catch {}
      setOrderError(errorMsg);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-center h-full">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
          <h2 className="text-2xl font-bold mb-4">Mon panier</h2>
          {cartItems.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">Votre panier est vide.</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              >
                Continuer mes achats
              </button>
            </div>
          ) : (
            <>
              <div className="max-h-60 overflow-y-auto mb-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                      <div>
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-gray-500 text-sm">{formatPrice(item.price)} x {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-l-md hover:bg-gray-300 transition-all"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-4 py-2 border-t border-b text-lg font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300 transition-all"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="ml-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center py-4 border-t">
                <div className="text-lg font-semibold">
                  Total : <span className="text-green-600">{formatPrice(cartItems.reduce((total, item) => total + (item.price * item.quantity), 0))}</span>
                </div>
                <button
                  className="w-full bg-green-800 text-white py-3 rounded-lg hover:bg-green-900 font-semibold"
                  onClick={handleFinalizeOrder}
                >
                  Finaliser la commande
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
