"use client";
import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function WaveQRPayment({ order, onPaymentSuccess, onClose }) {
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending', 'checking', 'confirmed'
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes en secondes
  const [checkingInterval, setCheckingInterval] = useState(null);

  // QR Code Wave - URL ou données à configurer selon votre QR Wave
  const waveQRData = `wave://pay?amount=${order.totalAmount}&reference=CMD${order.id}&merchant=ChezLaMother`;
  
  // Alternative : URL simple pour redirection
  const waveURL = `https://wave.com/pay?amount=${order.totalAmount}&reference=CMD${order.id}`;

  useEffect(() => {
    // Décompte du temps
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Auto-vérification du paiement toutes les 5 secondes
    if (paymentStatus === 'pending') {
      const interval = setInterval(checkPaymentStatus, 5000);
      setCheckingInterval(interval);
      
      return () => clearInterval(interval);
    }
  }, [paymentStatus, order.id]);

  const checkPaymentStatus = async () => {
    try {
      setPaymentStatus('checking');
      const response = await fetch(`/api/orders/${order.id}`);
      const data = await response.json();
      
      if (data.status === 'paid' || data.status === 'confirmed') {
        setPaymentStatus('confirmed');
        clearInterval(checkingInterval);
        
        // Notifier le succès
        setTimeout(() => {
          onPaymentSuccess({
            orderId: order.id,
            amount: order.totalAmount,
            method: 'wave_qr'
          });
        }, 2000);
      } else {
        setPaymentStatus('pending');
      }
    } catch (error) {
      console.error('Erreur vérification paiement:', error);
      setPaymentStatus('pending');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleManualConfirmation = async () => {
    // Bouton pour l'admin pour confirmer manuellement
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' })
      });

      if (response.ok) {
        setPaymentStatus('confirmed');
        onPaymentSuccess({
          orderId: order.id,
          amount: order.totalAmount,
          method: 'wave_qr_manual'
        });
      }
    } catch (error) {
      console.error('Erreur confirmation manuelle:', error);
    }
  };

  if (paymentStatus === 'confirmed') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-2">Paiement confirmé !</h3>
            <p className="text-gray-600">
              Votre commande #{order.id} a été payée avec succès.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Redirection automatique en cours...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Paiement Wave</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Informations commande */}
        <div className="text-center mb-6">
          <h4 className="text-lg font-semibold mb-2">Commande #{order.id}</h4>
          <p className="text-2xl font-bold text-green-600 mb-1">
            {order.totalAmount.toLocaleString()} FCFA
          </p>
          <p className="text-sm text-gray-600">
            Client: {order.customerName}
          </p>
        </div>

        {/* QR Code */}
        <div className="text-center mb-6">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
            <QRCodeCanvas 
              value={waveQRData}
              size={200}
              level="M"
              includeMargin={false}
            />
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Scannez avec votre app Wave pour payer
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h5 className="font-semibold text-blue-800 mb-2">Instructions :</h5>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Ouvrez votre application Wave</li>
            <li>2. Scannez le QR code ci-dessus</li>
            <li>3. Confirmez le paiement</li>
            <li>4. Attendez la confirmation automatique</li>
          </ol>
        </div>

        {/* Statut et timer */}
        <div className="text-center mb-4">
          {paymentStatus === 'checking' ? (
            <div className="flex items-center justify-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Vérification du paiement...
            </div>
          ) : (
            <div className="text-gray-600">
              En attente du paiement...
            </div>
          )}
          
          <div className="text-sm text-gray-500 mt-2">
            Temps restant: {formatTime(timeLeft)}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="space-y-3">
          <button
            onClick={checkPaymentStatus}
            disabled={paymentStatus === 'checking'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {paymentStatus === 'checking' ? 'Vérification...' : 'Vérifier le paiement'}
          </button>
          
          <button
            onClick={() => window.open(waveURL, '_blank')}
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition-colors"
          >
            Ouvrir Wave (lien direct)
          </button>
          
          {/* Bouton admin pour confirmation manuelle */}
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
              Options administrateur
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded">
              <button
                onClick={handleManualConfirmation}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors text-sm"
              >
                ✅ Confirmer le paiement manuellement
              </button>
              <p className="text-xs text-gray-500 mt-1">
                À utiliser uniquement après vérification du paiement Wave
              </p>
            </div>
          </details>
        </div>

        {/* Expiration */}
        {timeLeft <= 0 && (
          <div className="text-center mt-4 p-3 bg-red-50 rounded">
            <p className="text-red-600 text-sm">
              ⚠️ Session expirée. Veuillez recommencer le processus de paiement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}