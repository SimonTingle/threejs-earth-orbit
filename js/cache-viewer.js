// Cache viewer
function viewCache() {
    console.log("=== Checking Data Cache ===");
    
    // Try to access the data fetcher cache
    if (window.dataFetcher && window.dataFetcher.cache) {
        console.log("Cache contents:", window.dataFetcher.cache);
        console.log("Cache size:", window.dataFetcher.cache.size);
    } else {
        console.log("Data fetcher not yet initialized");
    }
    
    // Check if satellites exist in the manager
    if (window.satelliteSim && window.satelliteSim.satelliteManager) {
        const satManager = window.satelliteSim.satelliteManager;
        console.log("Satellites count:", satManager.satellites.size);
        console.log("Satellites map:", satManager.satellites);
    }
}

// Run after a delay to allow initialization
setTimeout(viewCache, 5000);
