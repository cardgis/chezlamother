"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import WaveQRPayment from '../../components/WaveQRPayment';
import { cart } from '../../utils/cart';

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQRPayment, setShowQRPayment] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setError('ID de commande manquant');
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    // Vider le panier à l'arrivée sur la page paiement
    cart.clear();
  }, []);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.error || 'Commande non trouvée');
      }
    } catch (err) {
      setError('Erreur lors du chargement de la commande');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (payment) => {
    // Rediriger vers la page de confirmation
    router.push(`/order-status?id=${order.id}&status=success`);
  };

  const handleCloseQRPayment = () => {
    setShowQRPayment(false);
    // Attendre un peu avant la redirection pour éviter les conflits
    setTimeout(() => {
      router.push('/');
    }, 100);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Finaliser votre commande
            </h1>
            <p className="text-gray-600">
              Commande #{order?.id} - {formatPrice(order?.totalAmount || 0)}
            </p>
          </div>

          {/* Résumé de la commande */}
          {order && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Résumé de la commande</h2>
              
              {/* Informations client */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2 text-gray-800">Informations de livraison</h3>
                <p className="text-sm text-gray-700">
                  <strong>Nom:</strong> {order.customerName}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Téléphone:</strong> {order.customerPhone}
                </p>
                {order.customerEmail && (
                  <p className="text-sm text-gray-700">
                    <strong>Email:</strong> {order.customerEmail}
                  </p>
                )}
                {order.deliveryAddress && (
                  <p className="text-sm text-gray-700">
                    <strong>Adresse:</strong> {order.deliveryAddress}
                  </p>
                )}
              </div>

              {/* Articles */}
              <div className="mb-4">
                <h3 className="font-medium mb-2 text-gray-800">Articles commandés</h3>
                <div className="space-y-2">
                  {order.orderItems?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-800">{item.product?.name || `Article ${item.productId}`}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} x {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-medium text-gray-800">
                        {formatPrice(item.quantity * item.unitPrice)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-gray-800">Total à payer:</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bouton de paiement Wave QR */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                💳 Paiement Wave
              </h3>
              <p className="text-gray-600 mb-6">
                Scannez le QR code avec votre application Wave pour payer instantanément
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => setShowQRPayment(true)}
                  className="bg-gray-800 text-white px-8 py-4 rounded-lg hover:bg-gray-700 transition-all text-lg font-medium shadow-lg transform hover:scale-105"
                >
                  📱 Payer avec QR Code Wave
                </button>
                
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Paiement sécurisé
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Confirmation instantanée
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">📋 Instructions rapides :</h4>
                <ol className="text-sm text-gray-700 text-left space-y-1">
                  <li>1. 📱 Ouvrez votre application Wave</li>
                  <li>2. 📷 Cliquez sur "Scanner" ou "QR Code"</li>
                  <li>3. 🎯 Pointez votre caméra vers le QR code</li>
                  <li>4. ✅ Confirmez le paiement de {formatPrice(order?.totalAmount || 0)}</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal QR Code Wave */}
      {order && showQRPayment && (
        <WaveQRPayment
          order={order}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={handleCloseQRPayment}
        />
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
