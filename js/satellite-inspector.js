// Satellite data inspector
class SatelliteInspector {
    static inspect() {
        console.log("=== SATELLITE INSPECTOR ===");
        
        if (!window.satelliteManager) {
            console.log("Satellite manager not available");
            return;
        }
        
        console.log("Total satellites in manager:", window.satelliteManager.satellites.size);
        console.log("Satellite categories distribution:");
        
        const categories = {};
        window.satelliteManager.satellites.forEach((sat, id) => {
            const category = sat.data?.category || 'unknown';
            categories[category] = (categories[category] || 0) + 1;
        });
        
        console.log("Categories:", categories);
        
        // Check positions
        console.log("Satellite positions:");
        let visibleCount = 0;
        window.satelliteManager.satellites.forEach((sat, id) => {
            if (sat.object && sat.object.position) {
                const pos = sat.object.position;
                const distance = Math.sqrt(pos.x*pos.x + pos.y*pos.y + pos.z*pos.z);
                if (distance > 1.2) { // Only show satellites not too close to center
                    if (visibleCount < 10) {
                        console.log(`Satellite ${sat.data?.OBJECT_NAME || id}: 
                                    Position (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}) 
                                    Distance: ${distance.toFixed(2)}`);
                    }
                    visibleCount++;
                }
            }
        });
        console.log("Visible satellites (distance > 1.2):", visibleCount);
        
        console.log("=== INSPECTION COMPLETE ===");
    }
}

// Run inspection
setTimeout(() => {
    if (window.satelliteManager) {
        SatelliteInspector.inspect();
    }
}, 5000);

// Make available globally
window.inspectSatellites = SatelliteInspector.inspect;
