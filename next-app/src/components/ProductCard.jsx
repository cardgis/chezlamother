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

  return (
    <article className="relative prod-card">
      {shouldShowDayTag && product.dayAvailable !== 'tous_les_jours' && (
        <span className="prod-badge">{product.dayAvailable}</span>
      )}
      <ImageWithFallback
        src={product.image || '/images/default-product.jpg'}
        alt={product.name}
        width={400}
        height={250}
        className="prod-img"
      />
      <h3 className="prod-title">{product.name}</h3>
      {product.shortDescription && (
        <p className="prod-desc">{product.shortDescription}</p>
      )}
      <div className="prod-price">{formatPrice(product.price)}</div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleDetails}
          disabled={
            (sectionKey === 'plats_midi' && !(isAvailableToday || product.dayAvailable === 'tous_les_jours')) ||
            (sectionKey !== 'plats_midi' && !isGloballyAvailable)
          }
          className={`prod-btn ${((sectionKey === 'plats_midi' && (isAvailableToday || product.dayAvailable === 'tous_les_jours')) || (sectionKey !== 'plats_midi' && isGloballyAvailable)) ? '' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          Détails
        </button>
        <button
          onClick={handleAddToCart}
          disabled={
            (sectionKey === 'plats_midi' && !(isAvailableToday || product.dayAvailable === 'tous_les_jours')) ||
            (sectionKey !== 'plats_midi' && !isGloballyAvailable)
          }
          className={`prod-btn ${((sectionKey === 'plats_midi' && (isAvailableToday || product.dayAvailable === 'tous_les_jours')) || (sectionKey !== 'plats_midi' && isGloballyAvailable)) ? '' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          {((sectionKey === 'plats_midi' && !(isAvailableToday || product.dayAvailable === 'tous_les_jours')) || (sectionKey !== 'plats_midi' && !isGloballyAvailable))
            ? 'Indisponible'
            : 'Ajouter'
          }
        </button>
      </div>
      {(sectionKey === 'plats_midi' && !(isAvailableToday || product.dayAvailable === 'tous_les_jours')) && (
        <p className="text-red-500 text-xs mt-2">
          Disponible le {product.dayAvailable}
        </p>
      )}
      {(sectionKey !== 'plats_midi' && !isGloballyAvailable) && (
        <p className="text-red-500 text-xs mt-2">
          Produit temporairement indisponible
        </p>
      )}
    </article>
  );
}
