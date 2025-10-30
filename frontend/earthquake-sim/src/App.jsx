import { useState, useCallback, useMemo } from 'react';
import MapView from './components/MapView';
import ControlPanel from './components/ControlPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import { zeroOneKnapsack } from './utils/knapsack';
import { getRoute } from './utils/graphhopper';

// --- Fixed Resource Locations ---
const FIXED_RESOURCES = [
  { id: 1, position: { lat: 27.7172, lng: 85.3240 }, capacity: 100, info: { name: 'Kathmandu Resource', doctors: 100 } },
  { id: 2, position: { lat: 28.0560, lng: 81.6506 }, capacity: 100, info: { name: 'Nepalgunj Resource', doctors: 100 } },
  { id: 3, position: { lat: 27.4265, lng: 85.0305 }, capacity: 100, info: { name: 'Hetauda Resource', doctors: 80 } }
  // { id: 4, position: { lat: 28.875101474350434, lng: 82.79184852292637 }, capacity: 100, info: { name: 'Dolpa Resource', doctors: 80 } }

];

// --- Nepal Polygon Boundary ---
const NEPAL_POLYGON = [
  [28.826279, 80.346506], [26.43245, 88.021182],
  [27.508455, 87.614218], [29.721705, 81.530304],
  [28.826279, 80.346506]
];

const NUM_ZONES = 40;
const ZONE_RADIUS_KM = 20;
const DEGREE_PER_KM = 0.009;

function App() {
  const [epicenter, setEpicenter] = useState(null);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [distributionStarted, setDistributionStarted] = useState(false);

  const [dangerZones, setDangerZones] = useState([]);
  const [resources, setResources] = useState(FIXED_RESOURCES);
  const [blockedRoutes, setBlockedRoutes] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [routes, setRoutes] = useState([]);

  // --- Helper Functions ---
  const distance = (p1, p2) => Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2));

  const isPointInPolygon = useCallback((point, polygon) => {
    const [x, y] = [point.lng, point.lat];
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][1], yi = polygon[i][0];
      const xj = polygon[j][1], yj = polygon[j][0];
      const intersect = ((yi > y) !== (yj > y)) &&
        (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }, []);

  const isOverlapping = (newZone, existingZones) => {
    const minDistanceDegrees = (ZONE_RADIUS_KM * 2) * DEGREE_PER_KM;
    for (const zone of existingZones) {
      const dist = distance({ lat: newZone.lat, lng: newZone.lng }, { lat: zone.lat, lng: zone.lng });
      if (dist < minDistanceDegrees) return true;
    }
    return false;
  };

  const determinePriority = useCallback((zoneLat, zoneLng) => {
    const epic = epicenter || { lat: 27.7172, lng: 85.3240 };
    const distToEpicenter = distance({ lat: zoneLat, lng: zoneLng }, epic);
    const normalizedDistance = distToEpicenter / 4;
    const proximity = 1 - Math.min(1, normalizedDistance * 2);
    const rand = Math.random();
    if (rand < 0.1 + (0.7 * proximity)) return 'red';
    else if (rand < 0.4 + (0.4 * proximity)) return 'yellow';
    else return 'green';
  }, [epicenter]);

  const getRandomPointInNepal = useCallback(() => {
    const latMin = 26.347, latMax = 30.447;
    const lngMin = 80.058, lngMax = 88.201;
    let lat, lng, attempts = 0;
    do {
      lat = latMin + Math.random() * (latMax - latMin);
      lng = lngMin + Math.random() * (lngMax - lngMin);
      attempts++;
      if (attempts > 100) break;
    } while (!isPointInPolygon({ lat, lng }, NEPAL_POLYGON));
    return { lat, lng };
  }, [isPointInPolygon]);

  const generateBlockedRoutes = useMemo(() => (zones) => {
    const blockades = [];
    zones.forEach(zone => {
      let numBlockades = zone.priority === 'red' ? 5 + Math.floor(Math.random() * 5)
        : zone.priority === 'yellow' ? 2 + Math.floor(Math.random() * 3)
          : 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numBlockades; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * ZONE_RADIUS_KM * 2 * DEGREE_PER_KM;
        let startLat = zone.lat + radius * Math.sin(angle);
        let startLng = zone.lng + radius * Math.cos(angle);
        if (!isPointInPolygon({ lat: startLat, lng: startLng }, NEPAL_POLYGON)) continue;
        let route = [[startLat, startLng]];
        const segments = Math.floor(Math.random() * 3) + 2;
        for (let j = 0; j < segments; j++) {
          const segAngle = Math.random() * 2 * Math.PI;
          const segLength = (Math.random() * 0.02) * (zone.priority === 'red' ? 2 : 1);
          let newLat = route[route.length - 1][0] + Math.sin(segAngle) * segLength;
          let newLng = route[route.length - 1][1] + Math.cos(segAngle) * segLength;
          if (isPointInPolygon({ lat: newLat, lng: newLng }, NEPAL_POLYGON)) route.push([newLat, newLng]);
          else break;
        }
        if (route.length >= 2) blockades.push(route);
      }
    });
    return blockades;
  }, [isPointInPolygon]);

  // --- Start Simulation ---
  const handleStart = () => {
    if (!epicenter) return;

    const zones = [];
    let attempts = 0;
    const maxAttempts = NUM_ZONES * 10;
    while (zones.length < NUM_ZONES && attempts < maxAttempts) {
      const { lat, lng } = getRandomPointInNepal();
      const newZone = {
        id: zones.length + 1,
        lat, lng,
        priority: determinePriority(lat, lng),
        need: Math.floor(Math.random() * 10 + 3)
      };
      if (!isOverlapping(newZone, zones)) zones.push(newZone);
      attempts++;
    }

    setDangerZones(zones);
    setBlockedRoutes(generateBlockedRoutes(zones));
    setSimulationStarted(true);
    setAnalytics({ distance: 120, time: 45, supplies: 50, casualties: 10 });
    setEpicenter(null);
  };

  // --- Reset Simulation (always available) ---
  const handleReset = () => {
    window.location.reload();
  };

  // --- Distribution Phase ---
