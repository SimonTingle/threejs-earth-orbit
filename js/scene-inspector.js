// Scene object counter
function countSceneObjects() {
    if (window.satelliteSim && window.satelliteSim.scene) {
        const children = window.satelliteSim.scene.children;
        console.log('=== SCENE INSPECTOR ===');
        console.log('Total scene objects:', children.length);
        
        const types = {};
        children.forEach((obj, index) => {
            const type = obj.type || 'Unknown';
            const name = obj.name || obj.constructor?.name || 'Unnamed';
            types[type] = (types[type] || 0) + 1;
            
            // Log first few objects in detail
            if (index < 10) {
                console.log(`  ${index}: ${type} (${name}) - Visible: ${obj.visible !== false}`);
                if (obj.position) {
                    console.log(`    Position: (${obj.position.x.toFixed(2)}, ${obj.position.y.toFixed(2)}, ${obj.position.z.toFixed(2)})`);
                }
            }
        });
        console.log('Object type distribution:', types);
        console.log('=== END SCENE INSPECTOR ===');
    }
}

// Satellite position checker
function checkSatellitePositions() {
    if (window.satelliteManager) {
        console.log('=== SATELLITE POSITIONS ===');
        let visibleCount = 0;
        window.satelliteManager.satellites.forEach((sat, id) => {
            if (sat.object && sat.object.position) {
                const pos = sat.object.position;
                const distance = pos.length();
                if (distance > 1.2) { // Visible distance
                    if (visibleCount < 5) {
                        console.log(`${sat.data?.OBJECT_NAME || id}: 
                                    Distance ${distance.toFixed(2)} 
                                    Position (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`);
                    }
                    visibleCount++;
                }
            }
        });
        console.log(`Total visible satellites: ${visibleCount}`);
        console.log('=== END SATELLITE POSITIONS ===');
    }
}

// Run inspections
setTimeout(() => {
    countSceneObjects();
    setTimeout(checkSatellitePositions, 1000);
}, 6000);

// Make available globally
window.inspectScene = countSceneObjects;
window.inspectSatellitePositions = checkSatellitePositions;
