class Gema extends THREE.Object3D {

    constructor(animacion) {
        super();
        var material = new THREE.MeshBasicMaterial({ color: 0xff2e00 });
        this.crearRombo(material);
        this.createTransparentBox();
        this.ani = animacion;
        if (animacion) {
            this.animacion();
        }

    }

    update() {
        this.rotation.y += 0.02;
        if (this.ani) {
            TWEEN.update();
        }
    }

    createTransparentBox() {
        var material = new THREE.MeshPhongMaterial({ visible: false });
        var geometry = new THREE.BoxGeometry(5, 15, 15);


        this.transparentBox = new THREE.Mesh(geometry, material);



        this.transparentBox.position.copy(this.mesh.position);
        this.transparentBox.position.y += 5;

        this.add(this.transparentBox);
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


        this.mesh = new THREE.Mesh(geometry, mat);
        this.mesh.scale.set(0.75, 0.75, 0.75);



        this.add(this.mesh);
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



    animacion() {
        this.spline = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 10, 0),
            new THREE.Vector3(5, 3, 20),
            new THREE.Vector3(20, 10, 0),
            new THREE.Vector3(0, 15, 0),
            new THREE.Vector3(-10, 5, 5),
            new THREE.Vector3(-20, 4, 5),
            new THREE.Vector3(-25, 8, 3),
            new THREE.Vector3(-10, 5, 5),
            new THREE.Vector3(0, 10, 0)


        ]);

        var geometryLine = new THREE.Geometry();
        var mat = new THREE.MeshPhongMaterial({ visible: false });
        geometryLine.vertices = this.spline.getPoints(100);
        var visible = new THREE.Line(geometryLine, mat);
        this.add(visible);
        var that = this;
        var posinInicio = { x: 0.0 };
        var posFin = { x: 0.5 };
        var aux;
        var animacion = new TWEEN.Tween(posinInicio).to(posFin, 4000)
            .easing(TWEEN.Easing.Linear.None)
            .repeat(0)
            .yoyo(false)
            .onUpdate(function() {
                aux = posinInicio.x;
                var posicion = that.spline.getPointAt(aux);
                that.mesh.position.copy(posicion);
                var tangente = that.spline.getTangentAt(aux);
                posicion.add(tangente);
                that.mesh.lookAt(posicion);
            });

        var ini = { x: 0.5 };
        var fin = { x: 1.0 };
        var aux2;
        var animacion2 = new TWEEN.Tween(ini).to(fin, 8000)
            .easing(TWEEN.Easing.Linear.None)
            .repeat(0)
            .yoyo(false)
            .onUpdate(function() {
                aux2 = ini.x;
                var posicion = that.spline.getPointAt(aux2);
                that.mesh.position.copy(posicion);
                var tangente = that.spline.getTangentAt(aux2);
                posicion.add(tangente);
                that.mesh.lookAt(posicion);
            });

        animacion.chain(animacion2);
        animacion2.chain(animacion);
        animacion.start();
    }



}