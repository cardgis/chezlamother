import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function GET() {
  const client = await pool.connect();

  try {
    console.log('🚀 Création des tables de base de données...\n');

    // Créer la table users
    console.log('👥 Création de la table users...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        phone VARCHAR(20),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table users créée');

    // Créer la table products
    console.log('📦 Création de la table products...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        "shortDescription" TEXT,
        price INTEGER NOT NULL,
        category VARCHAR(100),
        subcategory VARCHAR(100),
        "dayAvailable" VARCHAR(50),
        available BOOLEAN DEFAULT TRUE,
        image VARCHAR(500),
        rating DECIMAL(3,2),
        reviews INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table products créée');

    // Créer la table orders
    console.log('📋 Création de la table orders...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES users(id),
        "customerName" VARCHAR(255),
        "customerEmail" VARCHAR(255),
        "customerPhone" VARCHAR(20),
        "deliveryAddress" TEXT,
        "deliveryTime" TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',
        "totalAmount" INTEGER NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table orders créée');

    // Créer la table order_items
    console.log('🛒 Création de la table order_items...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        "orderId" INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        "productId" INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        "unitPrice" INTEGER NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table order_items créée');

    // Créer la table payments
    console.log('💳 Création de la table payments...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        "orderId" INTEGER REFERENCES orders(id),
        amount INTEGER NOT NULL,
        currency VARCHAR(10) DEFAULT 'XOF',
        status VARCHAR(50) DEFAULT 'pending',
        "paymentMethod" VARCHAR(100),
        "transactionId" VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table payments créée');

    // Créer la table reset_tokens (si pas déjà créée)
    console.log('🔑 Création de la table reset_tokens...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS reset_tokens (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table reset_tokens créée');

    // Créer les index
    console.log('🔍 Création des index...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_userId ON orders("userId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_order_items_orderId ON order_items("orderId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_payments_orderId ON payments("orderId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_reset_tokens_email ON reset_tokens(email);`);
    console.log('✅ Index créés');

    client.release();

    return NextResponse.json({
      success: true,
      message: 'Tables créées avec succès',
      tables: ['users', 'products', 'orders', 'order_items', 'payments', 'reset_tokens']
    });

  } catch (error) {
    client.release();
    console.error('❌ Erreur lors de la création des tables :', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création des tables', details: error.message },
      { status: 500 }
    );
  }
}