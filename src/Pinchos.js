class Pinchos extends THREE.Object3D {
    constructor(num) {
        super();
        this.radius = 5;

        var geometry = new THREE.ConeGeometry(5, 20, 32);
        var texture = new THREE.TextureLoader().load('../imgs/pinchos.jpg');
        var material = new THREE.MeshPhongMaterial ({map: texture});

        for (var i = 0; i < num / 3; i++) {
            var cone = new THREE.Mesh(geometry, material);
            cone.position.x = i * 5;
            this.add(cone);
        }

        for (var i = 0; i < num / 3; i++) {
            var cone = new THREE.Mesh(geometry, material);
            cone.position.z = -5;
            cone.position.x = i * 5;
            this.add(cone);
        }

        for (var i = 0; i < num / 3; i++) {
            var cone = new THREE.Mesh(geometry, material);
            cone.position.z = +5;
            cone.position.x = i * 5;
            this.add(cone);
        }

        var geometrysphere = new THREE.SphereGeometry(5 * num / 3, 32, 32);
        var materialsphere = new THREE.MeshBasicMaterial({ visible: false });
        this.sphere = new THREE.Mesh(geometrysphere, materialsphere);
        this.sphere.scale.set(0.8, 1.2, 1);

        this.sphere.position.x = 2.5;
        this.add(this.sphere);
    }
}