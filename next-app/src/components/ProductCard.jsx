"use client";
import React from 'react';
import ImageWithFallback from './ImageWithFallback';
import { formatPrice } from '../utils/products';
import { cart } from '../utils/cart';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product, sectionKey }) {
  const router = useRouter();
  const shouldShowDayTag = sectionKey === 'plats_midi' && product.dayAvailable;

  // Determine if product is available today (midi meals section)
  let isAvailableToday = true;
  if (sectionKey === 'plats_midi' && product.dayAvailable && product.dayAvailable !== 'tous_les_jours') {
    const days = ['lundi','mardi','mercredi','jeudi','vendredi'];
    const today = days[new Date().getDay() - 1];
    isAvailableToday = product.dayAvailable === today;
  }

  // For all other categories, use the available flag
  const isGloballyAvailable = product.available !== false;

  const handleAddToCart = () => {
    if ((sectionKey === 'plats_midi' && (isAvailableToday || product.dayAvailable === 'tous_les_jours')) || (sectionKey !== 'plats_midi' && isGloballyAvailable)) {
      cart.addItem(product, 1);
    }
  };

  const handleDetails = () => {
    if ((sectionKey === 'plats_midi' && (isAvailableToday || product.dayAvailable === 'tous_les_jours')) || (sectionKey !== 'plats_midi' && isGloballyAvailable)) {
      // Utiliser slug pour l'instant (à sécuriser plus tard)
      function slugify(str) {
        return str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/['']/g, '')
          .replace(/\s+/g, '-')
          .replace(/[()]/g, '')
          .replace(/[^a-zA-Z0-9\-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
          .toLowerCase();
      }
      const slug = product.slug || slugify(product.name);
      router.push(`/product/${slug}`);
    }
  };

  // ...existing code...
  const unavailable = (sectionKey === 'plats_midi' && !(isAvailableToday || product.dayAvailable === 'tous_les_jours')) || (sectionKey !== 'plats_midi' && !isGloballyAvailable);
  return (
  <div className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-transform duration-200 hover:-translate-y-1 overflow-hidden relative ${unavailable ? 'opacity-80 grayscale' : ''}`}>
      {/* Badge jour ou indisponible */}
      {shouldShowDayTag && product.dayAvailable !== 'tous_les_jours' && (
        <span className="absolute left-4 top-4 z-10 text-xs px-3 py-1 rounded-full border bg-green-600 text-white border-green-600">{product.dayAvailable}</span>
      )}
      {unavailable && (
        <span className="absolute right-4 top-4 z-10 text-xs px-3 py-1 rounded-full border bg-red-500 text-white border-red-500">Indisponible</span>
      )}
      {/* Image ronde premium, taille 400x400px */}
      <div className="flex justify-center items-center mt-6 mb-2">
        <div className="w-40 h-40 rounded-full overflow-hidden ring-2 ring-yellow-300 shadow bg-cream flex items-center justify-center">
          <ImageWithFallback
            src={product.image || '/images/default-product.jpg'}
            alt={product.name}
            width={400}
            height={400}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
  {/* Nom du produit */}
  <h3 className="text-blue-900 font-bold text-2xl text-center mb-1">{product.name}</h3>
      {/* Description concise */}
      {product.shortDescription && (
        <p className="text-gray-600 text-base text-center mb-2 leading-relaxed px-4">{product.shortDescription}</p>
      )}
      {/* Prix chip colorée */}
      {product.price && (
        <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-400 text-blue-900 text-sm font-bold shadow mx-auto">{formatPrice(product.price)}</div>
      )}
      {/* Boutons actions */}
      <div className="flex justify-center gap-2 mt-4 mb-6">
        <button
          onClick={handleDetails}
          disabled={unavailable}
          className={`inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-semibold transition ${unavailable ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-yellow-400 text-blue-900 hover:bg-yellow-500 hover:text-white'}`}
        >
          Détails
        </button>
        <button
          onClick={handleAddToCart}
          disabled={unavailable}
          className={`inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-semibold transition ${unavailable ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white shadow hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300'}`}
        >
          {unavailable ? 'Indisponible' : 'Ajouter'}
        </button>
      </div>
      {/* Message d'indisponibilité */}
      {sectionKey === 'plats_midi' && !(isAvailableToday || product.dayAvailable === 'tous_les_jours') && (
        <p className="text-red-500 text-xs text-center mb-2">Disponible le {product.dayAvailable}</p>
      )}
      {sectionKey !== 'plats_midi' && !isGloballyAvailable && (
        <p className="text-red-500 text-xs text-center mb-2">Produit temporairement indisponible</p>
      )}
    </div>
  );
}
