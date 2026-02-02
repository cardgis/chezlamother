import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function GET() {
  try {
    const client = await pool.connect();

    const query = `
      SELECT 
        o.*,
        CAST(o."totalAmount" AS FLOAT) / 100 as total_amount_euros,
        u.id as user_id, u.name as user_name, u.email as user_email,
        json_agg(
          json_build_object(
            'id', oi.id,
            'productId', oi."productId",
            'quantity', oi.quantity,
            'unitPrice', CAST(oi."unitPrice" AS FLOAT) / 100,
            'product', json_build_object(
              'id', p.id,
              'slug', p.slug,
              'name', p.name,
              'price', CAST(p.price AS FLOAT) / 100,
              'image', p.image
            )
          )
        ) as order_items
      FROM orders o
      LEFT JOIN users u ON o."userId" = u.id
      LEFT JOIN order_items oi ON o.id = oi."orderId"
      LEFT JOIN products p ON oi."productId" = p.id
      GROUP BY o.id, u.id, u.name, u.email
      ORDER BY o."createdAt" DESC
    `;

    const result = await client.query(query);
    
    // Restructurer les données pour correspondre au format attendu
    const orders = result.rows.map(row => ({
      id: row.id,
      userId: row.userId,
      customerName: row.customerName,
      customerEmail: row.customerEmail,
      customerPhone: row.customerPhone,
      deliveryAddress: row.deliveryAddress,
      deliveryTime: row.deliveryTime,
      status: row.status,
      totalAmount: row.total_amount_euros, // Utiliser la version convertie
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: row.user_id ? {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email
      } : null,
      orderItems: row.order_items && row.order_items[0].id ? row.order_items : []
    }));

    client.release();
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commandes' }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  let client;
  try {
    console.log('📋 Nouvelle requête POST /api/orders');

    const orderData = await request.json();
    console.log('📋 Données commande reçues:', JSON.stringify(orderData, null, 2));

    client = await pool.connect();
    console.log('✅ Connexion DB établie');

    // Commencer une transaction
    await client.query('BEGIN');
    console.log('🔄 Transaction démarrée');

    // Créer la commande
    const orderQuery = `
      INSERT INTO orders (
        "userId", "customerName", "customerEmail", "customerPhone", 
        "deliveryAddress", "deliveryTime", status, "totalAmount", "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;

    const orderValues = [
      orderData.userId || null,
      orderData.customerName || null,
      orderData.customerEmail || null,
      orderData.customerPhone || null,
      orderData.deliveryAddress || null,
      orderData.deliveryTime || null,
      orderData.status || 'pending',
      Math.round(parseFloat(orderData.totalAmount) * 100) // Convertir en centimes pour integer
    ];

    console.log('📝 Valeurs commande:', orderValues);

    const orderResult = await client.query(orderQuery, orderValues);
    const order = orderResult.rows[0];
    console.log('✅ Commande créée avec ID:', order.id);

    // Créer les items de la commande
    if (orderData.items && orderData.items.length > 0) {
      console.log(`📦 Création de ${orderData.items.length} items`);
      for (const item of orderData.items) {
        console.log('📦 Item:', item);
        const itemQuery = `
          INSERT INTO order_items ("orderId", "productId", quantity, "unitPrice", "createdAt")
          VALUES ($1, $2, $3, $4, NOW())
          RETURNING *
        `;

        const itemValues = [
          order.id,
          item.productId,
          item.quantity,
          Math.round(parseFloat(item.unitPrice) * 100) // Convertir en centimes
        ];

        console.log('📝 Valeurs item:', itemValues);
        await client.query(itemQuery, itemValues);
      }
      console.log('✅ Items créés');
    }

    // Confirmer la transaction
    await client.query('COMMIT');
    console.log('✅ Transaction validée');

    // Récupérer la commande complète avec items et produits
    const fullOrderQuery = `
      SELECT 
        o.*,
        CAST(o."totalAmount" AS FLOAT) / 100 as total_amount_euros,
        json_agg(
          json_build_object(
            'id', oi.id,
            'productId', oi."productId",
            'quantity', oi.quantity,
            'unitPrice', CAST(oi."unitPrice" AS FLOAT) / 100,
            'product', json_build_object(
              'id', p.id,
              'slug', p.slug,
              'name', p.name,
              'price', CAST(p.price AS FLOAT) / 100,
              'image', p.image
            )
          )
        ) as order_items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi."orderId"
      LEFT JOIN products p ON oi."productId" = p.id
      WHERE o.id = $1
      GROUP BY o.id
    `;

    const fullOrderResult = await client.query(fullOrderQuery, [order.id]);
    const fullOrder = fullOrderResult.rows[0];

    client.release();

    console.log('🎉 Commande complète créée:', fullOrder.id);

    return NextResponse.json({
      ...fullOrder,
      totalAmount: fullOrder.total_amount_euros, // Utiliser la version convertie
      orderItems: fullOrder.order_items && fullOrder.order_items[0].id ? fullOrder.order_items : []
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erreur lors de la création de commande:', error);
    console.error('❌ Message:', error.message);
    console.error('❌ Stack:', error.stack);

    // Annuler la transaction en cas d'erreur
    if (client) {
      try {
        await client.query('ROLLBACK');
        console.log('🔄 Transaction annulée');
      } catch (rollbackError) {
        console.error('❌ Erreur rollback:', rollbackError);
      }
      client.release();
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création de commande',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { id, ...updateData } = await request.json();
    const client = await pool.connect();
    
    const updateQuery = `
      UPDATE orders 
      SET status = $1, "deliveryAddress" = $2, "deliveryTime" = $3, "totalAmount" = $4, "updatedAt" = NOW()
      WHERE id = $5
      RETURNING *
    `;

    const updateValues = [
      updateData.status,
      updateData.deliveryAddress,
      updateData.deliveryTime,
      Math.round(parseFloat(updateData.totalAmount) * 100), // Convertir en centimes
      parseInt(id)
    ];

    const result = await client.query(updateQuery, updateValues);
    
    if (result.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { error: 'Commande non trouvée' }, 
        { status: 404 }
      );
    }

    // Récupérer la commande complète avec items et produits
    const fullOrderQuery = `
      SELECT 
        o.*,
        CAST(o."totalAmount" AS FLOAT) / 100 as total_amount_euros,
        json_agg(
          json_build_object(
            'id', oi.id,
            'productId', oi."productId",
            'quantity', oi.quantity,
            'unitPrice', CAST(oi."unitPrice" AS FLOAT) / 100,
            'product', json_build_object(
              'id', p.id,
              'slug', p.slug,
              'name', p.name,
              'price', CAST(p.price AS FLOAT) / 100,
              'image', p.image
            )
          )
        ) as order_items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi."orderId"
      LEFT JOIN products p ON oi."productId" = p.id
      WHERE o.id = $1
      GROUP BY o.id
    `;

    const fullOrderResult = await client.query(fullOrderQuery, [parseInt(id)]);
    const fullOrder = fullOrderResult.rows[0];

    client.release();
    
    return NextResponse.json({
      ...fullOrder,
      totalAmount: fullOrder.total_amount_euros, // Utiliser la version convertie
      orderItems: fullOrder.order_items && fullOrder.order_items[0].id ? fullOrder.order_items : []
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de commande:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de commande' }, 
      { status: 500 }
    );
  }
}
