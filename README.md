# Earthquake-Response-Optimization
This is project ERO.


Setup Springboot Maven first. (before practicing your tasks)


# Disaster Resource Distribution Simulation

This project simulates disaster response in Nepal, focusing on the efficient distribution of resources (e.g., doctors) to affected zones after an earthquake. The system uses geographic and population data, resource allocation algorithms, and realistic road networks to optimize disaster response.

---

## Features / To-Do

### UI & Animations
- Add animations for zone appearance (e.g., zones popping up rather than appearing instantly) to improve visualization.
- Improve overall UI for a more polished look.
- Add a landing page introducing the project objective, team members, and dramatic earthquake images (with sources cited).
- Introduce basic terms visually:
  - Red, yellow, green zones
  - Red blockades: destroyed paths that cannot be used.

### Map & Zone Handling
- Ensure the path is calculated from a resource point to the **nearest road inside the zone** if the center of the zone does not have a road.
- Properly handle cases where a path cannot be found (skip safely without errors).
- Increase the number of blocked roads, particularly in red and yellow zones.
- Make zones clickable, displaying zone ID and relevant information.
- Randomize routes for clarity if multiple routes overlap.

### Resource Allocation
- Implement correct doctor distribution using a knapsack algorithm:
  - Red zones should receive the highest number of doctors.
  - Include logs showing which zone IDs are clustered with which resource points.
  - Show algorithm reasoning and comparison (e.g., greedy knapsack vs alternatives) in the log.
- Track doctors sent:
  - Ensure the count of dispatched doctors matches expectations.
  - Optionally save ~5% of doctors in the resource point instead of sending all.
- Include accurate data for resource points (7 per province, sources cited).

### Simulation Analysis
- Display estimated time and efficiency of distribution.
- Provide a separate tab showing route analysis, distance, and algorithm efficiency.
- Include a "Submit Data" button:
  - Submit simulation results to a PostgreSQL database.
  - Store results for different algorithms and simulations for performance analysis.

---

## For More Accurate Simulation

### Required Datasets
1. **Population / Urbanization Maps**
   - High-density urban areas (e.g., Kathmandu Valley) → higher chance for red zones.
   - Low-density areas (Terai plains, mountains) → lower chance.
   - Sources:
     - Population: [SEDAC GPW v4](https://sedac.ciesin.columbia.edu/data/collection/gpw-v4)
     - Urbanization: OpenStreetMap urban area polygons

2. **Geographic Susceptibility (Earthquake Vulnerability)**
   - Hills and valleys → more prone to damage (soil amplification)
   - Terai → less amplification, though liquefaction may occur
   - Source: GIS shapefiles from Nepal Department of Mines and Geology

---

### Data Representation
- Create a grid of Nepal; each cell has a weight:  
  `weight = population_density * geographic_risk_factor`
- Sample a grid cell proportional to weight.
- Slightly randomize latitude/longitude within the cell.

```javascript
const weightedAreas = [
  {lat:27.7172, lng:85.3240, weight:10}, // Kathmandu
  {lat:27.6762, lng:85.3000, weight:8},  // Hetauda
  {lat:26.8421, lng:87.0156, weight:3},  // Terai
  ...
];

function pickWeightedRandomArea() {
  const totalWeight = weightedAreas.reduce((sum, a) => sum + a.weight, 0);
  let r = Math.random() * totalWeight;
  for (let area of weightedAreas) {
    if (r < area.weight) return area;
    r -= area.weight;
  }
}
