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

  const unavailable = (sectionKey === 'plats_midi' && !(isAvailableToday || product.dayAvailable === 'tous_les_jours')) || (sectionKey !== 'plats_midi' && !isGloballyAvailable);
  return (
    <div className={`menu-card${unavailable ? ' is-unavailable' : ''} relative`}>
      {/* Badge jour (plats midi) */}
      {shouldShowDayTag && product.dayAvailable !== 'tous_les_jours' && (
        <span className="badge badge-day">{product.dayAvailable}</span>
      )}
      {/* Image vignette optimisée */}
      <div className="menu-thumb bg-cream ring-2 ring-saffron/40 shadow-soft">
        {product.image ? (
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            width={208}
            height={208}
            className="object-cover w-full h-full rounded-full"
            style={{maxWidth:'208px',maxHeight:'208px'}}
          />
        ) : (
          <span className="menu-thumb--ph">Image à venir</span>
        )}
      </div>
      {/* Nom du produit */}
      <h3 className="menu-name mb-1 text-primary font-display text-xl">{product.name}</h3>
      {/* Description courte */}
      {product.shortDescription && (
        <p className="menu-desc text-slate-500 text-sm mb-2 font-body leading-relaxed">{product.shortDescription}</p>
      )}
      {/* Prix */}
      {product.price && (
        <div className="price-chip bg-saffron text-ink font-bold shadow-soft border border-saffron/30">{formatPrice(product.price)}</div>
      )}
      {/* Boutons actions */}
      <div className="flex justify-center gap-2 mt-4">
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
        <p className="text-red-500 text-xs mt-2">Disponible le {product.dayAvailable}</p>
      )}
      {sectionKey !== 'plats_midi' && !isGloballyAvailable && (
        <p className="text-red-500 text-xs mt-2">Produit temporairement indisponible</p>
      )}
    </div>
  );
}
