import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// API pour simuler un paiement Wave réussi (développement uniquement)
export async function POST(request) {
  // Seulement en mode développement
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      error: 'Non disponible en production' 
    }, { status: 403 });
  }

  try {
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json({ 
        error: 'ID de paiement requis' 
      }, { status: 400 });
    }

    // Trouver le paiement
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(paymentId) },
      include: { order: true }
    });

    if (!payment) {
      return NextResponse.json({ 
        error: 'Paiement non trouvé' 
      }, { status: 404 });
    }

    // Simuler un webhook Wave de succès
    const webhookData = {
      transaction_id: payment.waveTransactionId,
      status: 'completed',
      amount: payment.amount,
      currency: payment.currency,
      reference: payment.waveReference,
      customer_phone: payment.order.customerPhone,
      metadata: {
        order_id: payment.order.id
      }
    };

    // Appeler notre propre webhook pour traiter le paiement
    const webhookResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/payments/wave/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    if (webhookResponse.ok) {
      const webhookResult = await webhookResponse.json();
      
      return NextResponse.json({
        success: true,
        message: 'Paiement simulé avec succès',
        payment: {
          id: payment.id,
          status: 'completed',
          amount: payment.amount
        },
        webhook: webhookResult
      });
    } else {
      throw new Error('Erreur lors du traitement du webhook');
    }

  } catch (error) {
    console.error('Erreur simulation paiement:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la simulation' 
    }, { status: 500 });
  }
}