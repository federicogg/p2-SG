class helices extends THREE.Object3D {
    constructor() {
        super();

        var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        var geometry = new THREE.BoxGeometry(30, 0.5, 4);

        this.h1 = new THREE.Mesh(geometry, material);
        this.h2 = new THREE.Mesh(geometry, material);

     
        //this
        this.h2.rotation.y = 1.57;

        this.add(this.h1);
        this.add(this.h2);

        this.rotation.z = 1.57;
        this.position.y = 15;
    }

    update() {
        this.rotation.x += 0.02;
    }
}