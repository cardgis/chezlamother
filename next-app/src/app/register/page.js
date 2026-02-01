"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Check if already registered
    const userInfo = typeof window !== 'undefined' ? localStorage.getItem('userInfo') : null;
    if (userInfo) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = 'Le nom est requis';
    if (!phone.trim()) errs.phone = 'Le numéro de téléphone est requis';
    else if (!/^\d{10}$/.test(phone.replace(/\s/g, ''))) errs.phone = 'Numéro invalide (10 chiffres)';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Save to localStorage
    const userInfo = { name: name.trim(), phone: phone.replace(/\s/g, '') };
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">S'inscrire</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Nom complet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Votre nom"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Numéro de téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="06 12 34 56 78"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold"
          >
            S'inscrire
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          Déjà inscrit ? <a href="/" className="text-green-600 hover:underline">Retour à l'accueil</a>
        </p>
      </div>
    </div>
  );
}