import React from 'react';
import ProductCard from './ProductCard';

const ProductSection = ({ section, products, onProductClick }) => {
  if (!products.length) return null;

  // Toutes les sections produits sauf la map sont centrées avec marges
  const getGridClasses = () => {
    if (["plats_midi", "a_la_carte", "accompagnements"].includes(section.key)) {
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto max-w-6xl justify-items-center";
    }
    if (["pizzas", "boissons", "desserts"].includes(section.key)) {
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mx-auto max-w-6xl justify-items-center";
    }
    // Si une autre section produit est ajoutée avant la map, appliquer le même style
    if (["suivante", "avant_map"].includes(section.key)) {
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mx-auto max-w-6xl justify-items-center";
    }
    if (section.columnsPerRow === 5) {
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6";
    }
    // Centrer les sections avec peu de produits (moins de 3)
    const shouldCenter = products.length < 3;
    return shouldCenter 
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6";
  };

  return (
    <div className="mb-12 sm:mb-16 px-4">
      <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
            <span className="inline-flex items-center gap-2 sm:gap-3 text-lg sm:text-xl lg:text-2xl">
              {section.icon ? <section.icon size={32} color="#ff9800" /> : null}
              {/* Titre bleu de nuit et souligné jaune pour les sections demandées */}
              {['Grillades à la Carte', 'Accompagnements', 'Pizzas Artisanales', 'Boissons Traditionnelles', 'Plats du Midi', 'Desserts Gourmands'].includes(section.title) ? (
                <span className="border-b-4 border-yellow-400 text-blue-900 align-middle">{section.title}</span>
              ) : (
                <span className="border-b-4 border-orange-400 text-black align-middle">{section.title}</span>
              )}
            </span>
          </h2>
        <p className="text-gray-600 mt-2 text-sm sm:text-base max-w-2xl mx-auto">{section.subtitle}</p>
      </div>
      
      <div className={getGridClasses()}>
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            sectionKey={section.key}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductSection;
