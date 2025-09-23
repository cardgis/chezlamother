# 🍽️ Foodie - Restaurant Next.js App

Application complète de commande en ligne pour restaurant sénégalais avec intégration Wave Payment.

## ✨ Fonctionnalités

- 🔐 **Authentification complète** : Inscription, connexion, réinitialisation de mot de passe
- 🛒 **Commandes en ligne** : Panier, gestion des quantités, calcul automatique
- 💳 **Paiement Wave** : Intégration complète avec QR codes et suivi en temps réel
- 📱 **Responsive** : Interface adaptée mobile et desktop
- 👨‍💼 **Panel Admin** : Gestion des commandes et des statuts
- 🗺️ **Géolocalisation** : Cartes Google Maps et Leaflet
- 📧 **Notifications** : Email (SendGrid)
- 🗄️ **Base de données** : Prisma ORM avec PostgreSQL (Neon)

## 🚀 Tech Stack

- **Frontend** : Next.js 15, React 19, TailwindCSS
- **Backend** : Next.js API Routes, Prisma ORM
- **Base de données** : PostgreSQL (Neon Database)
- **Paiement** : Wave Senegal API avec QR Code
- **Déploiement** : Vercel
- **Authentification** : JWT + bcryptjs
- **Email** : SendGrid

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/USERNAME/foodie-nextjs-app.git
cd foodie-nextjs-app/next-app

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.neon.example .env.local
# Éditer .env.local avec vos vraies clés

# Initialiser la base de données
npx prisma generate
npx prisma db push

# Lancer en développement
npm run dev
```

## 🔧 Configuration

### Variables d'environnement requises :

```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="votre-secret-jwt"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
WAVE_API_KEY="votre-cle-wave"
WAVE_SECRET="votre-secret-wave"
SENDGRID_API_KEY="votre-cle-sendgrid"
```

## 🌐 Déploiement

Consultez le [Guide de déploiement](DEPLOYMENT-GUIDE.md) pour les instructions complètes Vercel + Neon.

## 📊 Structure du projet

```
next-app/
├── src/
│   ├── app/                 # App Router Next.js
│   │   ├── api/            # Routes API
│   │   ├── auth/           # Pages d'authentification
│   │   └── admin/          # Panel administrateur
│   ├── components/         # Composants React
│   └── utils/             # Utilitaires
├── prisma/                # Schéma et migrations
├── public/                # Assets statiques
└── styles/               # Styles CSS
```

## 🍽️ Catégories de plats

- **Plats principaux** : Thieb, Mafé, Yassa, Soupes
- **Grillades** : Poissons et viandes grillés
- **Accompagnements** : Riz, Frites, Alloco, Attieké
- **Pizzas** : Variété de pizzas
- **Boissons** : Bissap, Bouye, Gingembre, Moringa, Cafés, Thés
- **Desserts** : Fruits, Tiramisù, Glaces, Gâteaux

## 🔒 Sécurité

- Hachage des mots de passe avec bcryptjs
- Tokens JWT sécurisés
- Validation des entrées
- Protection CSRF
- Variables d'environnement sécurisées

## 📱 Mobile First

Interface entièrement responsive avec :
- Navigation adaptée mobile
- Cartes optimisées tactile
- Formulaires ergonomiques
- QR codes Wave optimisés

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support, contactez [votre-email@domain.com]

---

Développé avec ❤️ pour la communauté sénégalaise