class SatelliteManager {
    constructor(scene, dataFetcher) {
        this.scene = scene;
        this.dataFetcher = dataFetcher;
        this.satellites = new Map();
        this.orbitPaths = new Map();
        this.showOrbits = true;
        this.showLabels = false;
        this.processingErrors = 0;
        this.labels = new Map();
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
            if (index > 50) return;

            processedCount++;
            try {
                const satellite = this.createSatelliteObject(satData);
                if (satellite) {
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
        
        // If labels should be shown, create them now
        if (this.showLabels && createdCount > 0) {
            setTimeout(() => this.createAllLabels(), 100);
        }
    }

    createSatelliteObject(satData) {
        try {
            if (!satData || !satData.OBJECT_NAME) {
                console.warn('Invalid satellite data');
                return null;
            }

            const geometry = new THREE.SphereGeometry(0.03, 8, 8);
            const color = this.dataFetcher.getColorByCategory(satData.category);
            const material = new THREE.MeshBasicMaterial({ 
                color: color,
                transparent: true,
                opacity: 0.9
            });
            
            const satellite = new THREE.Mesh(geometry, material);
            
            const position = this.calculateSimplePosition(satData, new Date());
            if (position) {
                satellite.position.copy(position);
            } else {
                satellite.position.set(1.5, 0, 0);
            }
            
            satellite.userData = { satData: satData };
            
            return satellite;
        } catch (error) {
            console.error('Error creating satellite object for', satData?.OBJECT_NAME, ':', error);
            return null;
        }
    }

    createSimpleOrbitPath(satData) {
        try {
            const radius = 1.5 + (Math.random() * 0.5);
            const points = [];
            const segments = 64;
            
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = Math.sin(angle * 2) * 0.2;
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

    createAllLabels() {
        console.log("Creating labels...");
        this.clearLabels();
        
        if (!this.showLabels) {
            console.log("Labels disabled");
            return;
        }
        
        let labelCount = 0;
        
        this.satellites.forEach((satInfo, id) => {
            if (satInfo.data && satInfo.data.OBJECT_NAME) {
                try {
                    const labelDiv = document.createElement('div');
                    labelDiv.id = `label-${id}`;
                    labelDiv.textContent = satInfo.data.OBJECT_NAME.substring(0, 20); // Truncate long names
                    labelDiv.className = 'satellite-label';
                    labelDiv.style.cssText = `
                        position: absolute;
                        background: rgba(0, 0, 0, 0.8);
                        color: white;
                        padding: 2px 6px;
                        border-radius: 3px;
                        font-size: 10px;
                        pointer-events: none;
                        white-space: nowrap;
                        transform: translate(-50%, -100%);
                        z-index: 1000;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        display: ${this.showLabels ? 'block' : 'none'};
                    `;
                    
                    document.body.appendChild(labelDiv);
                    this.labels.set(id, labelDiv);
                    labelCount++;
                } catch (error) {
                    console.error('Error creating label:', error);
                }
            }
        });
        
        console.log(`Created ${labelCount} labels`);
    }

    calculateSimplePosition(satData, time) {
        try {
            const baseAngle = (satData.NORAD_CAT_ID || Math.random() * 1000) * 0.01;
            const angle = baseAngle + (time.getTime() * 0.0001) % (Math.PI * 2);
            
            const radius = 1.5 + ((satData.NORAD_CAT_ID || 0) % 10) * 0.1;
            
            return new THREE.Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle * 0.7) * 0.3,
                Math.sin(angle) * radius
            );
        } catch (error) {
            console.error('Error calculating position:', error);
            return null;
        }
    }

    updatePositions() {
        const now = new Date();
        
        this.satellites.forEach((satInfo, id) => {
            try {
                const position = this.calculateSimplePosition(satInfo.data, now);
                if (position && satInfo.object) {
                    satInfo.object.position.copy(position);
                }
            } catch (error) {
                console.error('Error updating position:', error);
            }
        });
    }

    updateLabelPositions(camera, renderer) {
        if (!this.showLabels || this.labels.size === 0) {
            return;
        }

        this.satellites.forEach((satInfo, id) => {
            const label = this.labels.get(id);
            if (label && satInfo.object) {
                try {
                    const vector = satInfo.object.position.clone();
                    vector.project(camera);
                    
                    const container = document.getElementById('container');
                    if (container) {
                        const rect = container.getBoundingClientRect();
                        const x = (vector.x * 0.5 + 0.5) * rect.width + rect.left;
                        const y = (-vector.y * 0.5 + 0.5) * rect.height + rect.top;
                        
                        if (vector.z <= 1 && vector.z >= -1) {
                            label.style.left = `${x}px`;
                            label.style.top = `${y}px`;
                            label.style.display = 'block';
                        } else {
                            label.style.display = 'none';
                        }
                    }
                } catch (error) {
                    if (label) label.style.display = 'none';
                }
            }
        });
    }

    toggleOrbits(show) {
        this.showOrbits = show;
        this.orbitPaths.forEach(orbit => {
            if (orbit) orbit.visible = show;
        });
    }

    toggleLabels(show) {
        console.log("Toggling labels:", show);
        this.showLabels = show;
        
        if (show && this.satellites.size > 0 && this.labels.size === 0) {
            this.createAllLabels();
        }
        
        this.labels.forEach(label => {
            if (label) {
                label.style.display = show ? 'block' : 'none';
            }
        });
    }

    clearLabels() {
        this.labels.forEach((label, id) => {
            if (label && label.parentNode) {
                label.parentNode.removeChild(label);
            }
        });
        this.labels.clear();
    }

    clearSatellites() {
        this.satellites.forEach((satInfo, id) => {
            if (satInfo.object) this.scene.remove(satInfo.object);
        });
        this.orbitPaths.forEach(orbit => {
            if (orbit) this.scene.remove(orbit);
        });
        
        this.clearLabels();
        this.satellites.clear();
        this.orbitPaths.clear();
        this.processingErrors = 0;
    }
    
    // Debug methods
    getSatelliteCount() {
        return this.satellites.size;
    }
    
    getLabelCount() {  // This method was missing!
        return this.labels.size;
    }
    
    debugInfo() {
        return {
            satellites: this.satellites.size,
            labels: this.labels.size,
            showLabels: this.showLabels,
            showOrbits: this.showOrbits
        };
    }
}
