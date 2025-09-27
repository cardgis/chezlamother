"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, checkAuth, user, isAuthenticated } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (redirecting && isAuthenticated && user) {
      if (user.role === "admin") {
        router.push("/admin/orders");
      } else {
        router.push("/");
      }
    }
  }, [redirecting, isAuthenticated, user, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setRedirecting(false);
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important pour inclure les cookies
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Email ou mot de passe incorrect");
        setLoading(false);
        return;
      }
      
      // Utiliser le hook d'auth pour mettre à jour l'état global
      login(data.user);
      // Recharger le contexte d'authentification depuis le cookie
      await checkAuth();
      setRedirecting(true);
    } catch (err) {
      setError("Erreur serveur. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <form className="bg-white p-8 rounded shadow w-full max-w-sm" onSubmit={handleLogin}>
        <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
        <input type="email" placeholder="Email" className="w-full mb-4 p-2 border rounded text-black" value={email} onChange={e => setEmail(e.target.value)} required />
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mot de passe"
            className="w-full p-2 border rounded text-black pr-16"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-2 top-2 text-green-700 underline bg-transparent border-none cursor-pointer text-sm"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? "Masquer" : "Afficher"}
          </button>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-700 text-white py-2 rounded font-semibold disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        <div className="mt-4 text-center">
          <a href="/auth/register" className="text-green-700 underline">Créer un compte</a>
        </div>
        <div className="mt-4 text-center">
            <button
              type="button"
              className="text-green-700 underline bg-transparent border-none cursor-pointer"
              onClick={() => {
                if (!email) {
                  setError("Veuillez saisir votre adresse mail avant de demander la réinitialisation.");
                  return;
                }
                localStorage.setItem('resetEmail', email);
                window.location.href = "/auth/forgot-password";
              }}
            >
              Mot de passe oublié ?
            </button>
        </div>
      </form>
    </div>
  );
}
