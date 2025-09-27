"use client";
import { useState, useEffect, createContext, useContext } from 'react';

// Contexte d'authentification
const AuthContext = createContext({});

// Hook pour utiliser le contexte d'auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

// Provider d'authentification
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  // Vérifier si l'utilisateur est authentifié
  const checkAuth = async () => {
    try {
      console.log('🔍 Vérification authentification...');
      console.log('🍪 Document cookies:', typeof window !== 'undefined' ? document.cookie : 'N/A');
      
      const res = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include', // Inclure les cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Réponse verify - Status:', res.status);
      const data = await res.json();
      console.log('📊 Réponse verify - Data:', data);

      if (res.ok && data.valid) {
        console.log('✅ Utilisateur authentifié:', data.user);
        setUser(data.user);
        setIsAuthenticated(true);
        
        if (data.refreshed) {
          console.log('🔄 Token rafraîchi automatiquement');
        }
      } else {
        console.log('❌ Non authentifié:', data);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Fonction de connexion (à appeler après le login)
  const login = (userData) => {
    console.log('✅ Connexion réussie:', userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      console.log('🚪 Déconnexion...');
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Déconnexion réussie');
      
      // Rediriger vers la page d'accueil
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      // Forcer la déconnexion côté client même en cas d'erreur
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Rafraîchir les données utilisateur
  const refreshAuth = () => {
    checkAuth();
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshAuth,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}