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
        this.earthRadius = 1.0;
        this.minCameraDistance = this.earthRadius + 0.2;
        this.maxCameraDistance = 30.0;
        this.defaultCameraDistance = 5.0;
        
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
        window.dataFetcher = this.dataFetcher;
        
        this.earth = new Earth(this.scene);
        this.satelliteManager = new SatelliteManager(this.scene, this.dataFetcher);
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
        // Enable shadows for better day/night effect
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
                
                this.constrainCameraPosition();
                
                const currentDistance = this.camera.position.length();
                const rotationSpeed = Math.max(0.001, 0.005 / (currentDistance / this.defaultCameraDistance));
                
                this.camera.position.applyAxisAngle(
                    new THREE.Vector3(0, 1, 0),
                    deltaMove.x * rotationSpeed
                );
                
                this.camera.position.applyAxisAngle(
                    new THREE.Vector3(1, 0, 0),
                    deltaMove.y * rotationSpeed
                );
                
                this.constrainCameraPosition();
                this.camera.lookAt(0, 0, 0);
            }
            
            previousMousePosition = {
                x: e.offsetX,
                y: e.offsetY
            };
        });
        
        document.addEventListener('wheel', (e) => {
            isZooming = true;
            
            const zoomSensitivity = 0.1;
            const zoomDelta = e.deltaY > 0 ? zoomSensitivity : -zoomSensitivity;
            
            const currentDistance = this.camera.position.length();
            let newDistance = currentDistance * (1 - zoomDelta);
            
            newDistance = Math.max(this.minCameraDistance, Math.min(this.maxCameraDistance, newDistance));
            
            this.camera.position.normalize().multiplyScalar(newDistance);
            this.camera.lookAt(0, 0, 0);
            
            setTimeout(() => {
                isZooming = false;
            }, 50);
        });
    }

    constrainCameraPosition() {
        const distance = this.camera.position.length();
        
        if (distance < this.minCameraDistance) {
            this.camera.position.normalize().multiplyScalar(this.minCameraDistance);
        }
        
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
            console.log("Label checkbox changed:", e.target.checked);
            this.satelliteManager.toggleLabels(e.target.checked);
        });

        document.getElementById('refreshData').addEventListener('click', () => {
            this.loadSatellites();
        });
        
        // Add debug button handler
        document.getElementById('debugLabels').addEventListener('click', () => {
            console.log("=== Debug Labels Clicked ===");
            if (window.satelliteManager) {
                console.log("Debug info:", window.satelliteManager.debugInfo());
            }
            console.log("Current camera position:", this.camera.position);
        });
    }

    async loadSatellites() {
        console.log("Loading satellites...");
        await this.satelliteManager.loadSatellites();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.constrainCameraPosition();
        
        this.earth.rotate();
        this.satelliteManager.updatePositions();
        
        // Update label positions every frame
        this.satelliteManager.updateLabelPositions(this.camera, this.renderer);
        
        this.renderer.render(this.scene, this.camera);
    }
    
    resetCamera() {
        this.camera.position.set(0, 0, this.defaultCameraDistance);
        this.camera.lookAt(0, 0, 0);
    }
    
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

document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        if (window.satelliteSim) {
            window.satelliteSim.resetCamera();
        }
    } else if (e.key === 'c' || e.key === 'C') {
        if (window.satelliteSim) {
            console.log("Camera info:", window.satelliteSim.getCameraInfo());
        }
    } else if (e.key === 'd' || e.key === 'D') {
        // Debug key
        if (window.satelliteManager) {
            console.log("Debug info:", window.satelliteManager.debugInfo());
        }
    }
});
