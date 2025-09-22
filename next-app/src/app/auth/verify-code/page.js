"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyCodePage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("Code validé. Vous pouvez maintenant choisir un nouveau mot de passe.");
        setTimeout(() => router.push(`/auth/reset-password?token=${data.resetToken}`), 1500);
      } else {
        setMessage(data.error || "Code incorrect ou expiré.");
      }
    } catch {
      setMessage("Erreur serveur. Réessayez plus tard.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <form className="bg-white p-8 rounded shadow w-full max-w-sm" onSubmit={handleVerify}>
        <h2 className="text-2xl font-bold mb-6 text-center">Vérifier le code SMS</h2>
        <input
          type="text"
          placeholder="Numéro de téléphone"
          className="w-full mb-4 p-2 border rounded text-black"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Code reçu par SMS"
          className="w-full mb-4 p-2 border rounded text-black"
          value={code}
          onChange={e => setCode(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-700 text-white py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? "Vérification..." : "Vérifier le code"}
        </button>
        {message && <div className="mt-4 text-center text-green-700">{message}</div>}
      </form>
    </div>
  );
}
