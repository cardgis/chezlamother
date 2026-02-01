"use client";
import React, { useState, useEffect } from 'react';
import { cart } from '../utils/cart';
import { formatPrice } from '../utils/products';

const CartModal = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([]);
  const [orderPopup, setOrderPopup] = useState(null);
  const [orderError, setOrderError] = useState('');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    setCartItems(cart.getItems());
    const update = items => setCartItems([...items]);
    cart.addListener(update);

    // Load user info from localStorage
    const userInfo = typeof window !== 'undefined' ? localStorage.getItem('userInfo') : null;
    if (userInfo) {
      const { name, phone } = JSON.parse(userInfo);
      setCustomerName(name || '');
      setCustomerPhone(phone || '');
    }

    // Timer pour reset le panier après 15 minutes d'inactivité
    let inactivityTimer;
    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        cart.clear();
      }, 15 * 60 * 1000); // 15 minutes
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      cart.removeListener(update);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  }, []);

  const handleUpdateQuantity = (id, quantity) => {
    cart.updateQuantity(id, quantity);
  };

  const handleRemove = (id) => {
    cart.removeItem(id);
  };

  const handleFinalizeOrder = () => {
    setShowCustomerForm(true);
  };

  const handleSubmitOrder = async () => {
    // Validation
    const errors = {};
    if (!customerName.trim()) errors.name = 'Le nom est requis';
    if (!customerPhone.trim()) errors.phone = 'Le numéro de téléphone est requis';
    else if (!/^\d{9}$/.test(customerPhone.replace(/\s/g, ''))) errors.phone = 'Numéro de téléphone invalide (9 chiffres requis)';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    console.log('🛒 Submitting order...');

    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const newOrder = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.replace(/\s/g, ''),
      totalAmount: totalAmount,
      status: 'pending',
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price
      }))
    };

    console.log('📦 Order data:', newOrder);

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    });

    console.log('📡 Order creation response:', res.status);

    if (res.ok) {
      const createdOrder = await res.json();
      console.log('✅ Order created:', createdOrder);
      // Save user info to localStorage
      const userInfo = { name: customerName.trim(), phone: customerPhone.replace(/\s/g, '') };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      cart.clear();
      // Stocker l'ID de commande dans sessionStorage pour plus de sécurité
      sessionStorage.setItem('pendingOrderId', createdOrder.id);
      console.log('💾 SessionStorage set:', createdOrder.id);
      window.location.href = '/paiement';
    } else {
      let errorMsg = "Erreur lors de l'enregistrement de la commande. Veuillez réessayer ou contacter le restaurant.";
      try {
        const err = await res.json();
        if (err && err.error) errorMsg += "\n" + err.error;
      } catch {}
      console.log('❌ Order creation failed:', errorMsg);
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
          <h2 className="text-2xl font-bold mb-4 text-black">Mon panier</h2>
          {cartItems.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-black">Votre panier est vide.</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              >
                Continuer mes achats
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                className="mt-2 px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-all"
              >
                Retour à l'accueil
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
                        <h3 className="text-lg font-semibold text-black">{item.name}</h3>
                        <p className="text-black text-sm">{formatPrice(item.price)} x {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 bg-gray-200 text-black rounded-l-md hover:bg-gray-300 transition-all"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-4 py-2 border-t border-b text-lg font-semibold text-black">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 bg-gray-200 text-black rounded-r-md hover:bg-gray-300 transition-all"
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
              <div className="flex flex-col gap-2 py-4 border-t">
                <div className="text-lg font-semibold text-black">
                  Total : <span className="text-green-600">{formatPrice(cartItems.reduce((total, item) => total + (item.price * item.quantity), 0))}</span>
                </div>
                {showCustomerForm ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-black">Informations de livraison</h3>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Nom complet</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                        placeholder="Votre nom"
                      />
                      {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Numéro de téléphone</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                        placeholder="77 123 45 67"
                      />
                      {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                    </div>
                    {orderError && <p className="text-red-500 text-sm">{orderError}</p>}
                    <div className="flex gap-2">
                      <button
                        className="flex-1 bg-green-800 text-white py-3 rounded-lg hover:bg-green-900 font-semibold"
                        onClick={handleSubmitOrder}
                      >
                        Confirmer la commande
                      </button>
                      <button
                        className="flex-1 bg-gray-200 text-black py-3 rounded-lg hover:bg-gray-300 font-semibold"
                        onClick={() => {
                          setShowCustomerForm(false);
                          setFormErrors({});
                          setOrderError('');
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="w-full bg-green-800 text-white py-3 rounded-lg hover:bg-green-900 font-semibold"
                    onClick={handleFinalizeOrder}
                  >
                    Finaliser la commande
                  </button>
                )}
                <button
                  onClick={() => { window.location.href = '/'; }}
                  className="w-full bg-gray-200 text-black py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Retour à l'accueil
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
