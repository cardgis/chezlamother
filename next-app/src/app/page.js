"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '../components/Header';
import ProductSection from '../components/ProductSection';
import { fetchProductsData, productSections, formatPrice } from '../utils/products';

const LeafletMapChezLaMother = dynamic(() => import('../components/LeafletMapChezLaMother'), { ssr: false });

export default function Home() {
  const [searchLocation, setSearchLocation] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let intervalId;
    const fetchAndUpdate = () => {
      fetchProductsData()
        .then(data => {
          setProducts(data);
          setLoading(false);
        })
        .catch(() => {
          setError('Erreur de chargement des produits');
          setLoading(false);
        });
    };
    fetchAndUpdate();
    intervalId = setInterval(fetchAndUpdate, 5000); // Rafraîchit toutes les 5 secondes
    return () => clearInterval(intervalId);
  }, []);

  const getProductsBySection = (sectionKey) => {
    if (sectionKey === 'boissons') {
      return products.filter(product => product.category === 'boissons');
    }
    if (sectionKey === 'desserts') {
      return products.filter(product => product.category === 'desserts');
    }
    if (sectionKey === 'accompagnements') {
      return products.filter(product => product.category === 'accompagnements');
    }
    if (sectionKey === 'plats_midi') {
      const platsMidi = products.filter(product => product.subcategory === 'plats_midi');
      const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];
      const platsParJour = jours.map(jour => platsMidi.find(plat => plat.dayAvailable === jour)).filter(Boolean);
      const platsTousLesJours = platsMidi.filter(plat => plat.dayAvailable === 'tous_les_jours');
      return [...platsParJour, ...platsTousLesJours];
    }
    return products.filter(product => product.subcategory === sectionKey);
  };

  const handleLocationSearch = () => {
    alert(`Recherche de livraison pour: ${searchLocation || 'Votre localisation'}`);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      {/* Hero Section */}
      <div className="bg-green-50 flex flex-col lg:flex-row items-center justify-between rounded-2xl p-4 sm:p-8 lg:p-16 mt-4 mx-2">
        <div className="w-full lg:w-2/3 flex flex-col justify-start items-start space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="flex flex-col sm:flex-row justify-start items-start w-full">
            <div className="bg-gray-900 text-white py-1 px-2 sm:px-4 text-sm sm:text-base">Livraison</div>
            <div className="bg-gray-200 text-gray-900 py-1 px-2 sm:px-4 text-sm sm:text-base mt-1 sm:mt-0">gratuite dès 5000F Rayon 3km</div>
          </div>
          <div className="flex justify-start items-start w-full">
              <h1 className="text-black text-2xl sm:text-4xl lg:text-6xl tracking-wider font-bold leading-tight">
              Saveurs du Sénégal et d'ailleurs
            </h1>
          </div>
          <div className="flex justify-start items-start w-full">
            <p className="text-black text-sm sm:text-base lg:text-lg">
              Découvrez la cuisine authentique sénégalaise et du monde préparée avec amour
            </p>
          </div>
          <div className="flex justify-start items-start w-full">
            <div className="drop-shadow-2xl rounded-full flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 bg-white p-2 sm:py-2 sm:px-4 w-full sm:w-auto">
              <input
                className="focus:outline-none focus:ring-0 px-3 py-2 text-sm sm:text-base flex-1 min-w-0"
                placeholder="Votre adresse de livraison"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
              <button 
                onClick={handleLocationSearch}
                className="rounded-lg bg-green-800 hover:bg-green-900 text-white py-2 px-4 sm:px-8 rounded-full text-sm sm:text-base whitespace-nowrap transition-colors"
                type="button"
              >
                Chercher
              </button>
            </div>
          </div>
        </div>
  <div className="w-full lg:w-1/3 flex justify-center items-center mt-6 lg:mt-0">
          <div className="w-full max-w-xs flex flex-col items-center mb-4">
            <span className="block text-gray-700 text-base font-semibold">Mbour 1, Thiès</span>
            <a href="tel:+221788794371" className="block text-green-800 text-lg font-bold mt-1 hover:underline focus:outline-none focus:ring-2 focus:ring-green-800 rounded">
              +221 78 879 43 71
            </a>
            <img src="/images/aproposdenous.jpg" alt="À propos de nous" className="rounded-2xl shadow-lg w-full h-auto mt-2" />
          </div>
  </div>
      </div>
      {/* Menu Section */}
      <div className="space-y-8 sm:space-y-12 mt-8" id="menu">
        <div className="text-center space-y-3 sm:space-y-4 px-4">
          <p className="text-black max-w-2xl mx-auto text-sm sm:text-base">
            Découvrez notre carte complète avec des plats traditionnels sénégalais et du monde, des grillades savoureuses et des boissons authentiques.
          </p>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-black">Chargement des produits...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          productSections.map((section) => {
            const sectionProducts = getProductsBySection(section.key);
            const isDesserts = section.key === 'desserts';
            return (
              <React.Fragment key={section.key}>
                <ProductSection
                  key={section.key}
                  section={section}
                  products={sectionProducts}
                  onProductClick={() => {}}
                />
              </React.Fragment>
            );
          })
        )}
      </div>
     
      {/* About Section */}
  <div className="flex flex-col-reverse lg:grid lg:grid-cols-3 gap-6 lg:gap-8 justify-center items-center px-4 mt-16 mx-auto max-w-6xl" id="about">
        <div className="flex justify-center items-center">
          <img src="/images/aproposdenous.jpg" alt="À propos de nous" className="rounded-2xl max-w-full h-auto" />
        </div>
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left">
          <h1 className="text-black text-2xl sm:text-3xl lg:text-4xl tracking-wider font-bold">
            <span className="border-b-4 border-green-800">À Propos</span> de Nous
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Chez la Mother, nous célébrons l'authenticité de la cuisine sénégalaise. 
            Nos plats sont préparés avec amour selon les recettes traditionnelles transmises de génération en génération.
          </p>
          <div>
            <ul className="space-y-4 flex flex-col items-center lg:items-start justify-start">
              <li className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="bg-gray-200 p-4 sm:p-6 rounded-full flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg"
                       className="h-6 w-6 sm:h-8 sm:w-8 text-gray-700"
                       viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="flex flex-col items-center lg:items-start justify-start text-center lg:text-left">
                  <p className="text-gray-900 font-bold text-sm sm:text-base">Ingrédients Frais</p>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Nous sélectionnons soigneusement nos ingrédients pour vous offrir la meilleure qualité.
                  </p>
                </div>
              </li>
              <li className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="bg-gray-200 p-4 sm:p-6 rounded-full flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg"
                       className="h-6 w-6 sm:h-8 sm:w-8 text-gray-700"
                       fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="flex flex-col items-center lg:items-start justify-start text-center lg:text-left">
                  <p className="text-gray-900 font-bold text-sm sm:text-base">Livraison Rapide</p>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Commandez maintenant et recevez vos plats chauds en moins de 45 minutes.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div className="flex justify-center lg:justify-start">
            <a href="#menu"
               className="inline-flex justify-between items-center rounded-lg bg-green-800 hover:bg-green-900 text-white py-2 px-4 sm:px-8 rounded-full text-sm sm:text-base transition-colors">
              Voir le Menu
              <svg xmlns="http://www.w3.org/2000/svg"
                   className="h-3 w-3 text-white ml-2 sm:ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      {/* Chef Section */}
      {/* Carte Google Maps - Adresse du restaurant */}
  <div id="contact" className="w-full flex flex-col items-center justify-center mt-12 mb-8 px-4">
         <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-black">Nous trouver à Chez La Mother, Thiès, Sénégal</h2>
  <p className="text-gray-700 mb-4 text-center">Adresse : Chez La Mother, Mbour 1, Thiès, terrain Wallydaan</p>
        <div className="w-full max-w-2xl h-64 rounded-lg overflow-hidden shadow-lg">
          {/* Carte Leaflet avec la position exacte */}
          <div style={{ height: '100%', width: '100%' }}>
            <LeafletMapChezLaMother latitude={14.7731787} longitude={-16.9359667} />
          </div>
        </div>
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=14.7731787,-16.9359667"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors font-semibold"
        >
          Itinéraire vers le restaurant
        </a>
      </div>
    </div>
  );
}
