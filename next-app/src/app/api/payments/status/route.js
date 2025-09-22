import prisma from '../../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');

    if (!orderId && !paymentId) {
      return new Response(
        JSON.stringify({ error: 'ID de commande ou de paiement requis' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    let payment;

    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: parseInt(paymentId) },
        include: {
          order: true
        }
      });
    } else {
      // Récupérer le dernier paiement de la commande
      payment = await prisma.payment.findFirst({
        where: { orderId: parseInt(orderId) },
        include: {
          order: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    if (!payment) {
      return new Response(
        JSON.stringify({ error: 'Paiement non trouvé' }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // TODO: Vérifier le statut auprès de l'API Wave
    // if (payment.waveTransactionId && payment.status === 'pending') {
    //   try {
    //     const waveResponse = await fetch(
    //       `${process.env.WAVE_API_URL}/payments/${payment.waveTransactionId}`,
    //       {
    //         headers: {
    //           'Authorization': `Bearer ${process.env.WAVE_API_KEY}`,
    //           'Content-Type': 'application/json'
    //         }
    //       }
    //     );
    //     
    //     if (waveResponse.ok) {
    //       const waveData = await waveResponse.json();
    //       
    //       // Mettre à jour le statut si différent
    //       if (waveData.status !== payment.status) {
    //         const statusMapping = {
    //           'completed': 'completed',
    //           'success': 'completed',
    //           'failed': 'failed',
    //           'cancelled': 'cancelled',
    //           'expired': 'failed'
    //         };
    //         
    //         const newStatus = statusMapping[waveData.status] || waveData.status;
    //         
    //         payment = await prisma.payment.update({
    //           where: { id: payment.id },
    //           data: {
    //             status: newStatus,
    //             paidAt: newStatus === 'completed' ? new Date() : null,
    //             updatedAt: new Date()
    //           },
    //           include: {
    //             order: true
    //           }
    //         });
    //         
    //         // Mettre à jour la commande si paiement réussi
    //         if (newStatus === 'completed') {
    //           await prisma.order.update({
    //             where: { id: payment.orderId },
    //             data: { status: 'confirmed' }
    //           });
    //         }
    //       }
    //     }
    //   } catch (error) {
    //     console.error('Erreur lors de la vérification Wave:', error);
    //   }
    // }

    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          waveReference: payment.waveReference,
          waveTransactionId: payment.waveTransactionId,
          createdAt: payment.createdAt,
          paidAt: payment.paidAt
        },
        order: {
          id: payment.order.id,
          status: payment.order.status,
          totalAmount: payment.order.totalAmount
        }
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la vérification du statut' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function POST(request) {
  try {
    const { paymentId, action } = await request.json();

    if (!paymentId || !action) {
      return new Response(
        JSON.stringify({ error: 'ID de paiement et action requis' }), 
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

    if (action === 'cancel') {
      // Annuler le paiement
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'cancelled',
          updatedAt: new Date()
        }
      });

      // Mettre à jour la commande
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'cancelled' }
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Paiement annulé',
          payment: {
            id: updatedPayment.id,
            status: updatedPayment.status
          }
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Action non reconnue' }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erreur lors de l\'action sur le paiement:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de l\'action sur le paiement' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}