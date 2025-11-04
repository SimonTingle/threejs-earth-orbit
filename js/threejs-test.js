// Three.js functionality test
function testThreeJS() {
    console.log("=== THREE.JS TEST ===");
    
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.error("❌ Three.js not loaded!");
        return;
    }
    
    console.log("✅ Three.js version:", THREE.REVISION || "Unknown");
    
    // Test basic functionality
    try {
        const testGeometry = new THREE.SphereGeometry(1, 8, 8);
        const testMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const testMesh = new THREE.Mesh(testGeometry, testMaterial);
        
        console.log("✅ Basic Three.js objects created successfully");
        console.log("Test mesh:", testMesh);
        
        // Clean up
        testGeometry.dispose();
        testMaterial.dispose();
        
    } catch (error) {
        console.error("❌ Three.js test failed:", error);
    }
    
    console.log("=== THREE.JS TEST COMPLETE ===");
}

// Run test
setTimeout(testThreeJS, 2000);
