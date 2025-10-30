import { Circle } from 'react-leaflet';

export default function DangerZone({ zone }) {
  const priorityColor = (priority) => {
    switch(priority){
      case 'red': return 'rgba(255,0,0,0.4)';
      case 'yellow': return 'rgba(255,255,0,0.4)';
      case 'green': return 'rgba(0,255,0,0.4)';
      default: return 'rgba(0,0,0,0.4)';
    }
  };

  return (
    <Circle
      center={[zone.lat, zone.lng]}
      radius={20000}
      pathOptions={{ color: priorityColor(zone.priority), fillOpacity: 0.4 }}
    />
  );
}
