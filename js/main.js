class SatelliteSimulator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.earth = null;
        this.satelliteManager = null;
        this.dataFetcher = null;
        this.controls = null;
        
        // Camera constraints
        this.earthRadius = 1.0; // Earth radius in our coordinate system
        this.minCameraDistance = this.earthRadius + 0.2; // Minimum 0.2 units above Earth surface
        this.maxCameraDistance = 30.0; // Maximum distance from Earth center
        this.defaultCameraDistance = 5.0; // Default starting distance
        
        // Make global for debugging
        window.satelliteSim = this;
        
        this.init();
    }

    init() {
        console.log("Initializing Satellite Simulator...");
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupEventListeners();
        
        this.dataFetcher = new DataFetcher();
        window.dataFetcher = this.dataFetcher; // Make global for debugging
        
        this.earth = new Earth(this.scene);
        this.satelliteManager = new SatelliteManager(this.scene, this.dataFetcher);
        
        // Make global for debugging
        window.satelliteManager = this.satelliteManager;
        
        this.loadSatellites();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, this.defaultCameraDistance);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('container').appendChild(this.renderer.domElement);
    }

    setupControls() {
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let isZooming = false;
        
        document.addEventListener('mousedown', (e) => {
            isDragging = true;
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging && !isZooming) {
                const deltaMove = {
                    x: e.offsetX - previousMousePosition.x,
                    y: e.offsetY - previousMousePosition.y
                };
                
                // Constrain camera before rotation
                this.constrainCameraPosition();
                
                // Calculate rotation speed based on distance
                const currentDistance = this.camera.position.length();
                const rotationSpeed = Math.max(0.001, 0.005 / (currentDistance / this.defaultCameraDistance));
                
                // Rotate camera around Earth center
                this.camera.position.applyAxisAngle(
                    new THREE.Vector3(0, 1, 0),
                    deltaMove.x * rotationSpeed
                );
                
                this.camera.position.applyAxisAngle(
                    new THREE.Vector3(1, 0, 0),
                    deltaMove.y * rotationSpeed
                );
                
                // Constrain camera after rotation
                this.constrainCameraPosition();
                this.camera.lookAt(0, 0, 0);
            }
            
            previousMousePosition = {
                x: e.offsetX,
                y: e.offsetY
            };
        });
        
        // Wheel zoom with constraints
        document.addEventListener('wheel', (e) => {
            isZooming = true;
            
            const zoomSensitivity = 0.1;
            const zoomDelta = e.deltaY > 0 ? zoomSensitivity : -zoomSensitivity;
            
            // Get current camera distance
            const currentDistance = this.camera.position.length();
            
            // Calculate new distance
            let newDistance = currentDistance * (1 - zoomDelta);
            
            // Apply constraints
            newDistance = Math.max(this.minCameraDistance, Math.min(this.maxCameraDistance, newDistance));
            
            // Apply new distance
            this.camera.position.normalize().multiplyScalar(newDistance);
            this.camera.lookAt(0, 0, 0);
            
            // Reset zooming flag after a short delay
            setTimeout(() => {
                isZooming = false;
            }, 50);
        });
    }

    constrainCameraPosition() {
        const distance = this.camera.position.length();
        
        // Prevent camera from going inside Earth
        if (distance < this.minCameraDistance) {
            this.camera.position.normalize().multiplyScalar(this.minCameraDistance);
        }
        
        // Prevent camera from going too far
        if (distance > this.maxCameraDistance) {
            this.camera.position.normalize().multiplyScalar(this.maxCameraDistance);
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        document.getElementById('showOrbits').addEventListener('change', (e) => {
            this.satelliteManager.toggleOrbits(e.target.checked);
        });

        document.getElementById('showLabels').addEventListener('change', (e) => {
            this.satelliteManager.toggleLabels(e.target.checked);
        });

        document.getElementById('refreshData').addEventListener('click', () => {
            this.loadSatellites();
        });
    }

    async loadSatellites() {
        console.log("Loading satellites...");
        await this.satelliteManager.loadSatellites();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Continuous constraint checking
        this.constrainCameraPosition();
        
        this.earth.rotate();
        this.satelliteManager.updatePositions();
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // Reset camera to default position
    resetCamera() {
        this.camera.position.set(0, 0, this.defaultCameraDistance);
        this.camera.lookAt(0, 0, 0);
    }
    
    // Get current camera info for debugging
    getCameraInfo() {
        const distance = this.camera.position.length();
        return {
            position: this.camera.position.clone(),
            distance: distance,
            minDistance: this.minCameraDistance,
            maxDistance: this.maxCameraDistance,
            isConstrained: distance <= this.minCameraDistance || distance >= this.maxCameraDistance
        };
    }
}

window.addEventListener('load', () => {
    console.log("Page loaded, starting simulator...");
    new SatelliteSimulator();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        // Reset camera
        if (window.satelliteSim) {
            window.satelliteSim.resetCamera();
        }
    } else if (e.key === 'c' || e.key === 'C') {
        // Check camera info
        if (window.satelliteSim) {
            console.log("Camera info:", window.satelliteSim.getCameraInfo());
        }
    }
});
