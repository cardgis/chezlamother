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
  <div className={`border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 ${unavailable ? 'opacity-80 grayscale' : ''}`}>
      {/* Badge jour ou indisponible */}
      {shouldShowDayTag && product.dayAvailable !== 'tous_les_jours' && (
        <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">{product.dayAvailable}</div>
      )}
      {unavailable && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">Indisponible</div>
      )}
      {/* Image ronde premium, taille 400x400px */}
      <div className="relative">
        <ImageWithFallback
          src={product.image || '/images/default-product.jpg'}
          alt={product.name}
          width={400}
          height={250}
          className="w-full h-48 object-cover"
        />
      </div>
  {/* Nom du produit */}
  <h3 className="font-semibold text-lg mb-2 text-gray-800">{product.name}</h3>
      {/* Description concise */}
      {product.shortDescription && (
        <p className="text-gray-600 text-sm mb-4">{product.shortDescription}</p>
      )}
      {/* Prix chip colorée */}
      {product.price && (
        <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded text-sm font-medium">{formatPrice(product.price)}</div>
      )}
      {/* Boutons actions */}
      <div className="flex justify-between items-center mt-4 gap-2">
        <button
          onClick={handleDetails}
          disabled={
            (sectionKey === 'plats_midi' && !(isAvailableToday || product.dayAvailable === 'tous_les_jours')) ||
            (sectionKey !== 'plats_midi' && !isGloballyAvailable)
          }
          className={`
            px-3 py-1.5 rounded text-xs font-medium transition-colors
            ${(sectionKey === 'plats_midi' && (isAvailableToday || product.dayAvailable === 'tous_les_jours')) || (sectionKey !== 'plats_midi' && isGloballyAvailable)
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Détails
        </button>
        <button
          onClick={handleAddToCart}
          disabled={
            (sectionKey === 'plats_midi' && !(isAvailableToday || product.dayAvailable === 'tous_les_jours')) ||
            (sectionKey !== 'plats_midi' && !isGloballyAvailable)
          }
          className={`
            px-3 py-1.5 rounded text-xs font-medium transition-colors
            ${(sectionKey === 'plats_midi' && (isAvailableToday || product.dayAvailable === 'tous_les_jours')) || (sectionKey !== 'plats_midi' && isGloballyAvailable)
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {(sectionKey === 'plats_midi' && !(isAvailableToday || product.dayAvailable === 'tous_les_jours')) || (sectionKey !== 'plats_midi' && !isGloballyAvailable)
            ? 'Indisponible'
            : 'Ajouter'
          }
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
