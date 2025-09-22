import crypto from 'crypto';

// Clé secrète pour le hachage (à mettre dans .env en production)
const SECRET_KEY = process.env.PRODUCT_HASH_SECRET || 'your-secret-key-change-in-production';

/**
 * Génère un hash opaque pour un ID de produit
 * @param {string|number} productId - L'ID réel du produit
 * @returns {string} - Hash opaque sécurisé
 */
export function generateProductHash(productId) {
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(String(productId));
  return hmac.digest('hex').substring(0, 16); // 16 caractères pour un hash plus court
}

/**
 * Vérifie si un hash correspond à un ID de produit
 * @param {string} hash - Le hash à vérifier
 * @param {string|number} productId - L'ID réel du produit
 * @returns {boolean} - True si le hash correspond
 */
export function verifyProductHash(hash, productId) {
  const expectedHash = generateProductHash(productId);
  return hash === expectedHash;
}

/**
 * Trouve l'ID d'un produit à partir de son hash en parcourant tous les produits
 * @param {string} hash - Le hash à décoder
 * @param {Array} products - Liste de tous les produits
 * @returns {string|null} - L'ID du produit ou null si non trouvé
 */
export function findProductIdByHash(hash, products) {
  for (const product of products) {
    if (verifyProductHash(hash, product.id)) {
      return String(product.id);
    }
  }
  return null;
}

/**
 * Génère un hash opaque pour l'URL à partir d'un produit
 * @param {Object} product - Le produit
 * @returns {string} - Hash pour l'URL
 */
export function generateSecureProductUrl(product) {
  return generateProductHash(product.id);
}