const handleDistribution = async () => {
  if (!dangerZones.length) return;
  setDistributionStarted(true);

  const initialResources = FIXED_RESOURCES.map(r => ({
    ...r,
    capacity: r.capacity,
    info: { ...r.info }
  }));

  const resourceClusters = initialResources.map(r => ({
    ...r,
    assignedZones: [],
    assignments: []
  }));

  // Assign zones to nearest resource
  dangerZones.forEach(zone => {
    let nearest = null;
    let minDist = Infinity;
    initialResources.forEach(r => {
      const d = distance(r.position, { lat: zone.lat, lng: zone.lng });
      if (d < minDist) {
        minDist = d;
        nearest = r.id;
      }
    });
    const cluster = resourceClusters.find(rc => rc.id === nearest);
    if (cluster) cluster.assignedZones.push(zone);
  });

  const allRoutes = [];
  const finalResources = [];

  for (const cluster of resourceClusters) {
    if (!cluster.assignedZones.length) {
      finalResources.push(cluster);
      continue;
    }

    // Zero-One Knapsack for the cluster
    const knapsackAssignment = zeroOneKnapsack(
      [{ ...cluster, capacity: cluster.info.doctors }],
      cluster.assignedZones
    );

    for (const assign of knapsackAssignment) {
      const zone = cluster.assignedZones.find(z => z.id === assign.zoneId);
      if (!zone) continue;

      try {
        // --- New addition: check if route exists ---
        const start = { lat: cluster.position.lat, lng: cluster.position.lng };
        const end = { lat: zone.lat, lng: zone.lng };

        console.log(`Calculating route from Resource ${cluster.id} to Zone ${zone.id}...`);
        const path = await getRoute(start, end);

        if (!path) {
          // Skip if no route available
          console.warn(`Skipping distribution: No route from Resource ${cluster.id} to Zone ${zone.id}`);
          // alert(`Cannot route to Zone ${zone.id} - no accessible road network found. Skipping this zone.`);
          continue; // skip to next assignment
        }

        // Process route normally
        const routeCoords = path[0].points.coordinates.map(c => [c[1], c[0]]);
        allRoutes.push({
          from: cluster.id,
          to: zone.id,
          route: routeCoords,
          doctorsSent: assign.assigned
        });

      } catch (err) {
        console.error(`GraphHopper route error (Resource ${cluster.id} -> Zone ${zone.id}):`, err);
        continue; // skip this assignment
      }
    }

    // Update remaining doctors
    const totalAssigned = knapsackAssignment.reduce((sum, a) => sum + a.assigned, 0);
    cluster.info.doctors = Math.max(cluster.info.doctors - totalAssigned, 0);
    cluster.assignments = knapsackAssignment;
    finalResources.push(cluster);
  }

  setRoutes(allRoutes);
  setResources(finalResources);
  setDistributionStarted(false);
};

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 bg-white shadow-md text-center font-bold text-xl">
        Nepal Earthquake Disaster Simulator
      </header>

      <main className="flex-1 relative">
        <MapView
          epicenter={epicenter}
          setEpicenter={setEpicenter}
          dangerZones={simulationStarted ? dangerZones : []}
          resources={simulationStarted ? resources : []}
          blockedRoutes={simulationStarted ? blockedRoutes : []}
          routes={routes}
          simulationStarted={simulationStarted}
        />

        <ControlPanel
          epicenter={epicenter}
          onStart={handleStart}
          onReset={handleReset}
          simulationStarted={simulationStarted}
          onDistributionStart={handleDistribution}
          distributionStarted={distributionStarted}
        />

        <AnalyticsPanel analytics={analytics} />
      </main>

      <footer className="p-2 text-center bg-white shadow-inner">
        Simulation System | Pokhara University Project
      </footer>
    </div>
  );
}

export default App;
