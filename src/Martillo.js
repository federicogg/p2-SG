class Martillo extends THREE.Object3D {
    constructor() {
        super();

        this.createHead();
        this.createHandle();
        this.createTweens();



    }

    createHead() {

        var geometry = new THREE.CylinderGeometry(5, 5, 10, 15);
        var material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        var materialFis = new Physijs.createMaterial(material, 0, 0);
        var mesh = new Physijs.CylinderMesh(geometry, materialFis);

        mesh.addEventListener('collision',
            function(o, v, r, n) {

                MyScene.MUERTO = 1;
            }

        );

        mesh.position.y = 30;
        mesh.rotation.z += 1.65;

        this.add(mesh);
    }

    createHandle() {
        var geometry = new THREE.CylinderGeometry(2, 2, 30, 32);
        var texture = new THREE.TextureLoader().load('../imgs/wood.jpg');
        var material = new THREE.MeshBasicMaterial({ map: texture });
        var mesh = new THREE.Mesh(geometry, material);

        mesh.position.y = 15;

        this.add(mesh);
    }

    createTweens() {

        var origen = { x: 0.0 };
        this.parametro = 0;
        var destino = { x: 1.4 };
        this.loop1 = 2000;
        this.movimiento = new TWEEN.Tween(origen).to(destino, this.loop1);
        this.movimiento.easing(TWEEN.Easing.Quadratic.InOut);

        var that = this;

        this.movimiento.onUpdate(function() {
            that.rotation.z = origen.x;
        });

        this.loop2 = 2000;
        var origen2 = { x: 1.4 };
        var destino2 = { x: 0.0 };
        this.movimiento2 = new TWEEN.Tween(origen2).to(destino2, this.loop2);
        this.movimiento2.easing(TWEEN.Easing.Quadratic.InOut);

        this.movimiento2.onUpdate(function() {
            that.rotation.z = origen2.x;
        });

        this.movimiento.chain(this.movimiento2);
        this.movimiento2.chain(this.movimiento);
        this.movimiento2.start();
    }

}