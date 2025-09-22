import React, { useEffect, useState } from 'react';

export default function ProductAvailabilityAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Erreur de chargement des produits');
        setLoading(false);
      });
  }, []);

  const handleToggleAvailability = (id) => {
    const updatedProducts = products.map(p =>
      p.id === id ? { ...p, available: !p.available } : p
    );
    setProducts(updatedProducts);
    fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProducts)
    });
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6 text-green-800 text-center">Gestion de la disponibilité des produits</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <div
            key={product.id}
            className={`bg-white rounded-xl shadow-lg p-4 flex flex-col items-center transition-all duration-300 border-2 ${product.available ? 'border-green-400' : 'border-red-300 opacity-60 grayscale'}`}
          >
            <div className="w-20 h-20 mb-2 flex items-center justify-center overflow-hidden rounded-lg bg-gray-100">
              {product.image ? (
                <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
              ) : (
                <span className="text-gray-400 text-xs">Aucune image</span>
              )}
            </div>
            <div className="font-semibold text-base mb-1 text-center line-clamp-2">{product.name}</div>
            <div className="text-green-700 font-bold text-sm mb-2">{product.price?.toLocaleString('fr-FR')} F</div>
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={product.available}
                onChange={() => handleToggleAvailability(product.id)}
                className="w-5 h-5 accent-green-700 transition-all duration-200"
              />
              <span className={`text-sm font-medium ${product.available ? 'text-green-700' : 'text-red-500'}`}>{product.available ? 'Disponible' : 'Indisponible'}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
