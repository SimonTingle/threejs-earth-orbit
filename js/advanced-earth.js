// Advanced Earth visualization with day/night terminator
class AdvancedEarth {
    constructor(scene) {
        this.scene = scene;
        this.earth = null;
        this.clouds = null;
        this.atmosphere = null;
        this.stars = null;
        this.sunLight = null;
        this.terminatorLine = null;
        this.time = 0;
        this.init();
    }

    init() {
        // Create Earth sphere
        const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
        
        // Enhanced Earth material with better coloring
        const earthMaterial = new THREE.MeshPhongMaterial({
            color: 0x2266ff,
            specular: 0x222222,
            shininess: 5,
            transparent: true,
            opacity: 0.95
        });

        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.scene.add(this.earth);

        // Create atmosphere
        const atmosphereGeometry = new THREE.SphereGeometry(1.02, 64, 64);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.1,
            specular: 0x555555
        });

        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(this.atmosphere);

        // Create clouds
        const cloudGeometry = new THREE.SphereGeometry(1.01, 64, 64);
        const cloudMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2,
            wireframe: false
        });

        this.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        this.scene.add(this.clouds);

        // Create stars
        this.createStars();

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x333333);
        this.scene.add(ambientLight);

        // Main directional light (sun)
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
        this.sunLight.position.set(5, 3, 5);
        this.sunLight.castShadow = true;
        this.scene.add(this.sunLight);

        // Add hemisphere light for more natural illumination
        const hemisphereLight = new THREE.HemisphereLight(0x88ccff, 0x4466aa, 0.3);
        this.scene.add(hemisphereLight);
    }

    createStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.02,
            sizeAttenuation: true
        });

        const starVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
    }

    update(time) {
        this.time = time || Date.now();
        
        // Rotate Earth (once per 24 hours)
        if (this.earth) {
            this.earth.rotation.y = (this.time / 86400000) * Math.PI * 2;
        }
        
        // Rotate clouds slightly faster
        if (this.clouds) {
            this.clouds.rotation.y = (this.time / 80000000) * Math.PI * 2;
        }
        
        // Rotate atmosphere with Earth
        if (this.atmosphere) {
            this.atmosphere.rotation.y = this.earth.rotation.y;
        }
        
        // Update sun position for day/night cycle
        this.updateSunPosition();
    }

    updateSunPosition() {
        const now = new Date();
        const hours = now.getHours() + now.getMinutes() / 60;
        
        // Position sun based on time of day
        const sunAngle = (hours / 24) * Math.PI * 2;
        const sunDistance = 10;
        
        if (this.sunLight) {
            this.sunLight.position.x = Math.cos(sunAngle) * sunDistance;
            this.sunLight.position.z = Math.sin(sunAngle) * sunDistance;
            this.sunLight.position.y = Math.sin(sunAngle * 0.5) * sunDistance * 0.3;
        }
    }

    // Add simple continent markers
    addContinentMarkers() {
        const markers = [];
        
        // Simple marker points for major continents
        const continentPoints = [
            { lat: 40, lon: -100, name: "North America", color: 0xff0000 }, // Red
            { lat: -15, lon: -60, name: "South America", color: 0x00ff00 }, // Green
            { lat: 50, lon: 10, name: "Europe", color: 0x0000ff }, // Blue
            { lat: 35, lon: 105, name: "Asia", color: 0xffff00 }, // Yellow
            { lat: -25, lon: 135, name: "Australia", color: 0xff00ff }, // Magenta
            { lat: 0, lon: 20, name: "Africa", color: 0x00ffff } // Cyan
        ];
        
        continentPoints.forEach(point => {
            const latRad = point.lat * Math.PI / 180;
            const lonRad = point.lon * Math.PI / 180;
            
            const x = Math.cos(latRad) * Math.cos(lonRad) * 1.01;
            const y = Math.sin(latRad) * 1.01;
            const z = Math.cos(latRad) * Math.sin(lonRad) * 1.01;
            
            const markerGeometry = new THREE.SphereGeometry(0.02, 8, 8);
            const markerMaterial = new THREE.MeshBasicMaterial({ 
                color: point.color,
                transparent: true,
                opacity: 0.7
            });
            
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.set(x, y, z);
            marker.userData = { continent: point.name };
            
            this.scene.add(marker);
            markers.push(marker);
        });
        
        return markers;
    }
}
