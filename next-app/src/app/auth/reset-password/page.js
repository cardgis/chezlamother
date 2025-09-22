
"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  // const token = params.get("token") || ""; // Supprimé car déjà déclaré plus haut
  React.useEffect(() => {
    if (typeof window !== "undefined" && token) {
      const url = window.location.pathname;
      window.history.replaceState({}, '', url);
    }
  }, [token]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // const token = params.get("token") || ""; // Supprimé car déjà déclaré plus haut

  // Envoi du mail de réinitialisation
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/send-reset-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("Un email de réinitialisation a été envoyé.");
      } else {
        setMessage(data.error || "Erreur lors de l'envoi du mail.");
      }
    } catch {
      setMessage("Erreur serveur. Réessayez plus tard.");
    }
    setLoading(false);
  };

  // Réinitialisation du mot de passe via le lien
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    // Password strength validation (frontend)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("Mot de passe réinitialisé. Vous pouvez vous connecter.");
        setTimeout(() => router.push("/auth/login"), 1500);
      } else {
        setMessage(data.error || "Erreur lors de la réinitialisation.");
      }
    } catch {
      setMessage("Erreur serveur. Réessayez plus tard.");
    setLoading(false);
  }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {!token ? (
        <form className="bg-white p-8 rounded shadow w-full max-w-sm" onSubmit={handleSendEmail}>
          <h2 className="text-2xl font-bold mb-6 text-center">Réinitialiser le mot de passe</h2>
          <input
            type="email"
            placeholder="Votre email"
            className="w-full mb-4 p-2 border rounded text-black"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded font-semibold"
            disabled={loading}
          >
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>
          {message && <div className="mt-4 text-center text-blue-700">{message}</div>}
        </form>
      ) : (
        <form className="bg-white p-8 rounded shadow w-full max-w-sm" onSubmit={handleReset}>
          <h2 className="text-2xl font-bold mb-6 text-center">Nouveau mot de passe</h2>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nouveau mot de passe"
              className="w-full p-2 border rounded text-black"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-sm text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Masquer" : "Afficher"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded font-semibold"
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Valider"}
          </button>
          {message && <div className="mt-4 text-center text-green-700">{message}</div>}
        </form>
      )}
    </div>
  );
  }
