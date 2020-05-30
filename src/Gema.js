class Gema extends THREE.Object3D {

    constructor() {
        super();
        var material = new THREE.MeshStandardMaterial({ color: 0xe71111 });
        this.crearRombo(material);

    }

    update() {
        this.rotation.y += 0.02;
    }

    crearRombo(mat) {

        var shape = this.diamondShape();
        var options = {
            depth: 0,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 2,
            bevelSize: 1,
            bevelThickness: 1,
            curveSegments: 10
        };

        var geometry = new THREE.ExtrudeGeometry(shape, options);


        var mesh = new THREE.Mesh(geometry, mat);
        mesh.scale.set(0.75, 0.75, 0.75);

        this.add(mesh);
    }



    diamondShape() {
        var shape = new THREE.Shape();

        shape.moveTo(0, 0);
        shape.lineTo(5, 7.5);
        shape.lineTo(0, 15);
        shape.lineTo(-5, 7.5);
        shape.lineTo(0.0);


        return shape;
    }





}