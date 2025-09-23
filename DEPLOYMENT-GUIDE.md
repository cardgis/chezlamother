# 🚀 Instructions de déploiement Vercel

## 📋 Étapes à suivre maintenant

### 1. ✅ Repository GitHub (En cours)
Créez un repository sur GitHub avec :
- **Nom**: `foodie-nextjs-app`
- **Visibilité**: Public ou Private
- **Ne pas** initialiser avec README (nous avons déjà nos fichiers)

### 2. 🔗 Connecter le repository local
```bash
# Ajouter l'origine GitHub (remplacez USERNAME par votre nom d'utilisateur)
git remote add origin https://github.com/USERNAME/foodie-nextjs-app.git

# Pousser vers GitHub
git branch -M main
git push -u origin main
```

### 3. 🚀 Déployer sur Vercel
1. Aller sur [vercel.com](https://vercel.com)
2. **Import Project** → **Import Git Repository**
3. Sélectionner votre repository `foodie-nextjs-app`
4. **Framework Preset**: Next.js
5. **Root Directory**: `next-app`
6. **Build Command**: `npm run build`
7. **Output Directory**: `.next`

### 4. 🗄️ Configurer Neon Database
1. Dans Vercel Dashboard → **Storage** → **Create Database**
2. Choisir **Neon** → Nommer `foodie-production`
3. Copier l'URL PostgreSQL fournie

### 5. ⚙️ Variables d'environnement Vercel
Dans les settings de votre projet Vercel, ajouter :
```bash
DATABASE_URL=postgresql://votre-url-neon-ici
JWT_SECRET=votre-jwt-secret-tres-long-et-securise
NEXT_PUBLIC_BASE_URL=https://votre-domaine-vercel.app
WAVE_API_KEY=votre-cle-wave
WAVE_SECRET=votre-secret-wave
SENDGRID_API_KEY=votre-cle-sendgrid
```

### 6. 🔄 Migration base de données
Après déploiement, dans le terminal Vercel ou localement :
```bash
# Génerer le client Prisma
npx prisma generate

# Appliquer le schéma
npx prisma db push

# Importer les données (si nécessaire)
node import-to-postgresql.js
```

### 7. ✅ Vérification finale
- [ ] Site accessible sur votre URL Vercel
- [ ] Authentification fonctionne
- [ ] Commandes et paiements Wave opérationnels
- [ ] Base de données Neon connectée

## 🎯 Commandes prêtes à exécuter

1. **Créez votre repository GitHub maintenant**
2. **Copiez l'URL de votre repository** 
3. **Exécutez** (remplacez USERNAME) :
   ```bash
   git remote add origin https://github.com/USERNAME/foodie-nextjs-app.git
   git branch -M main
   git push -u origin main
   ```

## 📞 Support
Une fois le repository créé, donnez-moi l'URL et nous finaliserons le déploiement !