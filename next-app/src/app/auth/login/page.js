"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Email ou mot de passe incorrect");
        return;
      }
      // Stocker le token et l'utilisateur
      localStorage.setItem("token", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      if (data.user.role === "admin") {
        router.push("/admin/orders");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("Erreur serveur. Réessayez plus tard.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <form className="bg-white p-8 rounded shadow w-full max-w-sm" onSubmit={handleLogin}>
        <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
        <input type="email" placeholder="Email" className="w-full mb-4 p-2 border rounded text-black" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mot de passe" className="w-full mb-6 p-2 border rounded text-black" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="w-full bg-green-700 text-white py-2 rounded font-semibold">Se connecter</button>
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
