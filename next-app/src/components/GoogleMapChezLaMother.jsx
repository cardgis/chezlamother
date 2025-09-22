import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const latitude = 14.7731787;
const longitude = -16.9359667;

const LeafletMap = dynamic(() => import('./LeafletMapChezLaMother'), { ssr: false });

export default function GoogleMapChezLaMother() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-4 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold text-black mb-4">Itinéraires chez la mother Mbour 1, Thies, terrain Wallydaan</h2>
      <div className="w-full h-80 rounded-xl overflow-hidden">
        <LeafletMap latitude={latitude} longitude={longitude} />
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=14.7731787,-16.9359667`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors font-semibold"
        >
          Itinéraire vers le restaurant
        </a>
        <button
          onClick={() => setShowModal(true)}
          className="inline-block bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors font-semibold"
        >
          Agrandir le plan
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-xl shadow-xl flex flex-col">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold z-10"
            >
              Fermer
            </button>
            <div className="flex-1 rounded-xl overflow-hidden">
              <LeafletMap latitude={latitude} longitude={longitude} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
