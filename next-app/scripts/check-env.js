const fs = require('fs');
const path = require('path');

// Script pour vérifier les variables d'environnement Vercel
console.log('🔍 Vérification des variables d\'environnement\n');

// Lire le fichier .env.local
const envLocalPath = path.join(__dirname, '..', '.env.local');
let envVars = {};

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  console.log('✅ Fichier .env.local trouvé et lu');
} else {
  console.log('❌ Fichier .env.local non trouvé');
}

const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET', 
  'NEXT_PUBLIC_BASE_URL'
];

console.log('\n📋 Variables d\'environnement locales :');
requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (value) {
    // Masquer les URLs et secrets sensibles
    if (varName === 'DATABASE_URL') {
      console.log(`✅ ${varName}: ${value.replace(/\/\/.*@/, '//***@')}`);
    } else if (varName === 'JWT_SECRET') {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`❌ ${varName}: MANQUANTE`);
  }
});

console.log('\n🔗 Analyse DATABASE_URL :');
if (envVars.DATABASE_URL) {
  try {
    const url = new URL(envVars.DATABASE_URL);
    console.log('✅ Hostname:', url.hostname);
    console.log('✅ Database:', url.pathname);
    console.log('✅ Port:', url.port || 5432);
    console.log('✅ Protocol:', url.protocol);
  } catch (error) {
    console.log('❌ URL invalide:', error.message);
  }
} else {
  console.log('❌ DATABASE_URL non définie');
}

console.log('\n� Instructions pour Vercel :');
console.log('1. Allez sur : https://vercel.com/cardgis/chezlamother/settings/environment-variables');
console.log('2. Ajoutez ces variables :');
requiredVars.forEach(varName => {
  if (envVars[varName]) {
    console.log(`   ${varName}=${envVars[varName]}`);
  }
});
console.log('3. Redéployez le projet');

if (envVars.DATABASE_URL) {
  console.log('\n📋 DATABASE_URL complète pour Vercel :');
  console.log(envVars.DATABASE_URL);
}