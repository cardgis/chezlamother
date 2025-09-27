import jwt from 'jsonwebtoken';

// Clé secrète pour signer les JWT (à mettre dans les variables d'environnement)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';

// Durées d'expiration
const ACCESS_TOKEN_EXPIRY = '30m'; // 30 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 jours

/**
 * Générer un access token (courte durée)
 */
export function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'chezlamother',
    audience: 'chezlamother-users'
  });
}

/**
 * Générer un refresh token (longue durée)
 */
export function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    issuer: 'chezlamother',
    audience: 'chezlamother-users'
  });
}

/**
 * Vérifier un access token
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'chezlamother',
      audience: 'chezlamother-users'
    });
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
}

/**
 * Vérifier un refresh token
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'chezlamother',
      audience: 'chezlamother-users'
    });
  } catch (error) {
    throw new Error('Refresh token invalide ou expiré');
  }
}

/**
 * Extraire le token des cookies de la requête
 */
export function getTokenFromRequest(request) {
  const cookies = request.headers.get('cookie');
  if (!cookies) return null;
  
  const accessTokenMatch = cookies.match(/accessToken=([^;]+)/);
  return accessTokenMatch ? accessTokenMatch[1] : null;
}

/**
 * Extraire le refresh token des cookies de la requête
 */
export function getRefreshTokenFromRequest(request) {
  const cookies = request.headers.get('cookie');
  if (!cookies) return null;
  
  const refreshTokenMatch = cookies.match(/refreshToken=([^;]+)/);
  return refreshTokenMatch ? refreshTokenMatch[1] : null;
}

/**
 * Créer des options de cookies sécurisés
 */
export function getSecureCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction, // HTTPS uniquement en production
    sameSite: 'lax', // Lax au lieu de strict pour éviter les problèmes de cross-site
    path: '/',
  };
}

/**
 * Créer les headers Set-Cookie pour les tokens
 */
export function createAuthCookies(accessToken, refreshToken) {
  const cookieOptions = getSecureCookieOptions();
  
  const accessCookie = `accessToken=${accessToken}; Path=${cookieOptions.path}; HttpOnly; ${
    cookieOptions.secure ? 'Secure;' : ''
  } SameSite=${cookieOptions.sameSite}; Max-Age=1800`; // 30 minutes
  
  const refreshCookie = `refreshToken=${refreshToken}; Path=${cookieOptions.path}; HttpOnly; ${
    cookieOptions.secure ? 'Secure;' : ''
  } SameSite=${cookieOptions.sameSite}; Max-Age=604800`; // 7 jours
  
  return [accessCookie, refreshCookie];
}

/**
 * Créer les headers pour supprimer les cookies
 */
export function clearAuthCookies() {
  const cookieOptions = getSecureCookieOptions();
  
  const clearAccess = `accessToken=; Path=${cookieOptions.path}; HttpOnly; ${
    cookieOptions.secure ? 'Secure;' : ''
  } SameSite=${cookieOptions.sameSite}; Max-Age=0`;
  
  const clearRefresh = `refreshToken=; Path=${cookieOptions.path}; HttpOnly; ${
    cookieOptions.secure ? 'Secure;' : ''
  } SameSite=${cookieOptions.sameSite}; Max-Age=0`;
  
  return [clearAccess, clearRefresh];
}