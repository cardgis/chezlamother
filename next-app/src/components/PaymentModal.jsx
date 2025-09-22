"use client";
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function PaymentModal({ order, isOpen, onClose, onPaymentSuccess }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [error, setError] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Générer le QR code Wave
  const initializePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/wave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPayment(data.payment);
        setPaymentStatus(data.payment.status);
        // Démarrer la vérification périodique du statut
        startPaymentStatusCheck(data.payment.id);
      } else {
        setError(data.error || 'Erreur lors de la génération du QR code');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur paiement:', err);
    } finally {
      setLoading(false);
    }
  };

  // Vérification périodique du statut de paiement
  const startPaymentStatusCheck = (paymentId) => {
    const interval = setInterval(async () => {
      if (paymentStatus === 'completed' || paymentStatus === 'failed') {
        clearInterval(interval);
        return;
      }

      setCheckingPayment(true);
      try {
        const response = await fetch(`/api/payments/wave?paymentId=${paymentId}`);
        const data = await response.json();

        if (data.success) {
          setPaymentStatus(data.payment.status);
          
          if (data.payment.status === 'completed') {
            clearInterval(interval);
            onPaymentSuccess(data.payment);
          } else if (data.payment.status === 'failed') {
            clearInterval(interval);
            setError('Le paiement a échoué');
          }
        }
      } catch (err) {
        console.error('Erreur vérification paiement:', err);
      } finally {
        setCheckingPayment(false);
      }
    }, 3000); // Vérifier toutes les 3 secondes

    // Nettoyer l'interval après 5 minutes
    setTimeout(() => {
      clearInterval(interval);
    }, 300000);
  };

  useEffect(() => {
    if (isOpen && order && !payment) {
      initializePayment();
    }
  }, [isOpen, order]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'processing': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente de paiement';
      case 'processing': return 'Paiement en cours...';
      case 'completed': return 'Paiement confirmé !';
      case 'failed': return 'Paiement échoué';
      default: return status;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Finaliser la commande
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Résumé de commande */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Commande #{order.id}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {order.orderItems?.length || 0} article(s)
            </p>
            <p className="text-lg font-bold text-gray-800">
              Total: {formatPrice(order.totalAmount)}
            </p>
          </div>

          {/* Statut */}
          <div className="mb-4 text-center">
            <p className={`text-sm font-medium ${getStatusColor(paymentStatus)}`}>
              {getStatusText(paymentStatus)}
              {checkingPayment && (
                <span className="ml-2">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </span>
              )}
            </p>
          </div>

          {/* Contenu principal */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Génération du QR code...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={initializePayment}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Réessayer
              </button>
            </div>
          ) : payment && paymentStatus !== 'completed' ? (
            <div className="text-center">
              {/* QR Code */}
              <div className="mb-6 p-4 bg-white border-2 border-gray-200 rounded-lg inline-block">
                <QRCodeSVG
                  value={payment.qrCode}
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"M"}
                  includeMargin={false}
                />
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-800">
                  Comment payer avec Wave ?
                </h3>
                <ol className="text-sm text-gray-600 text-left space-y-2">
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                    Ouvrez votre application Wave
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                    Scannez le QR code ci-dessus
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                    Confirmez le paiement de {formatPrice(payment.amount)}
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                    Attendez la confirmation automatique
                  </li>
                </ol>
              </div>

              {/* Bouton alternatif */}
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Ou payez directement :</p>
                <a
                  href={payment.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-sm inline-block mr-3"
                >
                  Ouvrir Wave
                </a>
                
                {/* Bouton de simulation (développement uniquement) */}
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/payments/simulate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ paymentId: payment.id })
                        });
                        const result = await response.json();
                        if (result.success) {
                          setPaymentStatus('completed');
                        }
                      } catch (error) {
                        console.error('Erreur simulation:', error);
                      }
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm inline-block"
                  >
                    🧪 Simuler paiement
                  </button>
                )}
              </div>

              {/* Info référence */}
              <div className="text-xs text-gray-500 border-t pt-4">
                <p>Référence: {payment.reference}</p>
                <p>Cette transaction expire dans 15 minutes</p>
              </div>
            </div>
          ) : paymentStatus === 'completed' ? (
            <div className="text-center py-8">
              <div className="text-green-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-green-600 mb-2">
                Paiement confirmé !
              </h3>
              <p className="text-gray-600 mb-4">
                Votre commande #{order.id} a été confirmée.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Vous recevrez un SMS de confirmation sous peu.
              </p>
              <button
                onClick={onClose}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
              >
                Fermer
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}