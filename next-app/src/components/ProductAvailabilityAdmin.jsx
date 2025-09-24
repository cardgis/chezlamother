import React, { useEffect, useState } from 'react';

export default function ProductAvailabilityAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingProducts, setUpdatingProducts] = useState(new Set());

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

  const handleToggleAvailability = async (id) => {
    const productToUpdate = products.find(p => p.id === id);
    const newAvailability = !productToUpdate.available;
    
    // Marquer comme en cours de mise à jour
    setUpdatingProducts(prev => new Set([...prev, id]));
    
    // Mise à jour optimiste de l'UI
    const updatedProducts = products.map(p =>
      p.id === id ? { ...p, available: newAvailability } : p
    );
    setProducts(updatedProducts);
    
    try {
      // Utiliser la nouvelle API spécialisée
      const response = await fetch('/api/products/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, available: newAvailability })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erreur de mise à jour');
      }
      
      console.log(`✅ ${result.product.name} ${result.product.available ? 'activé' : 'désactivé'}`);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      // Revenir à l'état précédent en cas d'erreur
      const revertedProducts = products.map(p =>
        p.id === id ? { ...p, available: productToUpdate.available } : p
      );
      setProducts(revertedProducts);
      alert(`Erreur: ${error.message}`);
    } finally {
      // Retirer de la liste des mises à jour
      setUpdatingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
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
            className={`bg-white rounded-xl shadow-lg p-4 flex flex-col items-center transition-all duration-300 border-2 ${product.available ? 'border-green-400' : 'border-red-300'}`}
          >
            <div className={`w-20 h-20 mb-2 flex items-center justify-center overflow-hidden rounded-lg bg-gray-100 ${!product.available ? 'opacity-60 grayscale' : ''}`}>
              {product.image ? (
                <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
              ) : (
                <span className="text-gray-400 text-xs">Aucune image</span>
              )}
            </div>
            <div className="font-semibold text-base mb-1 text-center line-clamp-2 text-gray-900">{product.name}</div>
            <div className="text-green-700 font-bold text-sm mb-2">{product.price?.toLocaleString('fr-FR')} F</div>
            <label className={`flex items-center gap-2 mt-2 ${updatingProducts.has(product.id) ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={product.available}
                onChange={() => handleToggleAvailability(product.id)}
                disabled={updatingProducts.has(product.id)}
                className="w-5 h-5 accent-green-700 transition-all duration-200 disabled:cursor-wait"
              />
              <span className={`text-sm font-medium ${product.available ? 'text-green-700' : 'text-red-500'}`}>
                {updatingProducts.has(product.id) ? '🔄 Mise à jour...' : (product.available ? 'Disponible' : 'Indisponible')}
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
