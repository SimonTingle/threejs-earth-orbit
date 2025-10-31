class SatelliteSimulator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.earth = null;
        this.satelliteManager = null;
        this.dataFetcher = null;
        this.controls = null;
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupEventListeners();
        
        this.dataFetcher = new DataFetcher();
        this.earth = new Earth(this.scene);
        this.satelliteManager = new SatelliteManager(this.scene, this.dataFetcher);
        
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
        this.camera.position.set(0, 0, 5);
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
        
        document.addEventListener('mousedown', (e) => {
            isDragging = true;
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaMove = {
                    x: e.offsetX - previousMousePosition.x,
                    y: e.offsetY - previousMousePosition.y
                };
                
                this.camera.position.applyAxisAngle(
                    new THREE.Vector3(0, 1, 0),
                    deltaMove.x * 0.01
                );
                
                this.camera.position.applyAxisAngle(
                    new THREE.Vector3(1, 0, 0),
                    deltaMove.y * 0.01
                );
                
                this.camera.lookAt(0, 0, 0);
            }
            
            previousMousePosition = {
                x: e.offsetX,
                y: e.offsetY
            };
        });
        
        document.addEventListener('wheel', (e) => {
            const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
            this.camera.position.multiplyScalar(zoomFactor);
            this.camera.lookAt(0, 0, 0);
        });
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
        await this.satelliteManager.loadSatellites();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.earth.rotate();
        this.satelliteManager.updatePositions();
        
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('load', () => {
    new SatelliteSimulator();
});
