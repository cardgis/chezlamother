import React, { useState, useRef } from "react";
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";

// Coordonnées du restaurant (exemple)
const RESTAURANT_LOCATION = {
  lat: 14.6928,
  lng: -17.4467,
};

const containerStyle = {
  width: "100%",
  height: "400px",
};

export default function AddressDistanceMap() {
  const [address, setAddress] = useState("");
  const [clientLocation, setClientLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  // Charger l'API Google Maps
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // Géocoder l'adresse et calculer la distance
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDistance(null);
    setClientLocation(null);
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          const clientLoc = {
            lat: location.lat(),
            lng: location.lng(),
          };
          setClientLocation(clientLoc);
          // Calculer la distance
          const service = new window.google.maps.DistanceMatrixService();
          service.getDistanceMatrix({
            origins: [RESTAURANT_LOCATION],
            destinations: [clientLoc],
            travelMode: window.google.maps.TravelMode.DRIVING,
          }, (response, status) => {
            if (status === "OK" && response.rows[0].elements[0].status === "OK") {
              setDistance(response.rows[0].elements[0].distance.text);
            } else {
              setDistance("Distance non disponible");
            }
            setLoading(false);
          });
        } else {
          setLoading(false);
          setDistance("Adresse non trouvée");
        }
      });
    } catch (err) {
      setLoading(false);
      setDistance("Erreur lors de la recherche");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          ref={inputRef}
          type="text"
          className="border p-2 rounded w-full text-black"
          placeholder="Votre adresse de livraison"
          value={address}
          onChange={e => setAddress(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? "Recherche..." : "Chercher"}
        </button>
      </form>
      {distance && (
        <div className="mb-2 text-center text-lg font-bold text-green-700">
          Distance restaurant ↔ client : {distance}
        </div>
      )}
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={clientLocation || RESTAURANT_LOCATION}
          zoom={clientLocation ? 13 : 15}
        >
          {/* Marker restaurant */}
          <Marker position={RESTAURANT_LOCATION} label="R" />
          {/* Marker client */}
          {clientLocation && <Marker position={clientLocation} label="C" />}
          {/* Tracé */}
          {clientLocation && (
            <Polyline
              path={[RESTAURANT_LOCATION, clientLocation]}
              options={{ strokeColor: "#34d399", strokeWeight: 4 }}
            />
          )}
        </GoogleMap>
      )}
    </div>
  );
}
