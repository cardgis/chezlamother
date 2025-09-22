import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                name: true,
                price: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return new Response(JSON.stringify(orders), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la récupération des commandes' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function POST(request) {
  try {
    const orderData = await request.json();
    
    // Créer la commande avec ses items
    const order = await prisma.order.create({
      data: {
        userId: orderData.userId || null,
        customerName: orderData.customerName || null,
        customerEmail: orderData.customerEmail || null,
        customerPhone: orderData.customerPhone || null,
        deliveryAddress: orderData.deliveryAddress || null,
        deliveryTime: orderData.deliveryTime || null,
        status: orderData.status || 'pending',
        totalAmount: orderData.totalAmount,
        orderItems: {
          create: orderData.items?.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          })) || []
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });
    
    return new Response(JSON.stringify(order), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erreur lors de la création de commande:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la création de commande' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function PUT(request) {
  try {
    const { id, ...updateData } = await request.json();
    
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        status: updateData.status,
        deliveryAddress: updateData.deliveryAddress,
        deliveryTime: updateData.deliveryTime,
        totalAmount: updateData.totalAmount
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });
    
    return new Response(JSON.stringify(order), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de commande:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la mise à jour de commande' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
