import prisma from '../../../../../lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // TODO: Vérifier la signature du webhook Wave pour sécurité
    // const signature = request.headers.get('x-wave-signature');
    // if (!verifyWaveSignature(body, signature)) {
    //   return new Response('Signature invalide', { status: 401 });
    // }

    const {
      transaction_id,
      status,
      amount,
      currency,
      reference,
      customer_phone,
      metadata
    } = body;

    console.log('Webhook Wave reçu:', body);

    // Trouver le paiement correspondant
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { waveTransactionId: transaction_id },
          { waveReference: reference }
        ]
      },
      include: {
        order: true
      }
    });

    if (!payment) {
      console.error('Paiement non trouvé pour:', { transaction_id, reference });
      return new Response('Paiement non trouvé', { status: 404 });
    }

    // Mapper les statuts Wave vers nos statuts internes
    const statusMapping = {
      'pending': 'pending',
      'processing': 'processing', 
      'completed': 'completed',
      'success': 'completed',
      'failed': 'failed',
      'cancelled': 'cancelled',
      'expired': 'failed'
    };

    const newStatus = statusMapping[status] || status;
    const isPaymentCompleted = newStatus === 'completed';

    // Mettre à jour le paiement
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        paidAt: isPaymentCompleted ? new Date() : null,
        updatedAt: new Date()
      }
    });

    // Mettre à jour le statut de la commande si paiement réussi
    if (isPaymentCompleted) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { 
          status: 'confirmed',
          updatedAt: new Date()
        }
      });

      console.log(`✅ Paiement confirmé pour la commande #${payment.orderId}`);
      
      // TODO: Envoyer notification SMS/email au client
      // await sendPaymentConfirmationSMS(payment.order.customerPhone, payment.order.id);
      // await sendPaymentConfirmationEmail(payment.order.customerEmail, payment.order.id);
      
      // TODO: Notifier le restaurant/admin
      // await notifyNewOrder(payment.order);
      
    } else if (newStatus === 'failed' || newStatus === 'cancelled') {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { 
          status: 'payment_failed',
          updatedAt: new Date()
        }
      });

      console.log(`❌ Paiement échoué pour la commande #${payment.orderId}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook traité avec succès',
        payment_status: newStatus 
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erreur lors du traitement du webhook Wave:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors du traitement du webhook' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Fonction pour vérifier la signature du webhook (sécurité)
function verifyWaveSignature(payload, signature) {
  // TODO: Implémenter la vérification de signature selon la doc Wave
  // const expectedSignature = crypto
  //   .createHmac('sha256', process.env.WAVE_WEBHOOK_SECRET)
  //   .update(JSON.stringify(payload))
  //   .digest('hex');
  // 
  // return signature === expectedSignature;
  
  return true; // Pour le développement
}

export async function GET() {
  return new Response(
    JSON.stringify({ message: 'Webhook Wave endpoint actif' }), 
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}