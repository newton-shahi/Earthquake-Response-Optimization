import { Polyline } from 'react-leaflet';

export default function BlockedRoads({ blockedRoutes }) {
  return blockedRoutes.map((route, idx) => (
    <Polyline
      key={idx}
      positions={route}
      pathOptions={{ color: 'red', dashArray: '8', weight: 5 }}
    />
  ));
}
