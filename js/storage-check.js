
// Satellite storage verification
function verifySatelliteStorage() {
    if (window.satelliteManager) {
        console.log('=== SATELLITE STORAGE VERIFICATION ===');
        console.log('Satellites in map:', window.satelliteManager.satellites.size);
        
        let count = 0;
        window.satelliteManager.satellites.forEach((sat, id) => {
            if (count < 3) {
                console.log('Satellite', id, ':', sat.data?.OBJECT_NAME, sat.data?.category);
                if (sat.object) {
                    console.log('  Object position:', sat.object.position);
                    console.log('  Object visible:', sat.object.visible);
                }
            }
            count++;
        });
        console.log('=== END VERIFICATION ===');
    }
}

// Run verification
setTimeout(verifySatelliteStorage, 8000);
window.verifyStorage = verifySatelliteStorage;

