import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';

export default function LeafletMapChezLaMother({ latitude, longitude }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const position = [latitude, longitude];
  // Crée l'icône Leaflet uniquement côté client
  const markerIcon = mounted ? L.icon({
    iconUrl: '/images/aproposdenous.jpg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: 'custom-marker-icon',
  }) : undefined;
  if (!mounted) return null;
  return (
    <MapContainer center={position} zoom={17} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
      />
      <Marker position={position} icon={markerIcon}>
        <Popup minWidth={120} maxWidth={160}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 0' }}>
            <img src="/images/aproposdenous.jpg" alt="À propos de nous" style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '6px', marginBottom: '4px', boxShadow: '0 1px 4px #0001' }} />
            <span style={{ fontWeight: 'bold', color: '#222', fontSize: '11px', marginBottom: '2px', textAlign: 'center' }}>Chez la Mother</span>
            <span style={{ fontSize: '9px', color: '#555', textAlign: 'center', lineHeight: '1.2' }}>Mbour 1, Thies<br/>terrain Wallydaan</span>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
