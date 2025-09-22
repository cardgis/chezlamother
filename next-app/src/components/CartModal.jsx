"use client";
import React, { useState, useEffect } from 'react';
import { cart } from '../utils/cart';
import { formatPrice } from '../utils/products';

const CartModal = ({ isOpen, onClose }) => {
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

  const getTotalPrice = () => cart.getTotal();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-black">Votre Panier</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-black mb-4">Votre panier est vide</p>
              <button onClick={onClose} className="bg-green-800 text-white px-6 py-2 rounded-lg hover:bg-green-900">Continuer vos achats</button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                    <img src={item.image || "/images/food-placeholder.svg"} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-black">{item.name}</h3>
                      <p className="text-black font-bold">{formatPrice(item.price)}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="bg-gray-200 px-2 py-1 rounded text-black">-</button>
                        <span className="text-black font-bold">{item.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="bg-gray-200 px-2 py-1 rounded text-black">+</button>
                      </div>
                    </div>
                    <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-black">Total:</span>
                  <span className="text-xl font-bold text-black">{formatPrice(getTotalPrice())}</span>
                </div>
                <button
                  className="w-full bg-green-800 text-white py-3 rounded-lg hover:bg-green-900 font-semibold"
                  onClick={async () => {
                    let user = null;
                    if (typeof window !== 'undefined') {
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
                    
                    // Calculer le montant total
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
                    
                    // Envoyer à l'API
                    const res = await fetch('/api/orders', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newOrder)
                    });
                    
                    if (res.ok) {
                      const createdOrder = await res.json();
                      cart.clear();
                      // Rediriger vers la page de paiement Wave
                      window.location.href = `/paiement?orderId=${createdOrder.id}`;
                    } else {
                      let errorMsg = "Erreur lors de l'enregistrement de la commande. Veuillez réessayer ou contacter le restaurant.";
                      try {
                        const err = await res.json();
                        if (err && err.error) errorMsg += "\n" + err.error;
                      } catch {}
                      setOrderError(errorMsg);
                    }
                  }}
                >Finaliser la commande</button>
      {/* Pop-up numéro de commande */}
      {(orderPopup || orderError) && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            {orderError ? (
              <>
                <h3 className="text-xl font-bold mb-2 text-red-700">Erreur</h3>
                <div className="mb-4 text-black">{orderError}</div>
                <button
                  className="block w-full mt-4 text-gray-500 hover:text-gray-700 text-sm"
                  onClick={() => {
                    setOrderError('');
                    onClose();
                  }}
                >Fermer</button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-2 text-black">Commande envoyée !</h3>
                <div className="mb-4 text-black">Votre numéro de commande :</div>
                <div className="font-mono text-2xl font-bold mb-4 text-green-700">{orderPopup}</div>
                <button
                  className="bg-gray-200 text-black px-4 py-2 rounded mb-2 font-semibold"
                  onClick={() => {
                    navigator.clipboard.writeText(orderPopup);
                  }}
                >Copier le numéro</button>
                <button
                  className="bg-green-700 text-white px-4 py-2 rounded font-semibold ml-2"
                  onClick={() => {
                    window.location.href = `/order-status?orderId=${orderPopup}`;
                  }}
                >Voir le suivi</button>
                <button
                  className="block w-full mt-4 text-gray-500 hover:text-gray-700 text-sm"
                  onClick={() => {
                    setOrderPopup(null);
                    onClose();
                  }}
                >Fermer</button>
              </>
            )}
          </div>
        </div>
      )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
