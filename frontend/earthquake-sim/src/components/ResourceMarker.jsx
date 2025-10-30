import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const ambulanceIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2965/2965567.png',
  iconSize: [30, 30]
});

export default function ResourceMarker({ position, info }) {
  return (
    <Marker position={position} icon={ambulanceIcon}>
      <Popup>
        <strong>{info.name}</strong><br/>
        Doctors onboard: {info.doctors}
      </Popup>
    </Marker>
  );
}
