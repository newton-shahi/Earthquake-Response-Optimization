export default function AnalyticsPanel({ analytics }) {
  return (
    <div className="absolute top-20 right-4 p-4 bg-white bg-opacity-70 rounded-xl shadow-lg z-50 max-w-xs">
      <h3 className="font-bold mb-2">Simulation Analytics</h3>
      <p>Total Distance: {analytics.distance || 0} km</p>
      <p>Total Time: {analytics.time || 0} mins</p>
      <p>Supplies Delivered: {analytics.supplies || 0}</p>
      <p>Casualties Prevented: {analytics.casualties || 0}</p>
    </div>
  );
}
