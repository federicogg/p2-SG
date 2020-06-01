
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
        this.puntos = 0;
        // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
        this.renderer = this.createRenderer(myCanvas);

        //gravedad
        this.setGravity(new THREE.Vector3(0, -100, 0));

        this.gui = this.createGUI();


        // this.axis = new THREE.AxesHelper (7);
        // this.add (this.axis);

        this.createPlayer();

        this.createGround(0);

        //this.createfondo(200);

        this.salida = new Salida();
        this.add(this.salida);



        this.createCamera();
        this.collidersHelices = [];
        this.collidersAros = [];
        this.collidersGemas = [];
        this.colliderObjetivos = [];
        this.colliderPinchos = [];

   
        this.helices = [];
        this.gemas = [];

        this.createObstaculos();
        this.createEscalera(4, 1);
        this.createLights();
        this.createPointLights();
        this.createSkyBox();

        //Booleanos;
        this.hayObjetivos = true;
        this.hayAros = true;
        this.hayHelices = true;
        this.hayPinchos = true;
        this.muerto = false;
        this.bonus = false;


        
    }


    createPointLights() {
        var light = new THREE.PointLight(0xff0000, 0.5, 100);
        light.position.set(-40, 10, -15);
        this.add(light);

        var light = new THREE.PointLight(0xff0000, 0.5, 100);
        light.position.set(-40, 10, 15);
        this.add(light);

        var light = new THREE.PointLight(0x17ff00, 0.5, 100);
        light.position.set(40, 10, -15);
        this.add(light);

        var light = new THREE.PointLight(0x17ff00, 0.5, 100);
        light.position.set(40, 10, 15);
        this.add(light);
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
        var texture = new THREE.TextureLoader().load('../imgs/escalera.png');
        var materialGround = new THREE.MeshPhongMaterial({ map: texture });
        var materialFis = new Physijs.createMaterial(materialGround, 0, 0);

        var geometry = new THREE.BoxGeometry(20, 2, 50);

        // var escalera = new THREE.Object3D();
        for (var i = 0; i < num; i++) {
            var platform = new Physijs.BoxMesh(geometry, materialFis, 0);
            platform.position.y += (i + 0.2) * 10;
            platform.position.x += (i * 20) + 70 * index;
            this.add(platform);
        }

        //this.add(escalera);

    }



    compruebaColision() {

        var originPoint = this.physicBox.position.clone();

        for (var vertex = 0; vertex < this.physicBox.geometry.vertices.length; vertex++) {
            var localVertex = this.physicBox.geometry.vertices[vertex].clone();
            var globalVertex = localVertex.applyMatrix4(this.physicBox.matrix);
            var directionVector = globalVertex.sub(this.physicBox.position);

            var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
            var collidersGemas = ray.intersectObjects(this.collidersGemas);
            var collidersAros = ray.intersectObjects(this.collidersAros);
            var colliderObjetivos = ray.intersectObjects(this.colliderObjetivos );
            var collidersHelices = ray.intersectObjects(this.collidersHelices);
            var colliderPinchos = ray.intersectObjects(this.colliderPinchos);

            if (collidersGemas.length > 0 && collidersGemas[0].distance < directionVector.length()) {
                console.log('GEMA');
            }

            if (collidersAros.length > 0 && collidersAros[0].distance < directionVector.length()) {
                console.log('ARO');
            }else{

            }
            if (colliderObjetivos.length > 0 && colliderObjetivos[0].distance < directionVector.length()) {
                console.log('Objetivo');
                if(this.hayObjetivos){
                    this.puntos += 10;
                    this.colliderObjetivos.shift();
                    this.hayObjetivos = false;
                    console.log(this.puntos);
                }
                

            }else{
                this.hayObjetivos= true;

            }

            if (collidersHelices.length > 0 && collidersHelices[0].distance < directionVector.length()) {
                console.log('helice');
                if(this.hayHelices){
                    this.collidersHelices.shift();
                    this.collidersHelices.shift();
                    this.hayHelices = false;
         
                }
                
                
              
            }else{
                this.hayHelices= true;
            }

            if (colliderPinchos.length > 0 && colliderPinchos[0].distance < directionVector.length()) {
                console.log('Pinchos');
                if(this.hayPinchos){
                    this.colliderPinchos.shift();
                    this.hayPinchos = false;
                    this.muerto = true;
                }
                
            }else{
               
                this.hayPinchos = true;
            }
        }


    }

    update() {

        requestAnimationFrame(() => this.update())

        this.physicBox.applyCentralImpulse(this.effect);
        //this.puntos += 0.1;
     

        for (var i = 0; i < this.helices.length; i++) {
            this.helices[i].update();
        }

        for (var i = 0; i < this.gemas.length; i++) {
            this.gemas[i].update();
        }


        this.cameraUpdate();
        this.updateSpotLight();

        this.renderer.render(this, this.getCamera());
        this.compruebaColision();

        this.simulate();
    }

    posicionarObjetivos(){
        var geometry = new THREE.BoxGeometry(1,8,8);
        var material = new THREE.MeshPhongMaterial({ color: 0xff0000 });

        this.ob1 = new THREE.Mesh(geometry,material);
        this.colliderObjetivos.push(this.ob1);
        this.ob1.scale.set(1,6,5);
        this.ob1.position.set(165,35,0);
        this.add(this.ob1);

        this.ob2 = this.ob1.clone();
        this.ob2.position.copy(this.ob1.position);
        this.ob2.position.x = this.ob2.position.x + 20;
        this.add(this.ob2);

    }
    posicionarHelices() {


        this.he1 = new helices();
        this.helices.push(this.he1);
        this.add(this.he1);
        this.collidersHelices.push(this.he1.h1);
        this.collidersHelices.push(this.he1.h2);

    }

    posicionarPinchos() {
        this.pincho = new Pinchos(6);
        this.colliderPinchos.push(this.pincho.sphere);
        this.pincho.position.x = -10;
        this.add(this.pincho);
        var pincho1 = new Pinchos(6);
        pincho1.rotation.y = 1.57;
        pincho1.position.set(150, 40, -10);
        this.colliderPinchos.push(pincho1);

        this.add(pincho1);

        pincho1 = new Pinchos(6);
        pincho1.rotation.y = 1.57;
        pincho1.position.set(150, 42, 20);
        this.colliderPinchos.push(pincho1.sphere);
        this.add(pincho1);


        pincho1 = new Pinchos(6);
        pincho1.rotation.y = 1.57;
        pincho1.position.set(300, 10, 10);
        this.colliderPinchos.push(pincho1.sphere);
        this.add(pincho1);
    }

    posicionarGemas() {
        var gema = new Gema();
        gema.position.set(270, 50, 0);
        this.add(gema);
        this.gemas.push(gema);
        this.collidersGemas.push(gema.transparentBox);

    }

    posicionarPlataformas() {


        var geometryGround = new THREE.BoxGeometry(40, 2, 50);


        var texture = new THREE.TextureLoader().load('../imgs/suelo.png');
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

    posicionarAros() {
        var aro = new Aro();
        aro.position.x = 400;
        aro.position.z = -4;
        aro.position.y = 20;
        this.add(aro);
        this.collidersAros.push(aro.transparentBox);
    }

    createObstaculos() {
        this.posicionarHelices();
        this.posicionarGemas();
        this.posicionarPlataformas();
        this.posicionarPinchos();
        this.posicionarAros();
        this.posicionarObjetivos();
        this.createGround(350);

    }

    createGround(offset) {

        var geometryGround = new THREE.BoxGeometry(200, 50, 50);

        var texture = new THREE.TextureLoader().load('../imgs/suelo.png');
        var materialGround = new THREE.MeshPhongMaterial({ map: texture });
        var materialFis = new Physijs.createMaterial(materialGround, 0, 0);


        var ground = new Physijs.BoxMesh(geometryGround, materialFis, 0);
        ground.position.y = -25;
        ground.position.x = offset;

        this.add(ground);
    }

    createSkyBox() {
        var geometry = new THREE.BoxGeometry(3000, 500, 1500);
        var texture1 = new THREE.TextureLoader().load('../imgs/skybox/1.png');
        var texture2 = new THREE.TextureLoader().load('../imgs/skybox/2.png');
        var texture3 = new THREE.TextureLoader().load('../imgs/skybox/3.png');
        var texture4 = new THREE.TextureLoader().load('../imgs/skybox/4.png');
        var texture5 = new THREE.TextureLoader().load('../imgs/skybox/5.png');
        var texture6 = new THREE.TextureLoader().load('../imgs/skybox/6.png');
        var materials = [];
        materials.push(new THREE.MeshBasicMaterial({ map: texture1, side: THREE.BackSide }));
        materials.push(new THREE.MeshBasicMaterial({ map: texture2, side: THREE.BackSide }));
        materials.push(new THREE.MeshBasicMaterial({ map: texture3, side: THREE.BackSide }));
        materials.push(new THREE.MeshBasicMaterial({ map: texture4, side: THREE.BackSide }));
        materials.push(new THREE.MeshBasicMaterial({ map: texture5, side: THREE.BackSide }));
        materials.push(new THREE.MeshBasicMaterial({ map: texture6, side: THREE.BackSide }));


        var skyBox = new THREE.Mesh(geometry, materials);
        skyBox.position.x = 500;
        this.add(skyBox);
    }


    createfondo(offset) {

        var geometryGround = new THREE.BoxGeometry(1000, 0.1, 100);
        var texture = new THREE.TextureLoader().load('../imgs/pared.png');

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

        if (this.guiControls.design) {
            this.camera.position.x = this.guiControls.x;
            this.camera.position.y = this.guiControls.y;
            this.camera.position.z += 100;

            var look = this.camera.position;
            look.z -= 100;

        } else {

              this.camera.position.x = this.physicBox.position.x;
              var vector3 = new THREE.Vector3(this.physicBox.position.x,this.physicBox.position.y,0 );
              var look = this.physicBox.position;
              this.camera.lookAt(vector3);
        }

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
        this.camera.position.y += 80;
        var look = this.physicBox.position;


        this.camera.lookAt(look);
        this.add(this.camera);

    }


    createGUI() {

        var gui = new dat.GUI();


        this.guiControls = new function() {
            this.design = false;
            this.x = 0.0;
            this.y = 92.0;
        }


        var folder = gui.addFolder('Cámara');


        folder.add(this.guiControls, 'design').name('Desarrollo: ');
        folder.add(this.guiControls, 'x', 0.0, 1000.0, 0.1).name('X');
        folder.add(this.guiControls, 'y', 92.0, 1000.0, 0.1).name('Y');


        return gui;
    }

    updateSpotLight() {
        this.spotLight.position.copy(this.physicBox.position);
        this.spotLight.position.y += 40;
        this.spotLight.position.x += 50;

    }

    createLights() {

        var ambientLight = new THREE.AmbientLight(0xccddee, 0.1);
        // La añadimos a la escena
        this.add(ambientLight);

        this.spotLight = new THREE.SpotLight(0xffffff, 0.35);
        this.spotLight.position.copy(this.physicBox.position);
        this.spotLight.position.y += 100;
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
                this.physicBox.position.z += 2;
                this.physicBox.__dirtyPosition = true;
                break;
            case MyScene.ARRIBA:
                this.physicBox.position.z -= 2;
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