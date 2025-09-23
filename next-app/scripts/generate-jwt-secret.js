#!/usr/bin/env node

/**
 * Générateur de JWT_SECRET sécurisé pour production
 */

const crypto = require('crypto');

console.log('🔐 GÉNÉRATEUR DE JWT_SECRET SÉCURISÉ\n');

// Générer plusieurs options
console.log('📋 TOKENS GÉNÉRÉS (choisissez-en un) :\n');

for (let i = 1; i <= 3; i++) {
  const token = crypto.randomBytes(64).toString('hex');
  console.log(`${i}. ${token}\n`);
}

// Recommandation avec préfixe
const secureToken = 'chezlamother_prod_' + crypto.randomBytes(32).toString('hex');
console.log('🌟 RECOMMANDÉ (avec préfixe) :');
console.log(`JWT_SECRET=${secureToken}\n`);

console.log('💡 CONSEILS DE SÉCURITÉ :');
console.log('✅ Utilisez un token différent entre dev et production');
console.log('✅ Minimum 32 caractères (64 recommandés)');
console.log('✅ Caractères alphanumériques aléatoires');
console.log('✅ Ne partagez JAMAIS ce token publiquement');
console.log('✅ Changez le token si compromis\n');

console.log('🚀 UTILISATION :');
console.log('• Développement : Gardez votre token actuel');
console.log('• Production Vercel : Utilisez un des tokens ci-dessus');
console.log('• Variables Vercel : Ajoutez dans Environment Variables');