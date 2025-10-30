import { Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';

export default function ResourceRoute({ routes }) {
  return (
    <>
      {routes.map((r, idx) => (
        <Polyline
          key={idx}
          positions={r.route}
          pathOptions={{ color: 'blue', weight: 4, dashArray: '5,5' }}
        >
          <Popup>
            <div>
              <strong>From Resource ID:</strong> {r.from} <br/>
              <strong>To Zone ID:</strong> {r.to} <br/>
              <strong>Doctors Sent:</strong> {r.doctorsSent}
            </div>
          </Popup>
        </Polyline>
      ))}
    </>
  );
}
