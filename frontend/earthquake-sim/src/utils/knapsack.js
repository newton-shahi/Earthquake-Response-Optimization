export function zeroOneKnapsack(resources, zones) {
    const assignments = [];
    if (resources.length === 0 || zones.length === 0) return assignments;

    const res = resources[0];
    let remainingCapacity = res.capacity;
    const priorityWeight = { red: 3, yellow: 2, green: 1 };

    // Create a working copy of zones to track remaining need and total assigned
    let workingZones = zones.map(z => ({ ...z, remainingNeed: z.need, assigned: 0 }));

    // --- Pass 1: Coverage Guarantee (Minimum 1 unit for Red/Yellow zones) ---
    // This ensures all critical zones get at least initial support
    const highPriorityZones = workingZones.filter(z => z.priority === 'red' || z.priority === 'yellow');

    highPriorityZones.forEach(zone => {
        if (remainingCapacity > 0 && zone.remainingNeed > 0) {
            const minAssignment = 1;
            // Assign 1, or less if capacity/need is less than 1
            const assignCount = Math.min(minAssignment, remainingCapacity, zone.remainingNeed);

            zone.assigned += assignCount;
            zone.remainingNeed -= assignCount;
            remainingCapacity -= assignCount;
        }
    });

    // --- Pass 2: Greedy Allocation (Fill remaining needs by priority and size) ---

    // Sort by priority descending, then remaining need descending
    let sortedZones = workingZones.slice().sort((a, b) => {
        // Primary sort: Priority (Red > Yellow > Green)
        if (priorityWeight[b.priority] !== priorityWeight[a.priority]) {
            return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        // Secondary sort: Remaining Need (Higher need first)
        return b.remainingNeed - a.remainingNeed;
    });

    sortedZones.forEach(zone => {
        if (zone.remainingNeed <= 0 || remainingCapacity <= 0) return;

        // Assign up to the zone's remaining need or remaining capacity
        const assignCount = Math.min(zone.remainingNeed, remainingCapacity);

        zone.assigned += assignCount;
        zone.remainingNeed -= assignCount;
        remainingCapacity -= assignCount;
    });

    // Format the result for output, only including zones that received resources
    workingZones.forEach(zone => {
        if (zone.assigned > 0) {
            assignments.push({ resourceId: res.id, zoneId: zone.id, assigned: zone.assigned });
        }
    });

    return assignments;
}

// Fractional Knapsack for supplies - Keeping the original function
export function fractionalKnapsack(resources, zones) {
    const assignments = [];
    zones.forEach(zone => {
        resources.forEach(res => {
            if(res.capacity > 0 && zone.need > 0) {
                const assigned = Math.min(res.capacity, zone.need);
                assignments.push({ resourceId: res.id, zoneId: zone.id, assigned });
                res.capacity -= assigned;
                zone.need -= assigned;
            }
        });
    });
    return assignments;
}
