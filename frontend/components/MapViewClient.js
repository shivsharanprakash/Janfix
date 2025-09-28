"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icons path in Next
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function getIconForCategory(category) {
  const base = L.divIcon;
  const map = {
    pothole: '🕳️',
    garbage: '🗑️',
    streetlight: '💡',
    sewage: '🕳️',
    water: '💧'
  };
  const emoji = map[category] || '📍';
  return L.divIcon({ className: 'emoji-marker', html: `<div style="font-size:20px">${emoji}</div>` });
}

export default function MapViewClient({ center = [12.9716, 77.5946], markers = [], heatmap = [] }) {
  return (
    <MapContainer center={center} zoom={13} style={{ height: 320, width: '100%' }} scrollWheelZoom={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
      {markers.map((m, idx) => (
        <Marker key={idx} position={[m.lat, m.lng]} icon={getIconForCategory(m.category)}>
          {m.popup && <Popup>{m.popup}</Popup>}
        </Marker>
      ))}
      {/* Simple heatmap: draw translucent circles. For real heatmaps use leaflet.heat plugin */}
      {heatmap.map((h, idx) => (
        <Circle key={`h-${idx}`} center={[h.lat, h.lng]} radius={h.radius || 50} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.15, weight: 0 }} />
      ))}
    </MapContainer>
  );
}



