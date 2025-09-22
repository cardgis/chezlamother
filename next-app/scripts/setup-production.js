const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function setupProductionDatabase() {
  console.log('🚀 Configuration de la base de données de production...');
  
  try {
    // Vérifier la connexion
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');

    // Créer les tables (équivalent de prisma db push)
    console.log('📋 Synchronisation du schéma...');
    // Note: En production, utiliser plutôt prisma migrate deploy

    // Vérifier si des données existent déjà
    const productCount = await prisma.product.count();
    const userCount = await prisma.user.count();
    
    console.log(`📊 État actuel de la base:`);
    console.log(`   - Produits: ${productCount}`);
    console.log(`   - Utilisateurs: ${userCount}`);

    if (productCount === 0) {
      console.log('📦 Import des données initiales...');
      
      // Importer les produits depuis le fichier JSON
      const productsData = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../src/utils/productsData.json'), 'utf-8')
      );

      for (const product of productsData) {
        await prisma.product.create({
          data: {
            slug: product.slug,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            subcategory: product.subcategory,
            dayAvailable: product.dayAvailable || null,
            available: product.available !== false,
            image: product.image || null,
            rating: product.rating || null,
            reviews: product.reviews || null,
          },
        });
      }
      console.log(`✅ ${productsData.length} produits importés`);
    }

    if (userCount === 0) {
      console.log('👥 Création du compte administrateur...');
      
      // Créer un compte admin par défaut
      await prisma.user.create({
        data: {
          name: 'Administrator',
          email: 'admin@foodie.com',
          password: '$2b$10$tmSnY3E5xI8LYn9nct7kVOi9l8ews15e3yfuO2KHwaGdm37TzWmyy', // Remplacer par un hash sécurisé
          role: 'admin',
          phone: '+221700000000'
        }
      });
      console.log('✅ Compte administrateur créé');
      console.log('⚠️  N\'oubliez pas de changer le mot de passe après le premier login');
    }

    // Statistiques finales
    const finalProductCount = await prisma.product.count();
    const finalUserCount = await prisma.user.count();
    
    console.log('\n🎉 Configuration terminée !');
    console.log(`📊 Base de données de production:`);
    console.log(`   - Produits: ${finalProductCount}`);
    console.log(`   - Utilisateurs: ${finalUserCount}`);
    
    console.log('\n📝 Prochaines étapes:');
    console.log('   1. Configurer les variables d\'environnement de production');
    console.log('   2. Tester les APIs en mode production');
    console.log('   3. Configurer le déploiement (Vercel, Netlify, etc.)');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration :', error);
    throw error;
  }
}

setupProductionDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });