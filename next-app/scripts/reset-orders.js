#!/usr/bin/env node

/**
 * Script pour vider complètement l'historique des commandes
 * Supprime toutes les données de test des tables :
 * - payments (paiements)
 * - order_items (articles commandés)  
 * - orders (commandes)
 * 
 * Usage: node scripts/reset-orders.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetOrdersHistory() {
  try {
    console.log('🗑️  Début de la suppression de l\'historique des commandes...\n');

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

    // 4. Réinitialiser les compteurs auto-increment (optionnel)
    console.log('🔄 Réinitialisation des compteurs...');
    await prisma.$executeRaw`ALTER SEQUENCE orders_id_seq RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE order_items_id_seq RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE payments_id_seq RESTART WITH 1;`;
    console.log('   ✅ Compteurs réinitialisés\n');

    console.log('🎉 SUCCÈS ! Historique des commandes complètement vidé.');
    console.log('📊 Résumé :');
    console.log(`   • ${deletedPayments.count} paiements supprimés`);
    console.log(`   • ${deletedOrderItems.count} articles supprimés`);
    console.log(`   • ${deletedOrders.count} commandes supprimées`);
    console.log('\n✅ Votre application repart maintenant avec un historique vide !');

  } catch (error) {
    console.error('❌ Erreur lors de la suppression :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Confirmation avant suppression
console.log('⚠️  ATTENTION : Ce script va supprimer TOUTES les commandes !');
console.log('📋 Tables affectées : orders, order_items, payments');
console.log('\nAppuyez sur CTRL+C pour annuler ou ENTRÉE pour continuer...');

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', (key) => {
  // CTRL+C
  if (key[0] === 3) {
    console.log('\n❌ Opération annulée par l\'utilisateur');
    process.exit(0);
  }
  // ENTRÉE
  if (key[0] === 13) {
    console.log('\n🚀 Début de la suppression...\n');
    resetOrdersHistory();
  }
});