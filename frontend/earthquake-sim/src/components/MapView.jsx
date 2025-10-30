import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import DangerZone from './DangerZone';
import ResourceMarker from './ResourceMarker';
import BlockedRoads from './BlockedRoads';
import ResourceRoute from './ResourceRoute';

// --- ICON FIX ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- Click Handler (Disables click when simulation started) ---
function MapClickHandler({ setEpicenter, simulationStarted }) {
  useMapEvents({
    click: (e) => {
      if (simulationStarted) return; // 🚫 Ignore clicks after simulation starts
      const clickedPosition = { lat: e.latlng.lat, lng: e.latlng.lng };
      setEpicenter(clickedPosition);
    },
  });
  return null;
}

// --- MapView Component ---
export default function MapView({
  epicenter,
  setEpicenter,
  dangerZones,
  resources,
  blockedRoutes,
  routes,
  simulationStarted
}) {
  return (
    <MapContainer
      center={[28.3949, 84.1240]}
      zoom={7}
      style={{ height: '70vh', width: '100%' }}
      maxBounds={[[25.5, 79.5], [31.5, 88.5]]}
    >
      <MapClickHandler setEpicenter={setEpicenter} simulationStarted={simulationStarted} />

      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OSM Standard">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        </LayersControl.BaseLayer>
      </LayersControl>

      {epicenter && (
        <Marker position={epicenter}>
          <Popup>Epicenter</Popup>
        </Marker>
      )}

      {dangerZones.map(zone => <DangerZone key={zone.id} zone={zone} />)}
      {blockedRoutes && <BlockedRoads blockedRoutes={blockedRoutes} />}
      {resources.map(res => <ResourceMarker key={res.id} position={res.position} info={res.info} />)}
      {routes && <ResourceRoute routes={routes} />}
    </MapContainer>
  );
}
