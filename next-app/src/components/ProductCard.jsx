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
    <div className={`bg-white rounded-xl2 shadow-soft hover:shadow-lift transition-transform duration-200 hover:-translate-y-1 overflow-hidden relative${unavailable ? ' opacity-80' : ''}`}>
      {/* Badge jour ou indisponible */}
      {shouldShowDayTag && product.dayAvailable !== 'tous_les_jours' && (
        <span className="badge left-4 top-4 absolute z-10 bg-green-600 text-white border-green-600">{product.dayAvailable}</span>
      )}
      {unavailable && (
        <span className="badge right-4 top-4 absolute z-10 text-red-500 font-bold">Indisponible</span>
      )}
      {/* Image ronde premium, taille 400x400px */}
      <div className="flex justify-center items-center mt-6 mb-2">
        <div className="w-40 h-40 rounded-full overflow-hidden ring-2 ring-saffron/40 shadow-soft bg-cream flex items-center justify-center">
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
  <h3 className="text-ink font-display text-2xl font-bold text-center mb-1">{product.name}</h3>
      {/* Description concise */}
      {product.shortDescription && (
        <p className="text-slate-700 text-base text-center mb-2 font-body leading-relaxed px-4">{product.shortDescription}</p>
      )}
      {/* Prix chip améliorée */}
      {product.price && (
        <div className="mx-auto flex justify-center items-center">
          <span style={{background: '#FFD600', color: '#1a237e', fontWeight: 'bold', fontSize: '1.1rem', padding: '2px 10px', borderRadius: '6px', letterSpacing: '1px', boxShadow: '0 1px 6px 0 #f7e07c33'}}>{formatPrice(product.price)}</span>
        </div>
      )}
      {/* Boutons actions */}
      <div className="flex justify-center gap-2 mt-4 mb-6">
        <button
          onClick={handleDetails}
          disabled={unavailable}
          className={`btn${unavailable ? ' btn-disabled bg-gray-300 text-gray-500' : ' bg-saffron text-ink hover:bg-saffron-600 hover:text-white transition'}`}
        >
          Détails
        </button>
        <button
          onClick={handleAddToCart}
          disabled={unavailable}
          className={`btn${unavailable ? ' btn-disabled bg-gray-300 text-gray-500' : ' bg-primary text-white shadow-lift hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary/30 transition'}`}
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
