//import { ObjectLoader, SrcAlphaSaturateFactor } from "three";



class MyScene extends Physijs.Scene {
    constructor(myCanvas) {

        //Estados
        MyScene.SALTAR = 32;
        MyScene.ABAJO = 40;
        MyScene.ARRIBA = 38;
        MyScene.IZQUIERDA = 37;
        MyScene.DERECHA = 39;

        // El gestor de hebras
        Physijs.scripts.worker = './physijs/physijs_worker.js'

        // El motor de física de bajo nivel, en el cual se apoya Physijs
        Physijs.scripts.ammo = './ammo.js'
        super();

        // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
        this.renderer = this.createRenderer(myCanvas);

        //gravedad
        this.setGravity(new THREE.Vector3(0, -1000, 0));

        this.gui = this.createGUI();
        this.createLights();
        this.createCamera();


        // this.axis = new THREE.AxesHelper (7);
        // this.add (this.axis);

        var materialPlayer = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        var materialObstacle = new THREE.MeshPhongMaterial({ color: 0x000000 });
        var materialFis = new Physijs.createMaterial(materialPlayer, 0.3, 0.2);

        var geometry = new THREE.BoxGeometry(4, 4, 4);

        this.physicBox = new Physijs.BoxMesh(geometry, materialFis, 25);
        this.physicCaja = new Physijs.BoxMesh(geometry, materialObstacle, 0);
        this.physicCaja.position.x = 7;
        this.physicBox.position.y = 4;
        this.physicBox.position.x = -15;

        var fuerza = 10;
        var offset = new THREE.Vector3(1, 0, 0);
        this.effect = offset.normalize().multiplyScalar(fuerza);
        this.physicBox.applyCentralImpulse(this.effect);

        //this.caja = new THREE.Mesh(geometry,material);
        //this.caja.position.x = 7;

        this.velocidad = new THREE.Vector3(10, 0, 0);
        this.physicBox.setLinearVelocity(this.velocidad);

        this.octree = new THREE.Octree({
            undeferred: false,
            depthMax: Infinity,
            objectsThreshold: 4,
            overlapPct: 0.2
        });

        this.createGround();

        this.physicBox.radio = 4;
        this.physicCaja.radio = 4;

        this.fondo = this.createfondo();
        this.add(this.fondo);

        this.salida = new Salida();
        this.add(this.salida);

        this.add(this.physicBox);
        this.add(this.physicCaja);

        this.aro = new Aro();
        this.aro.position.y = 2;
        this.aro.position.x = 40;
        this.add(this.aro);

        this.pinchos = new Pinchos(10);
        this.add(this.pinchos);

        this.createOctree();


    }

    createOctree() {
        this.octree.add(this.physicBox, { useFaces: true });
        this.octree.add(this.physicCaja, { useFaces: true });
    }

    compruebaColision() {

        this.octreeObjects = this.octree.search(this.physicBox.position, 0.5, true);
        var cuadradoSumaradios;
        var cuadradoDistanciaEuclidea;

        for (var i = 0; i < this.octreeObjects.length; i++) {
            cuadradoSumaradios = this.physicBox.radio + this.octreeObjects[i].object.radio;
            cuadradoSumaradios *= cuadradoSumaradios;
            console.log(this.octreeObjects[i]);

            cuadradoDistanciaEuclidea = this.physicBox.position.distanceToSquared(this.octreeObjects[i].object.position);
            if (cuadradoDistanciaEuclidea < cuadradoSumaradios) {
                console.log("Colision");
            }
        }
        //if (this.octreeObjects.length > 1) {
        //this.octreeObjects[1].object.material.color.setHex(0x3eff00);
        //console.log(this.octreeObjects[1].object.material.color);
        //   }


    }

    update() {

        requestAnimationFrame(() => this.update())
        this.spotLight.intensity = this.guiControls.lightIntensity;

        this.physicBox.applyCentralImpulse(this.effect);
        this.aro.update();
        //this.cameraControl.update();
        //this.physicBox.setLinearVelocity(this.velocidad);
        this.renderer.render(this, this.getCamera());
        this.compruebaColision();
        this.octree.update();
        this.simulate();
    }


    createGround() {
        // El suelo es un Mesh, necesita una geometría y un material.

        // La geometría es una caja con muy poca altura
        var geometryGround = new THREE.BoxGeometry(200, 50, 50);

        // El material se hará con una textura de madera
        var texture = new THREE.TextureLoader().load('../imgs/wood.jpg');
        var materialGround = new THREE.MeshPhongMaterial({ map: texture });
        var materialFis = new Physijs.createMaterial(materialGround, 0, 0.1);

        // Ya se puede construir el Mesh
        var ground = new Physijs.BoxMesh(geometryGround, materialFis, 0);
        ground.position.y = -25;

        this.add(ground);
    }


