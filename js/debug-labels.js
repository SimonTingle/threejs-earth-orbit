function debugLabelsComprehensive() {
    console.log("=== COMPREHENSIVE LABEL DEBUG ===");
    
    if (!window.satelliteManager) {
        console.log("❌ Satellite manager not available");
        return;
    }
    
    const info = window.satelliteManager.debugInfo();
    console.log("📊 Satellite Manager Info:", info);
    
    // Check DOM elements
    const labelElements = document.querySelectorAll('.satellite-label');
    console.log("🏷️  Label elements in DOM:", labelElements.length);
    
    // Check if any are visible
    let visibleCount = 0;
    labelElements.forEach((label, index) => {
        if (label.style.display !== 'none') {
            visibleCount++;
            if (visibleCount <= 3) { // Only log first 3
                console.log(`   Visible label ${index}:`, label.textContent, `at ${label.style.left}, ${label.style.top}`);
            }
        }
    });
    console.log("👀 Visible labels:", visibleCount);
    
    // Check CSS
    const styleSheets = document.styleSheets;
    let foundLabelCSS = false;
    for (let sheet of styleSheets) {
        try {
            const rules = sheet.cssRules || sheet.rules;
            for (let rule of rules) {
                if (rule.selectorText && rule.selectorText.includes('.satellite-label')) {
                    console.log("🎨 Found label CSS rule:", rule.selectorText);
                    foundLabelCSS = true;
                }
            }
        } catch (e) {
            // Skip cross-origin stylesheets
        }
    }
    if (!foundLabelCSS) {
        console.log("⚠️  No .satellite-label CSS found");
    }
    
    // Try to force show one label
    if (labelElements.length > 0) {
        const firstLabel = labelElements[0];
        firstLabel.style.display = 'block';
        firstLabel.style.position = 'fixed';
        firstLabel.style.top = '50px';
        firstLabel.style.left = '50px';
        firstLabel.style.background = 'red';
        firstLabel.style.zIndex = '9999';
        console.log("🔧 Forced first label to be visible for testing");
    }
    
    console.log("=== END DEBUG ===");
}

// Run after everything loads
setTimeout(debugLabelsComprehensive, 4000);
