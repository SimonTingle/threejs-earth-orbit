// Data viewer for debugging
class DataViewer {
    static async viewSatelliteData() {
        console.log("=== Satellite Data Viewer ===");
        
        try {
            // Test each data group
            const groups = ['stations', 'gps-ops', 'weather'];
            
            for (const group of groups) {
                console.log(`\n--- Testing ${group} ---`);
                try {
                    const response = await fetch(`https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`);
                    console.log(`Status: ${response.status}`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log(`Success! Found ${data.length} satellites`);
                        if (data.length > 0) {
                            console.log('First satellite:', data[0]);
                        }
                    } else {
                        console.log(`Error: ${response.status} - ${response.statusText}`);
                    }
                } catch (error) {
                    console.log(`Fetch error: ${error.message}`);
                }
            }
            
        } catch (error) {
            console.error('Data viewer error:', error);
        }
    }
}

// Run automatically
DataViewer.viewSatelliteData();
