#!/usr/bin/env node

/**
 * Script pour vider complètement l'historique des commandes
 * Version directe sans confirmation interactive
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetOrdersHistory() {
  try {
    console.log('🗑️  SUPPRESSION DE L\'HISTORIQUE DES COMMANDES\n');

    // 1. Supprimer tous les paiements
    console.log('📱 Suppression des paiements...');
    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`   ✅ ${deletedPayments.count} paiements supprimés\n`);

    // 2. Supprimer tous les articles de commandes
    console.log('🛒 Suppression des articles de commandes...');
    const deletedOrderItems = await prisma.orderItem.deleteMany({});
    console.log(`   ✅ ${deletedOrderItems.count} articles supprimés\n`);

    // 3. Supprimer toutes les commandes
    console.log('📋 Suppression des commandes...');
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`   ✅ ${deletedOrders.count} commandes supprimées\n`);

    // 4. Réinitialiser les compteurs auto-increment
    console.log('🔄 Réinitialisation des compteurs...');
    try {
      await prisma.$executeRaw`ALTER SEQUENCE orders_id_seq RESTART WITH 1;`;
      await prisma.$executeRaw`ALTER SEQUENCE order_items_id_seq RESTART WITH 1;`;
      await prisma.$executeRaw`ALTER SEQUENCE payments_id_seq RESTART WITH 1;`;
      console.log('   ✅ Compteurs réinitialisés\n');
    } catch (seqError) {
      console.log('   ⚠️  Compteurs non réinitialisés (normal en SQLite)\n');
    }

    console.log('🎉 SUCCÈS ! Historique des commandes complètement vidé.');
    console.log('📊 Résumé :');
    console.log(`   • ${deletedPayments.count} paiements supprimés`);
    console.log(`   • ${deletedOrderItems.count} articles supprimés`);
    console.log(`   • ${deletedOrders.count} commandes supprimées`);
    console.log('\n✅ Votre application repart maintenant avec un historique vide !');
    console.log('🚀 La prochaine commande sera numérotée #1');

  } catch (error) {
    console.error('❌ Erreur lors de la suppression :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetOrdersHistory();