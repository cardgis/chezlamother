import prisma from '../../../../lib/prisma';

export async function POST(request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'ID de commande requis' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Récupérer la commande avec les articles
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        payments: true
      }
    });

    if (!order) {
      return new Response(
        JSON.stringify({ error: 'Commande non trouvée' }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Vérifier si un paiement Wave est déjà en cours
    const existingPayment = order.payments.find(p => 
      p.paymentMethod === 'wave' && 
      (p.status === 'pending' || p.status === 'processing')
    );

    if (existingPayment) {
      return new Response(
        JSON.stringify({
          success: true,
          payment: existingPayment
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Préparer les données pour Wave API
    const wavePaymentData = {
      amount: order.totalAmount,
      currency: 'XOF',
      description: `Commande #${order.id} - Foodie App`,
      customer: {
        name: order.customerName || 'Client',
        email: order.customerEmail,
        phone: order.customerPhone
      },
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/wave/callback`,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-status?id=${order.id}&status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-status?id=${order.id}&status=cancelled`,
      metadata: {
        order_id: order.id,
        customer_phone: order.customerPhone
      }
    };

    // TODO: Remplacer par l'appel réel à l'API Wave
    // const waveResponse = await fetch(process.env.WAVE_API_URL + '/payments', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.WAVE_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(wavePaymentData)
    // });

    // SIMULATION pour développement (à remplacer par la vraie API Wave)
    const simulatedWaveResponse = {
      id: `wave_${Date.now()}`,
      qr_code: `wave://pay?amount=${order.totalAmount}&currency=XOF&merchant=FOODIE_APP&reference=ORDER_${order.id}`,
      payment_url: `https://wave.com/pay/ORDER_${order.id}`,
      status: 'pending',
      reference: `ORDER_${order.id}_${Date.now()}`
    };

    // Créer l'enregistrement de paiement
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        waveTransactionId: simulatedWaveResponse.id,
        waveQrCode: simulatedWaveResponse.qr_code,
        wavePaymentUrl: simulatedWaveResponse.payment_url,
        waveReference: simulatedWaveResponse.reference,
        amount: order.totalAmount,
        currency: 'XOF',
        status: 'pending',
        paymentMethod: 'wave',
        waveCallback: wavePaymentData.callback_url
      }
    });

    // Mettre à jour le statut de la commande
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'awaiting_payment' }
    });

    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: payment.id,
          waveTransactionId: payment.waveTransactionId,
          qrCode: payment.waveQrCode,
          paymentUrl: payment.wavePaymentUrl,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          reference: payment.waveReference
        },
        order: {
          id: order.id,
          totalAmount: order.totalAmount,
          status: 'awaiting_payment'
        }
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erreur lors de la création du paiement Wave:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la création du paiement' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'ID de paiement requis' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(paymentId) },
      include: {
        order: true
      }
    });

    if (!payment) {
      return new Response(
        JSON.stringify({ error: 'Paiement non trouvé' }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // TODO: Vérifier le statut réel auprès de Wave API
    // const waveStatus = await fetch(`${process.env.WAVE_API_URL}/payments/${payment.waveTransactionId}`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.WAVE_API_KEY}`
    //   }
    // });

    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          waveReference: payment.waveReference,
          paidAt: payment.paidAt
        }
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erreur lors de la vérification du paiement:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la vérification du paiement' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}