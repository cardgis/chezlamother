const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Début de la migration des données...');

  try {
    // 1. Migration des produits
    console.log('📦 Migration des produits...');
    const productsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../src/utils/productsData.json'), 'utf-8')
    );

    for (const product of productsData) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {
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
        create: {
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
    console.log(`✅ ${productsData.length} produits migrés avec succès`);

    // 2. Migration des utilisateurs
    console.log('👥 Migration des utilisateurs...');
    const usersData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf-8')
    );

    for (const user of usersData) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          password: user.password,
          role: user.role || 'client',
          phone: user.phone || null,
        },
        create: {
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role || 'client',
          phone: user.phone || null,
        },
      });
    }
    console.log(`✅ ${usersData.length} utilisateurs migrés avec succès`);

    // 3. Migration des tokens de réinitialisation (si le fichier existe)
    console.log('🔑 Migration des tokens de réinitialisation...');
    const resetTokensPath = path.join(__dirname, '../data/resetTokens.json');
    if (fs.existsSync(resetTokensPath)) {
      const resetTokensData = JSON.parse(fs.readFileSync(resetTokensPath, 'utf-8'));
      
      // Vérifier si c'est un tableau
      if (Array.isArray(resetTokensData) && resetTokensData.length > 0) {
        for (const token of resetTokensData) {
          await prisma.resetToken.create({
            data: {
              email: token.email,
              code: token.code,
              expiresAt: new Date(token.expiresAt),
              used: token.used || false,
            },
          });
        }
        console.log(`✅ ${resetTokensData.length} tokens de réinitialisation migrés`);
      } else {
        console.log('ℹ️ Aucun token de réinitialisation à migrer (fichier vide)');
      }
    } else {
      console.log('ℹ️ Aucun fichier de tokens de réinitialisation trouvé');
    }

    console.log('🎉 Migration terminée avec succès !');

    // Statistiques finales
    const productCount = await prisma.product.count();
    const userCount = await prisma.user.count();
    console.log(`📊 Base de données contient maintenant :`);
    console.log(`   - ${productCount} produits`);
    console.log(`   - ${userCount} utilisateurs`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration :', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });