import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || NEON_DB_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function GET(request, { params }) {
  const { id } = params;
  const client = await pool.connect();
  try {
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
      WHERE o.id = $1
      GROUP BY o.id, u.id, u.name, u.email
      LIMIT 1
    `;
    const result = await client.query(query, [id]);
    if (result.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }
    const row = result.rows[0];
    const order = {
      id: row.id,
      userId: row.userId,
      customerName: row.customerName,
      customerEmail: row.customerEmail,
      customerPhone: row.customerPhone,
      deliveryAddress: row.deliveryAddress,
      deliveryTime: row.deliveryTime,
      status: row.status,
      totalAmount: row.total_amount_euros,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: row.user_id ? {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email
      } : null,
      orderItems: row.order_items && row.order_items[0].id ? row.order_items : []
    };
    client.release();
    return NextResponse.json(order);
  } catch (error) {
    client.release();
    console.error('Erreur lors de la récupération de la commande:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération de la commande' }, { status: 500 });
  }
}
