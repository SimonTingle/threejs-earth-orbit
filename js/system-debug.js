// System debug script
function debugSystem() {
    console.log("=== SYSTEM DEBUG START ===");
    
    // Check if all required objects exist
    console.log("Window objects:");
    console.log("  satelliteSim:", window.satelliteSim ? "✓ Exists" : "✗ Missing");
    console.log("  satelliteManager:", window.satelliteManager ? "✓ Exists" : "✗ Missing");
    console.log("  dataFetcher:", window.dataFetcher ? "✓ Exists" : "✗ Missing");
    
    // Check satellite manager status
    if (window.satelliteManager) {
        const info = window.satelliteManager.debugInfo();
        console.log("Satellite Manager Info:", info);
        
        // Check satellites
        console.log("Satellites map size:", window.satelliteManager.satellites.size);
        console.log("Labels map size:", window.satelliteManager.labels.size);
        
        // List first few satellites
        let count = 0;
        window.satelliteManager.satellites.forEach((sat, id) => {
            if (count < 5) {
                console.log(`Satellite ${id}:`, sat.data?.OBJECT_NAME, sat.data?.category);
                count++;
            }
        });
    }
    
    // Check Earth status
    if (window.satelliteSim && window.satelliteSim.earth) {
        console.log("Earth object:", window.satelliteSim.earth);
        console.log("Earth mesh:", window.satelliteSim.earth.earth ? "✓ Exists" : "✗ Missing");
        console.log("Clouds mesh:", window.satelliteSim.earth.clouds ? "✓ Exists" : "✗ Missing");
        console.log("Atmosphere mesh:", window.satelliteSim.earth.atmosphere ? "✓ Exists" : "✗ Missing");
    }
    
    // Check DOM elements
    console.log("DOM Elements:");
    console.log("  Container:", document.getElementById('container') ? "✓ Exists" : "✗ Missing");
    console.log("  Controls:", document.getElementById('controls') ? "✓ Exists" : "✗ Missing");
    console.log("  Labels:", document.querySelectorAll('.satellite-label').length);
    
    // Check Three.js
    console.log("Three.js status:");
    console.log("  THREE:", typeof THREE !== 'undefined' ? "✓ Loaded" : "✗ Not loaded");
    if (typeof THREE !== 'undefined') {
        console.log("  Scene objects:", window.satelliteSim?.scene?.children?.length || "Unknown");
    }
    
    console.log("=== SYSTEM DEBUG END ===");
}

// Run debug after a delay to ensure everything loads
setTimeout(debugSystem, 3000);

// Also run on demand
window.runDebug = debugSystem;
