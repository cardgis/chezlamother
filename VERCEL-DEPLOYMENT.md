# 🚀 GUIDE DE DÉPLOIEMENT VERCEL - CHEZ LA MOTHER

## 📋 Étapes à suivre

### 1. 🌐 Connexion à Vercel
1. Allez sur **https://vercel.com**
2. Connectez-vous avec votre compte GitHub (ou créez un compte)
3. Cliquez sur **"Add New"** → **"Project"**

### 2. 📂 Import du Repository
1. Cherchez votre repository **"cardgis/chezlamother"**
2. Cliquez sur **"Import"**
3. **Root Directory**: Sélectionnez **"next-app"** (très important !)
4. **Framework Preset**: Next.js (détecté automatiquement)

### 3. ⚙️ Configuration du Build
Vercel détectera automatiquement :
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. 🔐 Variables d'environnement ESSENTIELLES
Dans la section **Environment Variables**, ajoutez :

```bash
# 🗄️ BASE DE DONNÉES (À CRÉER APRÈS)
DATABASE_URL=postgresql://username:password@ep-host.us-east-1.aws.neon.tech/dbname?sslmode=require

# 🔐 SÉCURITÉ
JWT_SECRET=super-secret-jwt-key-production-2025-chezlamother-secure
NEXT_PUBLIC_BASE_URL=https://VOTRE-DOMAINE-VERCEL.vercel.app

# 💳 WAVE PAYMENT API
WAVE_API_KEY=votre-cle-wave-api-production
WAVE_SECRET=votre-secret-wave-production

# 📧 EMAIL
SENDGRID_API_KEY=votre-cle-sendgrid-production
```

### 5. 🚀 Premier Déploiement
1. Cliquez sur **"Deploy"**
2. Attendez le build (2-3 minutes)
3. Récupérez votre URL Vercel (ex: `https://chezlamother.vercel.app`)

### 6. 🗄️ Configuration Neon Database
1. Allez sur **https://neon.tech**
2. Créez un compte et une base de données
3. Copiez l'URL de connexion PostgreSQL
4. Retournez sur Vercel → Settings → Environment Variables
5. Mettez à jour `DATABASE_URL` avec la vraie URL Neon

### 7. 🔄 Migration Base de Données
Exécutez les migrations Prisma :
```bash
npx prisma generate
npx prisma db push
```

### 8. ✅ Test Final
- Visitez votre site en production
- Testez une commande complète
- Vérifiez le QR Code Wave
- Testez l'interface admin

## 🎯 CHECKLIST DÉPLOIEMENT

- [ ] Repository GitHub connecté
- [ ] Root directory "next-app" sélectionné
- [ ] Variables d'environnement configurées
- [ ] Premier déploiement réussi
- [ ] Base Neon créée et connectée
- [ ] Migrations Prisma exécutées
- [ ] Tests de commande en production
- [ ] QR Code Wave fonctionnel
- [ ] Interface admin accessible

## 🆘 EN CAS DE PROBLÈME

### Build qui échoue
- Vérifiez le Root Directory = "next-app"
- Vérifiez les variables d'environnement
- Consultez les logs Vercel

### Erreurs de base de données
- Vérifiez DATABASE_URL correct
- Exécutez les migrations Prisma
- Vérifiez les permissions Neon

### Erreurs Wave Payment
- Vérifiez WAVE_API_KEY et WAVE_SECRET
- Testez en mode sandbox d'abord

---

🎉 **Votre application sera accessible à l'adresse :**
**https://chezlamother.vercel.app** (ou similaire)