    createfondo() {

        var geometryGround = new THREE.BoxGeometry(400, 0.1, 100);
        var texture = new THREE.TextureLoader().load('../imgs/ladrillo-difuso.png');

        var materialGround = new THREE.MeshPhongMaterial({ map: texture });
        var materialFis = new Physijs.createMaterial(materialGround, 0, 0.1);
        var fondo = new Physijs.BoxMesh(geometryGround, materialFis, 0);

        fondo.rotation.x = 1.5708;
        fondo.position.z = -23;
        fondo.position.y = 24;
        return fondo;
    }



    createCamera() {

        // Para crear una cámara le indicamos
        //   El ángulo del campo de visión en grados sexagesimales
        //   La razón de aspecto ancho/alto
        //   Los planos de recorte cercano y lejano
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        // También se indica dónde se coloca
        this.camera.position.set(-10, 70, 120);
        // Y hacia dónde mira
        var look = new THREE.Vector3(0, 0, 0);
        this.camera.lookAt(look);
        this.add(this.camera);

        // Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
        // this.cameraControl = new THREE.TrackballControls (this.camera, this.renderer.domElement);
        // Se configuran las velocidades de los movimientos
        //this.cameraControl.rotateSpeed = 5;
        //this.cameraControl.zoomSpeed = -2;
        // this.cameraControl.panSpeed = 0.5;
        // Debe orbitar con respecto al punto de mira de la cámara
        // this.cameraControl.target = look;
    }


    createGUI() {
        // Se crea la interfaz gráfica de usuario
        var gui = new dat.GUI();

        // La escena le va a añadir sus propios controles. 
        // Se definen mediante una   new function()
        // En este caso la intensidad de la luz y si se muestran o no los ejes
        this.guiControls = new function() {
            // En el contexto de una función   this   alude a la función
            this.lightIntensity = 0.5;
            this.axisOnOff = true;
        }

        // Se crea una sección para los controles de esta clase
        var folder = gui.addFolder('Luz y Ejes');

        // Se le añade un control para la intensidad de la luz
        folder.add(this.guiControls, 'lightIntensity', 0, 1, 0.1).name('Intensidad de la Luz : ');


        return gui;
    }

    createLights() {

        var ambientLight = new THREE.AmbientLight(0xccddee, 0.35);
        // La añadimos a la escena
        this.add(ambientLight);

        this.spotLight = new THREE.SpotLight(0xffffff, this.guiControls.lightIntensity);
        this.spotLight.position.set(60, 60, 40);
        this.add(this.spotLight);
    }

    createRenderer(myCanvas) {
        // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.

        // Se instancia un Renderer   WebGL
        var renderer = new THREE.WebGLRenderer();

        // Se establece un color de fondo en las imágenes que genera el render
        renderer.setClearColor(new THREE.Color(0xB1A9BE), 1.0);

        // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
        renderer.setSize(window.innerWidth, window.innerHeight);

        // La visualización se muestra en el lienzo recibido
        $(myCanvas).append(renderer.domElement);

        return renderer;
    }

    getCamera() {
        // En principio se devuelve la única cámara que tenemos
        // Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
        return this.camera;
    }

    eventosTeclado(event) {
        var tecla = event.which || event.KeyCode;

        switch (tecla) {
            case MyScene.ABAJO:
                this.physicBox.position.z += 1;
                this.physicBox.__dirtyPosition = true;
                break;
            case MyScene.ARRIBA:
                this.physicBox.position.z -= 1;
                this.physicBox.__dirtyPosition = true;
                break;
            case MyScene.IZQUIERDA:
                var fuerza = 70;
                var offset = new THREE.Vector3(1, 0, 0);
                var effect = offset.normalize().multiplyScalar(fuerza);
                this.physicBox.applyCentralImpulse(effect.negate());
                break;
            case MyScene.DERECHA:
                var fuerza = 10;
                var offset = new THREE.Vector3(1, 0, 0);
                var effect = offset.normalize().multiplyScalar(10);
                this.physicBox.applyCentralImpulse(effect);
                break;
        }

    }

    saltar(event) {

        var tecla = event.which || event.KeyCode;

        if (tecla == MyScene.SALTAR) {
            // var fuerza = 20;
            // var offset = new THREE.Vector3(0, 1, 0);
            // var effect = offset.normalize().multiplyScalar(fuerza);
            // this.physicBox.applyCentralImpulse(effect);
            this.physicBox.position.y += 10;
            this.physicBox.__dirtyPosition = true;
        }

    }

    setCameraAspect(ratio) {
        // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
        // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
        this.camera.aspect = ratio;
        // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
        this.camera.updateProjectionMatrix();
    }

    onWindowResize() {
        // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
        // Hay que actualizar el ratio de aspecto de la cámara
        this.setCameraAspect(window.innerWidth / window.innerHeight);

        // Y también el tamaño del renderizador
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

}

/// La función   main
$(function() {

    // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
    var scene = new MyScene("#WebGL-output");

    // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
    window.addEventListener("resize", () => scene.onWindowResize());
    window.addEventListener("keydown", (event) => scene.eventosTeclado(event));
    window.addEventListener("keypress", (event) => scene.saltar(event));
    // Que no se nos olvide, la primera visualización.
    scene.update();
});