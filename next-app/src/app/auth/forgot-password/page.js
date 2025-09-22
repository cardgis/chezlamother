"use client";
import { useState } from "react";
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
        setSent(true);
      } else {
        setMessage(data.error || "Erreur lors de l'envoi du mail.");
      }
    } catch {
      setMessage("Erreur serveur. Réessayez plus tard.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
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
        {sent && <div className="mt-4 text-center text-green-700">Vérifiez votre boîte mail pour le lien de réinitialisation.</div>}
      </form>
    </div>
  );
}
