class Aro extends THREE.Object3D {
    constructor() {
        super();

        this.radio = 10;
        var geometry = new THREE.TorusGeometry(10, 0.5, 16, 100);
        var material = new THREE.MeshBasicMaterial({ color: 0xff8000 });
        var a = new THREE.Mesh(geometry, material);
        a.rotation.y = 1.57;

        this.aro = new THREE.Object3D();
        this.aro.add(a);

        this.add(this.aro);
        this.createTransparentBox();

    }

    getradio() {
        return this.radio;
    }


    createTransparentBox() {
        var material = new THREE.MeshBasicMaterial({ visible: false });
        var geometry = new THREE.BoxGeometry(5, 10, 15);
        // var materialFis = new Physijs.createMaterial(material, 0.3, 0.2);

        //var materialFis = new Physijs.createMaterial(material, 0.3, 0.2);
        //this.transparentBox = new Physijs.BoxMesh(geometry, materialFis, 0);

        this.transparentBox = new THREE.Mesh(geometry, material);
        //this.transparentBox.rotation.y = 1.57;
        //  this.transparentBox = new Physijs.BoxMesh(geometry, materialFis, 0);

        this.transparentBox.position.copy(this.aro.position);
        this.add(this.transparentBox);

    }
    update() {
        this.aro.rotation.x += 0.1;
    }
}