// Simple label test function
function testLabels() {
    console.log("=== Label Test ===");
    
    // Check if we have access to satellite manager
    if (!window.satelliteManager) {
        console.log("Satellite manager not available yet");
        // Try again in a bit
        setTimeout(testLabels, 1000);
        return;
    }
    
    const info = window.satelliteManager.debugInfo();
    console.log("Debug info:", info);
    
    // Try to create a simple test label
    try {
        const testLabel = document.createElement('div');
        testLabel.id = 'test-label';
        testLabel.textContent = 'TEST LABEL - YOU SHOULD SEE THIS';
        testLabel.style.cssText = `
            position: fixed;
            top: 100px;
            left: 100px;
            background: red;
            color: white;
            padding: 10px;
            z-index: 9999;
            border: 2px solid white;
            font-size: 14px;
        `;
        document.body.appendChild(testLabel);
        console.log("Test label created - check if you can see it at top-left!");
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (testLabel.parentNode) {
                testLabel.parentNode.removeChild(testLabel);
                console.log("Test label removed");
            }
        }, 5000);
        
    } catch (error) {
        console.error("Error creating test label:", error);
    }
}

// Run automatically after a delay to ensure everything is loaded
setTimeout(testLabels, 3000);
