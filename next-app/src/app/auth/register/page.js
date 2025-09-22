"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    // Password strength validation (frontend)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur d'inscription");
        return;
      }
      // Optionally, auto-login after registration
      router.push("/auth/login");
    } catch (err) {
      setError("Erreur serveur. Réessayez plus tard.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <form className="bg-white p-8 rounded shadow w-full max-w-sm" onSubmit={handleRegister}>
        <h2 className="text-2xl font-bold mb-6 text-center">Inscription</h2>
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
  <input type="text" placeholder="Nom" className="w-full mb-4 p-2 border rounded text-black" value={name} onChange={e => setName(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))} required />
        <input type="email" placeholder="Email" className="w-full mb-4 p-2 border rounded text-black" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mot de passe" className="w-full mb-2 p-2 border rounded text-black" value={password} onChange={e => setPassword(e.target.value)} required />
        {/* Password rules with live indicators */}
        <div className="mb-4 text-sm">
          <div className="flex items-center mb-1">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${password.length >= 8 ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-black">Au moins 8 caractères</span>
          </div>
          <div className="flex items-center mb-1">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-black">Une majuscule</span>
          </div>
          <div className="flex items-center mb-1">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${/\d/.test(password) ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-black">Un chiffre</span>
          </div>
          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-black">Un caractère spécial</span>
          </div>
        </div>
  <input type="text" placeholder="Numéro de téléphone" className="w-full mb-4 p-2 border rounded text-black" value={phone} onChange={e => setPhone(e.target.value)} title="Format Sénégal: +221 78 879 43 71 ou +221788794371" required />
        <select className="w-full mb-6 p-2 border rounded text-black" value={role} onChange={e => setRole(e.target.value)}>
          <option value="client" className="text-black">Client</option>
          <option value="admin" className="text-black">Admin</option>
        </select>
        <button type="submit" className="w-full bg-green-700 text-white py-2 rounded font-semibold">S'inscrire</button>
        <div className="mt-4 text-center">
          <a href="/auth/login" className="text-green-700 underline">Déjà un compte ? Se connecter</a>
        </div>
      </form>
    </div>
  );
}
