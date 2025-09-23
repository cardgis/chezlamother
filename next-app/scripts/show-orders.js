#!/usr/bin/env node

/**
 * Script pour afficher les statistiques des commandes actuelles
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showOrdersStats() {
  try {
    console.log('📊 STATISTIQUES ACTUELLES DE LA BASE DE DONNÉES\n');

    // Compter les commandes
    const ordersCount = await prisma.order.count();
    console.log(`🛒 Commandes totales : ${ordersCount}`);

    // Compter les articles
    const orderItemsCount = await prisma.orderItem.count();
    console.log(`📦 Articles commandés : ${orderItemsCount}`);

    // Compter les paiements
    const paymentsCount = await prisma.payment.count();
    console.log(`💳 Paiements enregistrés : ${paymentsCount}`);

    if (ordersCount > 0) {
      console.log('\n📋 DÉTAILS DES COMMANDES :');
      const orders = await prisma.order.findMany({
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          payments: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      orders.forEach((order, index) => {
        console.log(`\n${index + 1}. Commande #${order.id}`);
        console.log(`   👤 Client : ${order.customerName || 'Non spécifié'}`);
        console.log(`   📞 Téléphone : ${order.customerPhone || 'Non spécifié'}`);
        console.log(`   💰 Montant : ${order.totalAmount} FCFA`);
        console.log(`   📅 Date : ${order.createdAt.toLocaleString('fr-FR')}`);
        console.log(`   📊 Statut : ${order.status}`);
        console.log(`   🛍️  Articles : ${order.orderItems.length}`);
        console.log(`   💳 Paiements : ${order.payments.length}`);
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Analyse terminée !');

  } catch (error) {
    console.error('❌ Erreur :', error);
  } finally {
    await prisma.$disconnect();
  }
}

showOrdersStats();