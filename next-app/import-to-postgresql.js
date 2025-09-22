const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// PostgreSQL Prisma client (sera configuré après avoir l'URL Neon)
const postgres = new PrismaClient();

async function importToPostgreSQL() {
  console.log("📥 Importation des données vers PostgreSQL (Neon)...");
  
  try {
    // Lire le fichier de backup
    const backupData = JSON.parse(fs.readFileSync('sqlite-backup.json', 'utf8'));
    console.log("✅ Fichier de backup lu");
    
    // 1. Importer les utilisateurs
    console.log("👥 Importation des utilisateurs...");
    for (const user of backupData.users) {
      await postgres.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          name: user.name,
          email: user.email,
          password: user.password,
          phone: user.phone,
          role: user.role,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }
      });
    }
    console.log(`✅ ${backupData.users.length} utilisateurs importés`);
    
    // 2. Importer les produits
    console.log("🍽️ Importation des produits...");
    for (const product of backupData.products) {
      await postgres.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: {
          slug: product.slug,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          subcategory: product.subcategory,
          dayAvailable: product.dayAvailable,
          available: product.available,
          image: product.image,
          rating: product.rating,
          reviews: product.reviews,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt)
        }
      });
    }
    console.log(`✅ ${backupData.products.length} produits importés`);
    
    // 3. Importer les commandes
    console.log("📦 Importation des commandes...");
    for (const order of backupData.orders) {
      const newOrder = await postgres.order.create({
        data: {
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt)
        }
      });
      
      // Importer les items de commande
      for (const item of order.orderItems) {
        await postgres.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }
        });
      }
      
      // Importer les paiements
      for (const payment of order.payments) {
        await postgres.payment.create({
          data: {
            orderId: newOrder.id,
            amount: payment.amount,
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            waveReference: payment.waveReference,
            waveCallback: payment.waveCallback,
            createdAt: new Date(payment.createdAt),
            updatedAt: new Date(payment.updatedAt),
            paidAt: payment.paidAt ? new Date(payment.paidAt) : null
          }
        });
      }
    }
    console.log(`✅ ${backupData.orders.length} commandes importées`);
    
    // 4. Importer les tokens de réinitialisation actifs
    console.log("🔑 Importation des tokens de réinitialisation...");
    for (const token of backupData.resetTokens) {
      await postgres.resetToken.create({
        data: {
          email: token.email,
          code: token.code,
          expiresAt: new Date(token.expiresAt),
          used: token.used,
          createdAt: new Date(token.createdAt)
        }
      });
    }
    console.log(`✅ ${backupData.resetTokens.length} tokens importés`);
    
    console.log("🎉 Migration PostgreSQL terminée avec succès !");
    
  } catch (error) {
    console.error("❌ Erreur lors de l'import:", error);
  } finally {
    await postgres.$disconnect();
  }
}

// Fonction pour vérifier la migration
async function verifyMigration() {
  try {
    const users = await postgres.user.count();
    const products = await postgres.product.count();
    const orders = await postgres.order.count();
    const resetTokens = await postgres.resetToken.count();
    
    console.log("\n📊 Vérification de la migration :");
    console.log(`- Utilisateurs: ${users}`);
    console.log(`- Produits: ${products}`);
    console.log(`- Commandes: ${orders}`);
    console.log(`- Tokens: ${resetTokens}`);
    
  } catch (error) {
    console.error("❌ Erreur lors de la vérification:", error);
  }
}

// Exécuter l'import si le fichier est appelé directement
if (require.main === module) {
  importToPostgreSQL().then(() => {
    return verifyMigration();
  });
}

module.exports = { importToPostgreSQL, verifyMigration };