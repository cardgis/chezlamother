'use client';
import { useState, useEffect } from 'react';

export default function DebugNeonPage() {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDebugData() {
      try {
        const response = await fetch('/api/debug/neon');
        const data = await response.json();
        
        if (response.ok) {
          setDebugData(data);
        } else {
          setError(data);
        }
      } catch (err) {
        setError({ error: err.message });
      } finally {
        setLoading(false);
      }
    }

    fetchDebugData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">🔍 Debug Neon Database</h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-red-600">❌ Erreur Base de Données</h1>
          <div className="bg-red-50 p-6 rounded-lg shadow border border-red-200">
            <h2 className="text-xl font-semibold mb-4 text-red-800">Détails de l'erreur:</h2>
            <pre className="bg-red-100 p-4 rounded text-sm overflow-auto text-red-700">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">🔍 Debug Neon Database</h1>
        
        {/* Informations générales */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 text-green-600">✅ Connexion réussie</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Timestamp:</strong> {new Date(debugData.timestamp).toLocaleString()}
            </div>
            <div>
              <strong>Environnement:</strong> {debugData.environment.VERCEL_ENV || debugData.environment.NODE_ENV}
            </div>
          </div>
        </div>

        {/* Produits */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">📦 Produits ({debugData.products_count})</h2>
          
          {debugData.products_count === 0 ? (
            <div className="text-red-600 font-semibold">⚠️ Aucun produit trouvé !</div>
          ) : (
            <>
              <div className="mb-4">
                <strong className="text-green-600">Total: {debugData.products_count} produits</strong>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Catégories:</h3>
                  <ul className="space-y-1">
                    {debugData.categories.map(cat => (
                      <li key={cat.category} className="flex justify-between">
                        <span>{cat.category}</span>
                        <span className="font-semibold">{cat.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Échantillon de produits:</h3>
                  <ul className="space-y-1 text-sm">
                    {debugData.sample_products.map(product => (
                      <li key={product.id} className="border-b pb-1">
                        <strong>{product.name}</strong><br />
                        <span className="text-gray-600">{product.category} - {product.price} FCFA</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Tables */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 text-purple-600">🗄️ Tables ({debugData.tables.length})</h2>
          <div className="flex flex-wrap gap-2">
            {debugData.tables.map(table => (
              <span key={table} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                {table}
              </span>
            ))}
          </div>
        </div>

        {/* Environnement */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-600">⚙️ Environnement</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugData.environment, null, 2)}
          </pre>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}