// graphhopper.js
const GRAPH_HOPPER_BASE = "http://localhost:8989";

/**
 * Find the nearest road point to a given coordinate
 * @param {Object} point - {lat, lng}
 * @returns {Object|null} - nearest routable point or null
 */
async function findNearestCarRoad(point) {
  const DEG_PER_KM = 0.009;
  let radiusKm = 0.9; // start 100 m
  const maxRadiusKm = 50;

  while (radiusKm <= maxRadiusKm) {
    const offsets = [
      { lat: 0, lng: 0 },
      { lat: radiusKm * DEG_PER_KM, lng: 0 },
      { lat: -radiusKm * DEG_PER_KM, lng: 0 },
      { lat: 0, lng: radiusKm * DEG_PER_KM },
      { lat: 0, lng: -radiusKm * DEG_PER_KM },
    ];

    for (const off of offsets) {
      const testPoint = { lat: point.lat + off.lat, lng: point.lng + off.lng };
      try {
        const url = `${GRAPH_HOPPER_BASE}/nearest?point=${testPoint.lat},${testPoint.lng}&profile=car`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data?.points?.length > 0) {
            const nearest = data.points[0];
            console.log(`Nearest car road found at (${nearest.coordinates[1]},${nearest.coordinates[0]})`);
            return { lat: nearest.coordinates[1], lng: nearest.coordinates[0] };
          }
        }
      } catch (err) {
        console.error("Nearest car road search error:", err);
      }
    }

    radiusKm *= 2; // expand search
  }

  console.warn(`No car-accessible road found near (${point.lat},${point.lng})`);
  return null;
}

export async function getRoute(start, end) {
  try {
    const url = `${GRAPH_HOPPER_BASE}/route?point=${start.lat},${start.lng}&point=${end.lat},${end.lng}&profile=car&points_encoded=false`;
    const res = await fetch(url);
    const data = await res.json();

    if (res.ok && data.paths && data.paths.length > 0) {
      console.log(`Direct route found from (${start.lat},${start.lng}) to (${end.lat},${end.lng})`);
      return data.paths;
    }

    console.warn("Direct route failed, trying nearest road fallback...");

    const nearestStart = await findNearestCarRoad(start);
    const nearestEnd = await findNearestCarRoad(end);

    if (nearestStart && nearestEnd) {
      console.log(`Retrying route using nearest roads: start (${nearestStart.lat},${nearestStart.lng}), end (${nearestEnd.lat},${nearestEnd.lng})`);
      const retryUrl = `${GRAPH_HOPPER_BASE}/route?point=${nearestStart.lat},${nearestStart.lng}&point=${nearestEnd.lat},${nearestEnd.lng}&profile=car&points_encoded=false`;
      const retryRes = await fetch(retryUrl);
      const retryData = await retryRes.json();
      if (retryRes.ok && retryData.paths && retryData.paths.length > 0) {
        console.log(`Route successfully found using nearest roads.`);
        return retryData.paths;
      }
    }

    console.warn(`No route found from ${start.lat},${start.lng} to ${end.lat},${end.lng} even after nearest road fallback`);
    return null;

  } catch (err) {
    console.error("GraphHopper routing error:", err);
    return null;
  }
}
