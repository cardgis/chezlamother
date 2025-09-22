"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import { fetchProductsData, formatPrice } from '../../../utils/products';
import ImageWithFallback from '../../../components/ImageWithFallback';
import Header from '../../../components/Header';

export default function ProductDetailPage() {
  // La logique de disponibilité doit être placée après la vérification du produit
  const params = useParams();
  const slugOrId = params?.id;
  // Recherche par slug ou id
  // Fonction pour générer un slug compatible URL (remplace espaces, parenthèses, accents, etc.)
  function slugify(str) {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // retire les accents
      .replace(/['’]/g, '') // retire apostrophes
      .replace(/\s+/g, '-')
      .replace(/[()]/g, '')
      .replace(/[^a-zA-Z0-9\-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }

  const [product, setProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetchProductsData()
      .then(data => {
        const found = data.find(p => {
          const slug = p.slug || slugify(p.name);
          return String(p.id) === String(slugOrId) || slug.toLowerCase() === String(slugOrId).toLowerCase();
        });
        setProduct(found);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur de chargement du produit');
        setLoading(false);
      });
  }, [slugOrId]);

  const [similarProducts, setSimilarProducts] = React.useState([]);

  React.useEffect(() => {
    async function fetchSimilar() {
      if (!product) return;
      const res = await fetch(`/product/${slugOrId}/similar`);
      if (res.ok) {
        const data = await res.json();
        setSimilarProducts(data || []);
      }
    }
    fetchSimilar();
  }, [slugOrId, product]);

  if (loading) {
    return <div className="min-h-screen bg-white font-sans flex items-center justify-center"><span className="text-black">Chargement du produit...</span></div>;
  }
  if (error || !product) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Produit introuvable</h1>
          <a href="/" className="text-green-800 underline">Retour à l'accueil</a>
        </div>
      </div>
    );
  }

  // Logique de disponibilité pour plats du midi (après vérification du produit)
  let isAvailableToday = true;
  if (product.subcategory === 'plats_midi' && product.dayAvailable && product.dayAvailable !== 'tous_les_jours') {
    const days = ['lundi','mardi','mercredi','jeudi','vendredi'];
    const today = days[new Date().getDay() - 1];
    isAvailableToday = product.dayAvailable === today;
  }

  // ...existing code...

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <div className="max-w-3xl mx-auto mt-8 p-4 bg-green-50 rounded-2xl shadow">
        <div className="mb-4">
          <a href="/" className="text-green-800 underline font-semibold hover:text-green-900 transition-colors">← Retour à l'accueil</a>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <ImageWithFallback src={product.image} alt={product.name} className="w-full md:w-96 h-auto rounded-2xl" width={400} height={300} />
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 text-lg">{product.description}</p>
            {/* Affiche le texte d'indisponibilité */}
            {product.subcategory === 'plats_midi' && !isAvailableToday && product.dayAvailable !== 'tous_les_jours' && (
              <div className="text-red-600 text-sm font-semibold mb-2">Indisponible aujourd'hui</div>
            )}
            <div className="flex items-center gap-4 mt-2">
              <span className="text-2xl font-bold text-green-800">{formatPrice(product.price)}</span>
              {product.volume && <span className="text-sm text-gray-500">{product.volume}</span>}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-yellow-400">★</span>
              <span className="text-gray-700 font-semibold">{product.rating}</span>
              <span className="text-gray-500">({product.reviews} avis)</span>
            </div>
            <button className="bg-green-800 text-white px-6 py-3 rounded-lg hover:bg-green-900 font-semibold mt-4" onClick={() => {
              import('../../../utils/cart').then(({ cart }) => {
                // Plats du midi : ajout seulement si dispo
                if (product.subcategory === 'plats_midi') {
                  if (isAvailableToday || product.dayAvailable === 'tous_les_jours') {
                    cart.addItem(product, 1);
                  }
                } else {
                  cart.addItem(product, 1);
                }
              });
            }}
            disabled={product.subcategory === 'plats_midi' && !(isAvailableToday || product.dayAvailable === 'tous_les_jours')}
            style={product.subcategory === 'plats_midi' && !(isAvailableToday || product.dayAvailable === 'tous_les_jours') ? { backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' } : {}}
          >
            {product.subcategory === 'plats_midi' && !(isAvailableToday || product.dayAvailable === 'tous_les_jours') ? 'Indisponible' : 'Ajouter au panier'}
          </button>
          </div>
        </div>
        {/* Similar products section */}
        {similarProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Produits similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.slice(0, 4).map(sp => (
                <div key={sp.id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                  <ImageWithFallback src={sp.image} alt={sp.name} className="w-32 h-24 object-cover rounded-lg mb-2" width={128} height={96} />
                  <div className="font-semibold text-gray-800 text-center">{sp.name}</div>
                  <div className="text-green-700 font-bold mt-1">{formatPrice(sp.price)}</div>
                  {/* Logique d'indisponibilité similaire */}
                  {sp.subcategory === 'plats_midi' && sp.dayAvailable && sp.dayAvailable !== 'tous_les_jours' ? (
                    (() => {
                      const days = ['lundi','mardi','mercredi','jeudi','vendredi'];
                      const today = days[new Date().getDay() - 1];
                      const isAvailableToday = sp.dayAvailable === today;
                      return (
                        <button
                          className={`px-4 py-2 rounded-lg font-semibold mt-2 w-full ${isAvailableToday || sp.dayAvailable === 'tous_les_jours' ? 'bg-green-800 text-white hover:bg-green-900' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                          onClick={() => {
                            if (isAvailableToday || sp.dayAvailable === 'tous_les_jours') {
                              import('../../../utils/cart').then(({ cart }) => cart.addItem(sp, 1));
                            }
                          }}
                          disabled={!(isAvailableToday || sp.dayAvailable === 'tous_les_jours')}
                        >
                          {isAvailableToday || sp.dayAvailable === 'tous_les_jours' ? 'Ajouter' : 'Indisponible'}
                        </button>
                      );
                    })()
                  ) : (
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold mt-2 w-full ${sp.available === false ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-800 text-white hover:bg-green-900'}`}
                      onClick={() => {
                        if (sp.available !== false) {
                          import('../../../utils/cart').then(({ cart }) => cart.addItem(sp, 1));
                        }
                      }}
                      disabled={sp.available === false}
                    >
                      {sp.available === false ? 'Indisponible' : 'Ajouter'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
