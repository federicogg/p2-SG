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
        this.setGravity(new THREE.Vector3(0, -100, 0));

        this.gui = this.createGUI();
        this.createLights();


        // this.axis = new THREE.AxesHelper (7);
        // this.add (this.axis);

        this.createPlayer();

        this.createGround(0);

        this.createfondo(0);

        this.salida = new Salida();
        this.add(this.salida);



        this.createCamera();
        this.collidersHelices = [];
        this.collidersAros = [];
        this.collidersGemas = [];

        this.helices = [];
        this.pinchos = [];
        this.gemas = [];

        //this.createColliders();

        this.createObstaculos();
        this.createEscalera(4, 1);

    }

    createPlayer() {

        var materialPlayer = new THREE.MeshPhongMaterial({ color: 0xff0000 });

        var materialFis = new Physijs.createMaterial(materialPlayer, 0, 0);

        var geometry = new THREE.BoxGeometry(6, 6, 6);

        this.physicBox = new Physijs.BoxMesh(geometry, materialFis, 25);
        this.physicBox.position.y = 2;
        this.physicBox.position.x = -70;

        var fuerza = 5;
        var offset = new THREE.Vector3(1, 0, 0);
        this.effect = offset.normalize().multiplyScalar(fuerza);


        this.physicBox.radio = 4;
        this.add(this.physicBox);

    }


    createEscalera(num, index) {
        var texture = new THREE.TextureLoader().load('../imgs/wood.jpg');
        var materialGround = new THREE.MeshPhongMaterial({ map: texture });
        var materialFis = new Physijs.createMaterial(materialGround, 0, 0);

        var geometry = new THREE.BoxGeometry(20, 2, 50);

        // var escalera = new THREE.Object3D();
        for (var i = 0; i < num; i++) {
            var physicBox = new Physijs.BoxMesh(geometry, materialFis, 0);
            physicBox.position.y += (i + 0.2) * 10;
            physicBox.position.x += (i * 20) + 70 * index;
            this.add(physicBox);
        }

        //this.add(escalera);

    }

    createColliders() {
        this.collidersList = [];
        this.collidersList.push(this.aro.transparentBox);
        // this.collidersList.push(this.helices.h1);
        // this.collidersList.push(this.helices.h2);
    }


    compruebaColision() {

        var originPoint = this.physicBox.position.clone();

        for (var vertex = 0; vertex < this.physicBox.geometry.vertices.length; vertex++) {
            var localVertex = this.physicBox.geometry.vertices[vertex].clone();
            var globalVertex = localVertex.applyMatrix4(this.physicBox.matrix);
            var directionVector = globalVertex.sub(this.physicBox.position);

            var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
            var collisionResults = ray.intersectObjects(this.collidersList);
            if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
                console.log('Colision');
            }
        }


    }

    update() {

        requestAnimationFrame(() => this.update())
        this.spotLight.intensity = this.guiControls.lightIntensity;

        this.physicBox.applyCentralImpulse(this.effect);

        for (var i = 0; i < this.helices.length; i++) {
            this.helices[i].update();
        }

        for (var i = 0; i < this.gemas.length; i++) {
            this.gemas[i].update();
        }


        this.cameraUpdate();

        this.renderer.render(this, this.getCamera());
        this.compruebaColision();

        this.simulate();
    }

    posicionarHelices() {


        this.he1 = new helices();
        this.helices.push(this.he1);
        this.add(this.he1);
        this.collidersHelices.push(this.he1.h1);
        this.collidersHelices.push(this.he1.h2);

    }
    posicionarPinchos() {
        var pincho1 = new Pinchos(6);
        pincho1.rotation.y = 1.57;
        pincho1.position.set(150, 40, -10);
        this.pinchos.push(pincho1);

        this.add(pincho1);

        pincho1 = new Pinchos(6);
        pincho1.rotation.y = 1.57;
        pincho1.position.set(150, 42, 20);
        this.pinchos.push(pincho1);
        this.add(pincho1);


        pincho1 = new Pinchos(6);
        pincho1.rotation.y = 1.57;
        pincho1.position.set(300, 10, 10);
        this.pinchos.push(pincho1);
        this.add(pincho1);
    }

    posicionarGemas() {
        var gema = new Gema();
        gema.position.set(270, 50, 0);
        this.add(gema);

        this.gemas.push(gema);

    }

    posicionarPlataformas() {

        // La geometría es una caja con muy poca altura
        var geometryGround = new THREE.BoxGeometry(40, 2, 50);


        var texture = new THREE.TextureLoader().load('../imgs/wood.jpg');
        var materialGround = new THREE.MeshPhongMaterial({ map: texture });
        var materialFis = new Physijs.createMaterial(materialGround, 0, 0.1);

        var p1 = new Physijs.BoxMesh(geometryGround, materialFis, 0);
        p1.position.set(150, 32, 0);
        this.add(p1);


        var p2 = new Physijs.BoxMesh(geometryGround, materialFis, 0);
        p2.scale.x = 2;
        p2.position.set(220, 32, 0);
        this.add(p2);

    }

    createObstaculos() {
        this.posicionarHelices();
        this.posicionarGemas();
        this.posicionarPlataformas();
        this.posicionarPinchos();
        this.createGround(350);

    }

    createGround(offset) {
        // El suelo es un Mesh, necesita una geometría y un material.

        // La geometría es una caja con muy poca altura
        var geometryGround = new THREE.BoxGeometry(200, 50, 50);

        // El material se hará con una textura de madera
        var texture = new THREE.TextureLoader().load('../imgs/wood.jpg');
        var materialGround = new THREE.MeshPhongMaterial({ map: texture });
        var materialFis = new Physijs.createMaterial(materialGround, 0, 0);

        // Ya se puede construir el Mesh
        var ground = new Physijs.BoxMesh(geometryGround, materialFis, 0);
        ground.position.y = -25;
        ground.position.x = offset;

        this.add(ground);
    }


    createfondo(offset) {

        var geometryGround = new THREE.BoxGeometry(400, 0.1, 100);
        var texture = new THREE.TextureLoader().load('../imgs/ladrillo-difuso.png');

        var materialGround = new THREE.MeshPhongMaterial({ map: texture });
        var materialFis = new Physijs.createMaterial(materialGround, 0, 0);
        var fondo = new Physijs.BoxMesh(geometryGround, materialFis, 0);

        fondo.rotation.x = 1.5708;
        fondo.position.z = -23;
        fondo.position.y = 24;
        fondo.position.x = offset;

        fondo.addEventListener('collision',
            function(o, v, r, n) {
                // Los figuras colisionables que colisonen con las paredes se les pone otra vez en modo alambre
                // console.log(r);
                o.position.z += 3;
                o.__dirtyPosition = true;

            }
        );

        this.add(fondo);
    }

    cameraUpdate() {
        this.camera.position.copy(this.physicBox.position);



        this.camera.position.z += 100;
        this.camera.position.x += 20;
        this.camera.position.y += 20;

        var look = this.physicBox.position;
        this.camera.lookAt(look);
    }



    createCamera() {

        // Para crear una cámara le indicamos
        //   El ángulo del campo de visión en grados sexagesimales
        //   La razón de aspecto ancho/alto
        //   Los planos de recorte cercano y lejano
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);


        //Camara de juego
        this.camera.position.copy(this.physicBox.position);
        this.camera.position.z += 100;
        this.camera.position.x += 20;
        var look = this.physicBox.position;

        //Camara de desarrollo
        // this.camera.position.set(300, 20, 200);
        // var look = this.camera.position;
        // look.z -= 100;




        this.camera.lookAt(look);
        this.add(this.camera);

    }


    createGUI() {

        var gui = new dat.GUI();


        this.guiControls = new function() {
            this.lightIntensity = 0.5;
            this.axisOnOff = true;
        }


        var folder = gui.addFolder('Luz y Ejes');


        folder.add(this.guiControls, 'lightIntensity', 0, 1, 0.1).name('Intensidad de la Luz : ');


        return gui;
    }

    createLights() {

        var ambientLight = new THREE.AmbientLight(0xccddee, 0.35);
        // La añadimos a la escena
        this.add(ambientLight);

        this.spotLight = new THREE.SpotLight(0xffffff, this.guiControls.lightIntensity);
        this.spotLight.position.set(100, 100, 40);
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
                this.physicBox.position.z += 9;
                this.physicBox.__dirtyPosition = true;
                break;
            case MyScene.ARRIBA:
                this.physicBox.position.z -= 9;
                this.physicBox.__dirtyPosition = true;
                break;
            case MyScene.IZQUIERDA:
                var fuerza = 50;
                var offset = new THREE.Vector3(1, 0, 0);
                var effect = offset.normalize().multiplyScalar(fuerza);
                this.physicBox.applyCentralImpulse(effect.negate());
                break;
            case MyScene.DERECHA:
                var fuerza = 50;
                var offset = new THREE.Vector3(1, 0, 0);
                var effect = offset.normalize().multiplyScalar(fuerza);
                this.physicBox.applyCentralImpulse(effect);
                break;
        }

    }

    saltar(event) {

        var tecla = event.which || event.KeyCode;

        if (tecla == MyScene.SALTAR) {
            // var fuerza = 20;
            // var offset = new THREE.Vector3(0, 0, 1);
            // var effect = offset.normalize().multiplyScalar(fuerza);
            // this.physicBox.applyCentralImpulse(effect);
            this.saltando = true;
            this.physicBox.position.y += 20;
            this.physicBox.__dirtyPosition = true;
            this.saltando = false;
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
    window.addEventListener("keyup", (event) => scene.saltar(event));
    // Que no se nos olvide, la primera visualización.

    scene.update();
});