import React from 'react';
import ProductCard from './ProductCard';

const ProductSection = ({ section, products, onProductClick }) => {
  if (!products.length) return null;

  // Toutes les sections produits sauf la map sont centrées avec marges
  const getGridClasses = () => {
    // Toutes les sections produits affichent 1 à 4 colonnes selon la taille d'écran
    return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mx-auto max-w-6xl justify-items-center";
  };

  return (
    <div className="mb-12 sm:mb-16 px-4">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
          <span className="inline-flex items-center gap-2 sm:gap-3 text-lg sm:text-xl lg:text-2xl">
            {section.icon ? <section.icon size={32} color="#ff9800" /> : null}
            <span className="border-b-4 border-yellow-400 text-blue-900 align-middle">{section.title}</span>
          </span>
        </h2>
        <p className="text-gray-600 mt-2 text-sm sm:text-base max-w-2xl mx-auto">{section.subtitle}</p>
      </div>
  <div className={getGridClasses()} style={{ display: 'grid' }}>
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
