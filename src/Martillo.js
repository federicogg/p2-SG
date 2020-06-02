class Martillo {

    constructor() {

        this.mesh = this.createHandle();
        this.mesh.position.y = 15;
        this.mesh.rotation.y = 4.75;
    }

    getMesh() {
        return this.mesh;
    }

    createHead() {

        var geometry = new THREE.CylinderGeometry(5, 5, 10, 15);
        var material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        var materialFis = new Physijs.createMaterial(material, 0, 0);
        var mesh = new Physijs.CylinderMesh(geometry, materialFis, 0);


        mesh.position.y = 9.5;
        mesh.rotation.z += 1.65;


        return mesh;
    }

    createHandle() {
        var geometry = new THREE.CylinderGeometry(2, 2, 30, 32);
        var texture = new THREE.TextureLoader().load('../imgs/wood.jpg');
        var material = new THREE.MeshBasicMaterial({ map: texture });
        var materialFis = new Physijs.createMaterial(material, 0, 0);
        var mesh = new Physijs.CylinderMesh(geometry, materialFis, 0);

        mesh.position.y = 15;

        var headMesh = this.createHead();
        mesh.add(headMesh);

        return mesh;
    }





}