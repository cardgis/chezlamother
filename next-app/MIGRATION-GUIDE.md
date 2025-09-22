# 🚀 Guide de Migration vers Neon Database (PostgreSQL)

## 📋 Étapes à suivre

### 1. ✅ Préparation (Terminé)
- ✅ Export des données SQLite → `sqlite-backup.json`
- ✅ Schéma Prisma adapté pour PostgreSQL
- ✅ Scripts d'import/export prêts

### 2. 🔧 Configuration Neon Database

#### A. Créer la base Neon sur Vercel :
1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. **Storage** → **Create Database** → **Neon**
3. Nommer votre base : `foodie-production`
4. Récupérer l'URL de connexion PostgreSQL

#### B. Configurer les variables d'environnement :
```bash
# Copier le template
cp .env.neon.example .env.local

# Éditer .env.local avec votre vraie URL Neon
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
```

### 3. 🔄 Migration des données

#### A. Générer le client Prisma pour PostgreSQL :
```bash
npx prisma generate
```

#### B. Appliquer le schéma à la base Neon :
```bash
npx prisma db push
```

#### C. Importer les données :
```bash
node import-to-postgresql.js
```

### 4. ✅ Vérification

#### A. Tester la connexion :
```bash
npx prisma studio
```

#### B. Lancer l'application :
```bash
npm run dev
```

#### C. Tester les fonctionnalités :
- ✅ Authentification (login/register)
- ✅ Commandes et paiements Wave
- ✅ Réinitialisation de mot de passe
- ✅ Gestion des produits

### 5. 🧹 Nettoyage (Après vérification)
```bash
# Supprimer les fichiers temporaires
rm sqlite-backup.json
rm export-sqlite-data.js
rm import-to-postgresql.js
rm .env.neon.example

# Supprimer l'ancienne base SQLite
rm prisma/dev.db*
```

## 🎯 Commandes à exécuter maintenant

1. **Créez votre base Neon sur Vercel**
2. **Mettez à jour `.env.local` avec l'URL Neon**
3. **Exécutez :**
   ```bash
   npx prisma generate
   npx prisma db push
   node import-to-postgresql.js
   npm run dev
   ```

## 🚨 Important
- Gardez `sqlite-backup.json` jusqu'à confirmation que tout fonctionne
- Testez toutes les fonctionnalités avant de supprimer SQLite
- La base Neon sera accessible depuis Vercel pour le déploiement

## 📞 Support
Si vous rencontrez des problèmes, j'ai créé des scripts de diagnostic et de rollback.