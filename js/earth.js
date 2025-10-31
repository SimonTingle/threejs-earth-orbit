class Earth {
    constructor(scene) {
        this.scene = scene;
        this.earth = null;
        this.clouds = null;
        this.stars = null;
        this.init();
    }

    init() {
        const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
        const earthMaterial = new THREE.MeshPhongMaterial({
            color: 0x2233ff,
            specular: 0x333333,
            shininess: 5
        });

        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.scene.add(this.earth);

        const cloudGeometry = new THREE.SphereGeometry(1.01, 64, 64);
        const cloudMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });

        this.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        this.scene.add(this.clouds);

        this.createStars();

        const ambientLight = new THREE.AmbientLight(0x333333);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(5, 3, 5);
        this.scene.add(sunLight);
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

    rotate() {
        if (this.earth) {
            this.earth.rotation.y += 0.002;
        }
        if (this.clouds) {
            this.clouds.rotation.y += 0.003;
        }
    }
}
