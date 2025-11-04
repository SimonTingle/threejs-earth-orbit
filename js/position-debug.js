// Position debugging with actual coordinates
function debugSatellitePositions() {
    if (window.satelliteManager && window.satelliteManager.satellites) {
        console.log('=== SATELLITE POSITION DEBUG ===');
        const positionMap = new Map();
        let count = 0;
        
        window.satelliteManager.satellites.forEach((sat, id) => {
            if (sat.object && sat.object.position && count < 10) {
                const pos = sat.object.position;
                const x = parseFloat(pos.x.toFixed(3));
                const y = parseFloat(pos.y.toFixed(3));
                const z = parseFloat(pos.z.toFixed(3));
                const coord = x + ',' + y + ',' + z;
                
                // Count how many satellites at each position
                if (positionMap.has(coord)) {
                    positionMap.set(coord, positionMap.get(coord) + 1);
                } else {
                    positionMap.set(coord, 1);
                }
                
                console.log((sat.data && sat.data.OBJECT_NAME) || id + ': (' + coord + ')');
                count++;
            }
        });
        
        console.log('Position distribution:');
        positionMap.forEach((count, coord) => {
            console.log('  ' + coord + ': ' + count + ' satellite(s)');
        });
        
        const uniquePositions = positionMap.size;
        console.log('Unique positions: ' + uniquePositions + ' out of ' + count + ' checked');
        console.log('=== END POSITION DEBUG ===');
        
        // Alert if all satellites are stacked
        if (uniquePositions === 1 && count > 1) {
            console.warn('⚠️  WARNING: All satellites are stacked at the same position!');
        }
    }
}

setTimeout(debugSatellitePositions, 10000);
window.debugPositions = debugSatellitePositions;
