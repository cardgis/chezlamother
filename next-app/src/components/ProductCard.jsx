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
    <div className={`bg-white rounded-xl2 shadow-soft hover:shadow-lift transition-transform duration-200 hover:-translate-y-1 overflow-hidden relative ${unavailable ? 'opacity-80 grayscale' : ''}`}>
      {/* Badge jour ou indisponible */}
      {shouldShowDayTag && product.dayAvailable !== 'tous_les_jours' && (
        <span className="badge badge-day left-4 top-4 absolute z-10">{product.dayAvailable}</span>
      )}
      {unavailable && (
        <span className="badge badge--off right-4 top-4 absolute z-10">Indisponible</span>
      )}
      {/* Image ronde premium */}
      <div className="flex justify-center items-center mt-6 mb-2">
        <div className="w-32 h-32 rounded-full overflow-hidden ring-2 ring-saffron/40 shadow-soft bg-cream flex items-center justify-center">
          <ImageWithFallback
            src={product.image || '/images/default-product.jpg'}
            alt={product.name}
            width={128}
            height={128}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
      {/* Nom du produit */}
      <h3 className="font-display text-xl font-semibold text-ink text-center mb-1">{product.name}</h3>
      {/* Description concise */}
      {product.shortDescription && (
        <p className="text-slate-500 text-sm text-center mb-2 font-body leading-relaxed px-4">{product.shortDescription}</p>
      )}
      {/* Prix chip colorée */}
      {product.price && (
        <div className="price-chip bg-saffron text-ink font-bold shadow-soft border border-saffron/30 mx-auto">{formatPrice(product.price)}</div>
      )}
      {/* Boutons actions */}
      <div className="flex justify-center gap-2 mt-4 mb-6">
        <button
          onClick={handleDetails}
          disabled={unavailable}
          className={`btn btn-ghost${unavailable ? ' btn-disabled' : ' border border-primary text-primary hover:bg-primary hover:text-white transition'}`}
        >
          Détails
        </button>
        <button
          onClick={handleAddToCart}
          disabled={unavailable}
          className={`btn btn-primary${unavailable ? ' btn-disabled' : ' bg-primary text-white shadow-lift hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary/30 transition'}`}
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
