class SatelliteManager {
    constructor(scene, dataFetcher) {
        this.scene = scene;
        this.dataFetcher = dataFetcher;
        this.satellites = new Map();
        this.orbitPaths = new Map();
        this.showOrbits = true;
        this.showLabels = true;
        this.processingErrors = 0;
    }

    async loadSatellites() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'block';
            loadingElement.textContent = 'Loading satellite data...';
        }

        try {
            console.log("Loading satellites...");
            const satelliteData = await this.dataFetcher.fetchSatelliteData();
            console.log("Satellite data received:", satelliteData.length, "satellites");
            
            if (satelliteData.length === 0) {
                console.warn("No satellite data received");
                if (loadingElement) {
                    loadingElement.textContent = 'No satellite data available';
                }
                return;
            }
            
            this.createSatellites(satelliteData);
            
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Error loading satellites:', error);
            if (loadingElement) {
                loadingElement.textContent = 'Error loading satellite data';
            }
        }
    }

    createSatellites(satelliteData) {
        console.log("Creating satellites from", satelliteData.length, "data items");
        this.clearSatellites();
        this.processingErrors = 0;

        let createdCount = 0;
        let processedCount = 0;
        
        satelliteData.forEach((satData, index) => {
            if (index > 100) return; // Limit for performance

            processedCount++;
            try {
                const satellite = this.createSatelliteObject(satData);
                if (satellite) {
                    // Create a simple orbit path for visualization
                    const orbitPath = this.createSimpleOrbitPath(satData);
                    
                    this.satellites.set(satData.NORAD_CAT_ID || `sat_${index}`, {
                        object: satellite,
                        data: satData,
                        position: new THREE.Vector3()
                    });

                    if (orbitPath) {
                        this.orbitPaths.set(satData.NORAD_CAT_ID || `sat_${index}`, orbitPath);
                        if (this.showOrbits) {
                            this.scene.add(orbitPath);
                        }
                    }

                    this.scene.add(satellite);
                    createdCount++;
                } else {
                    this.processingErrors++;
                }
            } catch (error) {
                console.error('Error creating satellite at index', index, satData.OBJECT_NAME, ':', error);
                this.processingErrors++;
            }
        });
        
        console.log(`Processed ${processedCount} satellites, created ${createdCount}, errors: ${this.processingErrors}`);
    }

    createSatelliteObject(satData) {
        try {
            if (!satData || !satData.OBJECT_NAME) {
                console.warn('Invalid satellite data');
                return null;
            }

            const geometry = new THREE.SphereGeometry(0.02, 8, 8);
            const color = this.dataFetcher.getColorByCategory(satData.category);
            const material = new THREE.MeshBasicMaterial({ 
                color: color,
                transparent: true,
                opacity: 0.9
            });
            
            const satellite = new THREE.Mesh(geometry, material);
            
            // Set initial position using fallback method
            const position = this.calculateSimplePosition(satData, new Date());
            if (position) {
                satellite.position.copy(position);
            } else {
                // Place at default position if calculation fails
                satellite.position.set(1.5, 0, 0);
            }
            
            // Store reference for debugging
            satellite.userData = { satData: satData };
            
            return satellite;
        } catch (error) {
            console.error('Error creating satellite object for', satData?.OBJECT_NAME, ':', error);
            return null;
        }
    }

    createSimpleOrbitPath(satData) {
        try {
            // Create a simple circular orbit for visualization
            const radius = 1.5 + (Math.random() * 0.5);
            const points = [];
            const segments = 64;
            
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = Math.sin(angle * 2) * 0.2; // Add some inclination
                points.push(new THREE.Vector3(x, y, z));
            }
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const color = this.dataFetcher.getColorByCategory(satData.category);
            const material = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.3
            });
            
            const orbitPath = new THREE.Line(geometry, material);
            orbitPath.visible = this.showOrbits;
            
            return orbitPath;
        } catch (error) {
            console.error('Error creating orbit path:', error);
            return null;
        }
    }

    calculateSimplePosition(satData, time) {
        try {
            // Simple circular orbit calculation
            const baseAngle = (satData.NORAD_CAT_ID || Math.random() * 1000) * 0.01;
            const orbitalPeriod = 90 * 60 * 1000; // 90 minutes in milliseconds
            const angle = baseAngle + (time.getTime() * 0.0001) % (Math.PI * 2);
            
            const radius = 1.5 + ((satData.NORAD_CAT_ID || 0) % 10) * 0.1;
            
            return new THREE.Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle * 0.7) * 0.3,
                Math.sin(angle) * radius
            );
        } catch (error) {
            console.error('Error calculating simple position:', error);
            return null;
        }
    }

    updatePositions() {
        const now = new Date();
        let updatedCount = 0;
        
        this.satellites.forEach((satInfo, id) => {
            try {
                const position = this.calculateSimplePosition(satInfo.data, now);
                if (position && satInfo.object) {
                    satInfo.object.position.copy(position);
                    if (satInfo.position) {
                        satInfo.position.copy(position);
                    }
                    updatedCount++;
                }
            } catch (error) {
                console.error('Error updating satellite position:', error);
            }
        });
        
        // Update every few seconds for performance
        if (updatedCount > 0) {
            // console.log("Updated", updatedCount, "satellite positions");
        }
    }

    toggleOrbits(show) {
        this.showOrbits = show;
        this.orbitPaths.forEach(orbit => {
            if (orbit) orbit.visible = show;
        });
    }

    toggleLabels(show) {
        this.showLabels = show;
    }

    clearSatellites() {
        this.satellites.forEach(satInfo => {
            if (satInfo.object) this.scene.remove(satInfo.object);
        });
        this.orbitPaths.forEach(orbit => {
            if (orbit) this.scene.remove(orbit);
        });
        
        this.satellites.clear();
        this.orbitPaths.clear();
        this.processingErrors = 0;
    }
    
    // Debug methods
    getSatelliteCount() {
        return this.satellites.size;
    }
    
    listSatellites() {
        const names = [];
        this.satellites.forEach((sat, id) => {
            if (sat.data && sat.data.OBJECT_NAME) {
                names.push(sat.data.OBJECT_NAME);
            }
        });
        return names;
    }
    
    getStats() {
        return {
            totalSatellites: this.satellites.size,
            orbitPaths: this.orbitPaths.size,
            errors: this.processingErrors
        };
    }
}
