// Earth rendering debug
function debugEarth() {
    console.log("=== EARTH DEBUG ===");
    
    if (!window.satelliteSim || !window.satelliteSim.earth) {
        console.log("Earth object not initialized");
        return;
    }
    
    const earth = window.satelliteSim.earth;
    console.log("Earth components:");
    console.log("  Earth mesh:", earth.earth ? "✓" : "✗");
    console.log("  Clouds mesh:", earth.clouds ? "✓" : "✗");
    console.log("  Atmosphere mesh:", earth.atmosphere ? "✓" : "✗");
    console.log("  Stars:", earth.stars ? "✓" : "✗");
    console.log("  Sun light:", earth.sunLight ? "✓" : "✗");
    
    // Check if meshes have geometry and material
    if (earth.earth) {
        console.log("Earth mesh details:");
        console.log("  Geometry:", earth.earth.geometry ? "✓" : "✗");
        console.log("  Material:", earth.earth.material ? "✓" : "✗");
        console.log("  Position:", earth.earth.position);
        console.log("  Visible:", earth.earth.visible);
    }
    
    if (earth.clouds) {
        console.log("Clouds mesh details:");
        console.log("  Geometry:", earth.clouds.geometry ? "✓" : "✗");
        console.log("  Material:", earth.clouds.material ? "✓" : "✗");
        console.log("  Position:", earth.clouds.position);
        console.log("  Visible:", earth.clouds.visible);
    }
    
    console.log("=== EARTH DEBUG COMPLETE ===");
}

// Run earth debug
setTimeout(debugEarth, 4000);

// Make available globally
window.debugEarth = debugEarth;
