class SatelliteManager {
    constructor(scene, dataFetcher) {
        this.scene = scene;
        this.dataFetcher = dataFetcher;
        this.satellites = new Map();
        this.orbitPaths = new Map();
        this.labels = new Map();
        this.showOrbits = true;
        this.showLabels = true;
    }

    async loadSatellites() {
        const loadingElement = document.getElementById('loading');
        loadingElement.style.display = 'block';

        try {
            const satelliteData = await this.dataFetcher.fetchSatelliteData();
            this.createSatellites(satelliteData);
        } catch (error) {
            console.error('Error loading satellites:', error);
        } finally {
            loadingElement.style.display = 'none';
        }
    }

    createSatellites(satelliteData) {
        this.clearSatellites();

        satelliteData.forEach((satData, index) => {
            if (index > 100) return;

            const satellite = this.createSatelliteObject(satData);
            const orbitPath = this.createOrbitPath(satData);
            
            this.satellites.set(satData.NORAD_CAT_ID, {
                object: satellite,
                data: satData,
                position: new THREE.Vector3()
            });

            if (orbitPath) {
                this.orbitPaths.set(satData.NORAD_CAT_ID, orbitPath);
                if (this.showOrbits) {
                    this.scene.add(orbitPath);
                }
            }

            this.scene.add(satellite);
        });
    }

    createSatelliteObject(satData) {
        const geometry = new THREE.SphereGeometry(0.02, 8, 8);
        const color = this.dataFetcher.getColorByCategory(satData.category);
        const material = new THREE.MeshBasicMaterial({ color: color });
        
        const satellite = new THREE.Mesh(geometry, material);
        
        const position = this.calculatePosition(satData, new Date());
        if (position) {
            satellite.position.copy(position);
        }
        
        return satellite;
    }

    createOrbitPath(satData) {
        try {
            const positions = [];
            const now = new Date();
            
            for (let i = 0; i <= 100; i++) {
                const time = new Date(now.getTime() + (i * 90 * 60 * 1000));
                const position = this.calculatePosition(satData, time);
                if (position) {
                    positions.push(position.x, position.y, position.z);
                }
            }

            if (positions.length === 0) return null;

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            
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

    calculatePosition(satData, time) {
        try {
            const satrec = satellite.twoline2satrec(
                `1 ${satData.NORAD_CAT_ID.toString().padStart(5, '0')}U ${satData.OBJECT_ID} ${satData.EPOCH.slice(2, 10)} ${satData.MEAN_MOTION_DOT.toFixed(8)} ${satData.MEAN_MOTION_DDOT.toFixed(8)} ${satData.BSTAR.toFixed(8)} 0  999`,
                `2 ${satData.NORAD_CAT_ID.toString().padStart(5, '0')} ${satData.INCLINATION.toFixed(4)} ${satData.RA_OF_ASC_NODE.toFixed(4)} ${satData.ECCENTRICITY.toString().padStart(7, '0')} ${satData.ARG_OF_PERICENTER.toFixed(4)} ${satData.MEAN_ANOMALY.toFixed(4)} ${satData.MEAN_MOTION.toFixed(8)} ${satData.REV_AT_EPOCH}`
            );

            const positionAndVelocity = satellite.propagate(satrec, time);
            const positionEci = positionAndVelocity.position;

            if (!positionEci) return null;

            const gmst = satellite.gstime(time);
            const positionEcef = satellite.eciToEcef(positionEci, gmst);
            
            const scale = 1 / 6371;
            return new THREE.Vector3(
                positionEcef.x * scale,
                positionEcef.z * scale,
                positionEcef.y * scale
            );
        } catch (error) {
            console.error('Error calculating position:', error);
            return null;
        }
    }

    updatePositions() {
        const now = new Date();
        
        this.satellites.forEach((satInfo, id) => {
            const position = this.calculatePosition(satInfo.data, now);
            if (position) {
                satInfo.object.position.copy(position);
                satInfo.position.copy(position);
            }
        });
    }

    toggleOrbits(show) {
        this.showOrbits = show;
        this.orbitPaths.forEach(orbit => {
            orbit.visible = show;
        });
    }

    toggleLabels(show) {
        this.showLabels = show;
    }

    clearSatellites() {
        this.satellites.forEach(satInfo => {
            this.scene.remove(satInfo.object);
        });
        this.orbitPaths.forEach(orbit => {
            this.scene.remove(orbit);
        });
        
        this.satellites.clear();
        this.orbitPaths.clear();
    }
}
