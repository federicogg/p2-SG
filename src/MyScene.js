class MyScene extends Physijs.Scene {
    constructor(myCanvas) {

        //Estados
        MyScene.SALTAR = 32;
        MyScene.ABAJO = 40;
        MyScene.ARRIBA = 38;
        MyScene.IZQUIERDA = 37;
        MyScene.DERECHA = 39;
        MyScene.SUELO = 1;
        MyScene.ENBONUS = 0;
        MyScene.INICIO = 1;
        MyScene.MUERTO = 0;

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


        this.axis = new THREE.AxesHelper(7);
        this.add(this.axis);

        this.createPlayer();

        this.createGround(0);


        this.salida = new Salida();
        this.add(this.salida);



        this.createCamera();
        this.collidersHelices = [];
        this.collidersAros = [];
        this.collidersGemas = [];
        this.colliderObjetivos = [];
        this.colliderPinchos = [];
        this.colliderSkyBox = [];


        this.helices = [];
        this.gemas = [];
        this.aros = [];
        this.martillos = [];

        this.createObstaculos();
        this.createEscalera(4, 1);
        this.createLights();
        this.createPointLights();
        this.createSkyBox();

        //Contador
        this.contador = 0;

        //Booleanos;
        this.hayObjetivos = true;
        this.hayAros = true;
        this.hayHelices = true;
        this.hayPinchos = true;
        this.muerto = false;
        this.bonus = false;


        //Fuerzas

        this.fuerzArriba = 0;
        this.fuerzaAbajo = 0;


    }


    createPointLights() {
        var light = new THREE.PointLight(0xff0000, 0.5, 100);
        light.position.set(-40, 10, -15);
        this.add(light);

        var light = new THREE.PointLight(0xff0000, 0.5, 100);
        light.position.set(-40, 10, 15);
        this.add(light);

        var light = new THREE.PointLight(0xff0000, 0.5, 100);
        light.position.set(40, 10, -15);
        this.add(light);

        var light = new THREE.PointLight(0xff0000, 0.5, 100);
        light.position.set(40, 10, 15);
        this.add(light);


        var light = new THREE.PointLight(0x0027ff, 0.5, 100);
        light.position.set(430, 10, 15);
        this.add(light);

        var light = new THREE.PointLight(0x0027ff, 0.5, 100);
        light.position.set(430, 10, -15);
        this.add(light);

        var light = new THREE.PointLight(0x0027ff, 0.5, 100);
        light.position.set(270, 10, 15);
        this.add(light);

        var light = new THREE.PointLight(0x0027ff, 0.5, 100);
        light.position.set(270, 10, -15);
        this.add(light);

        var light = new THREE.PointLight(0xf7ff00, 0.5, 100);
        light.position.set(520, 10, -15);
        this.add(light);

        var light = new THREE.PointLight(0xf7ff00, 0.5, 100);
        light.position.set(520, 10, 15);
        this.add(light);

        var light = new THREE.PointLight(0xf7ff00, 0.5, 100);
        light.position.set(670, 10, -15);
        this.add(light);

        var light = new THREE.PointLight(0xf7ff00, 0.5, 100);
        light.position.set(670, 10, 15);
        this.add(light);
    }

    createPlayer() {

        var materialPlayer = new THREE.MeshPhongMaterial({ color: 0xff0000 });

        var materialFis = new Physijs.createMaterial(materialPlayer, 0, 0);

        var geometry = new THREE.BoxGeometry(6, 6, 6);

        this.physicBox = new Physijs.BoxMesh(geometry, materialFis, 25);
        this.physicBox.position.y = 2;
        this.physicBox.position.x = -70;

        var fuerza = 3;
        var offset = new THREE.Vector3(1, 0, 0);
        this.effect = offset.normalize().multiplyScalar(fuerza);


        this.physicBox.radio = 4;
        this.add(this.physicBox);

        this.antiguaPos = this.physicBox.position.x;
     


    }

    incrementaPuntos(pts) {
        this.puntos += pts;
        document.getElementById('panel').innerHTML = "<h2>Score: " + this.puntos + "</h2>";
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
            platform.addEventListener('collision',
                function(o, v, r, n) {

                    MyScene.SUELO = 1;
                }

            );
            this.add(platform);
        }

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
            var colliderObjetivos = ray.intersectObjects(this.colliderObjetivos);
            var collidersHelices = ray.intersectObjects(this.collidersHelices);
            var colliderPinchos = ray.intersectObjects(this.colliderPinchos);
            var colliderSkyBox = ray.intersectObjects(this.colliderSkyBox);
            if (collidersGemas.length > 0 && collidersGemas[0].distance < directionVector.length()) {
                console.log('GEMA');
                var index = this.collidersGemas.indexOf(collidersGemas[0].object);
                if (index != -1) {
                    this.collidersGemas.splice(index, 1);
                    this.remove(this.gemas[index]);
                    this.gemas.splice(index, 1);

                }
                MyScene.ENBONUS = 1;

            }

            if (collidersAros.length > 0 && collidersAros[0].distance < directionVector.length()) {
                console.log('ARO');
                this.incrementaPuntos(30);
                var index = this.collidersAros.indexOf(collidersAros[0].object);
                if (index != -1) {
                    //Borramos el aro de la lista de colliders y de la escena
                    this.collidersAros.splice(index, 1);
                    this.remove(this.aros[index]);
                    this.aros.splice(index, 1);
                }

            } else {

            }
            if (colliderObjetivos.length > 0 && colliderObjetivos[0].distance < directionVector.length()) {
                console.log('Objetivo');
                if (this.hayObjetivos) {

                    this.colliderObjetivos.shift();
                    this.incrementaPuntos(10);
                    this.hayObjetivos = false;
                    console.log(this.puntos);
                }


            } else {
                this.hayObjetivos = true;

            }

            if (collidersHelices.length > 0 && collidersHelices[0].distance < directionVector.length() && !MyScene.ENBONUS) {
                console.log('Helices');
                if (this.hayHelices) {
                    MyScene.MUERTO = 1;
                    this.hayHelices = false;

                }



            } else {
                this.hayHelices = true;
            }

            if (colliderPinchos.length > 0 && colliderPinchos[0].distance < directionVector.length() && !MyScene.ENBONUS) {
                console.log('Pinchos');
                if (this.hayPinchos) {
                    this.hayPinchos = false;
                    MyScene.MUERTO = 1;
                }

            } else {

                this.hayPinchos = true;
            }

            if (colliderSkyBox.length > 0 && colliderSkyBox[0].distance < directionVector.length()) {
            
                    MyScene.MUERTO = 1;
                

            }

            
        }


    }

    paraElBonus() {
        MyScene.ENBONUS = 0;
        this.contador = 0;
        document.getElementById('bonus').innerHTML = "<h2>Inmunidad: OFF </h2>"

    }

    incrementarTiempo() {
        this.contador += 1;
        var tiempo = (7.00) - this.contador / 100;
        document.getElementById('bonus').innerHTML = "<h2>Inmunidad: " + tiempo.toFixed(2) + "s</h2>"
        if (this.contador == 700) {
            this.paraElBonus();
        }

        console.log(this.contador);
    }

    reiniciaJuego() {

        var fin = document.getElementById('fin');
        var score = document.getElementById('panel');

        var d = document.createElement('h2');
        d.innerText = "GAME OVER";
        fin.appendChild(d);

        var c = document.createElement('h2');
        c.innerText = score.innerText;
        d.appendChild(c);

        var e = document.createElement('h2');
        e.innerText = "Pulsa Espacio para reiniciar el juego";
        c.appendChild(e);

        this.remove(this.physicBox);

    }


    update() {
        if (!MyScene.MUERTO) {
            requestAnimationFrame(() => this.update());
        }


        if (MyScene.MUERTO) {
            document.getElementById('audio').pause();
            this.reiniciaJuego()
        } else {
            if (!MyScene.INICIO) {
                this.physicBox.applyCentralImpulse(this.effect);
            }
        }


        if (MyScene.ENBONUS) {
            this.incrementarTiempo();
        }

        for (var i = 0; i < this.helices.length; i++) {
            this.helices[i].update();
        }

        for (var i = 0; i < this.gemas.length; i++) {
            this.gemas[i].update();
        }

        this.barraupdate();
        this.cameraUpdate();
        this.updateSpotLight();

        this.renderer.render(this, this.getCamera());
        this.compruebaColision();

        this.simulate();
        TWEEN.update();

    }

    barraupdate(){
    

    }
    posicionarObjetivos() {
        var geometry = new THREE.BoxGeometry(1, 8, 8);
        var material = new THREE.MeshPhongMaterial({ color: 0xff0000 });

        this.ob1 = new THREE.Mesh(geometry, material);
        this.colliderObjetivos.push(this.ob1);
        this.ob1.scale.set(1, 6, 5);
        this.ob1.position.set(165, 35, 0);
        this.add(this.ob1);

        this.ob2 = this.ob1.clone();
        this.ob2.position.copy(this.ob1.position);
        this.ob2.position.x = this.ob2.position.x + 20;
        this.colliderObjetivos.push(this.ob2)
        this.add(this.ob2);


        var ob3 = this.ob2.clone();
        ob3.position.copy(this.ob2.position);
        ob3.position.x += 70;
        this.colliderObjetivos.push(ob3);
        this.add(ob3);

        var ob4 = ob3.clone();
        ob4.position.copy(ob3.position);
        ob4.position.x +=180;
        ob4.position.y -= 20;
        this.colliderObjetivos.push(ob4);
        this.add(ob4);

        var ob5 = ob4.clone();
        ob5.position.copy(ob4.position);
        ob5.position.x +=70;
        
        this.colliderObjetivos.push(ob5);
        this.add(ob5);

        var ob6 = ob5.clone();
        ob6.position.copy(ob5.position);
        ob6.position.x +=160;
        
        this.colliderObjetivos.push(ob6);
        this.add(ob6);
        
        
        

    }

    posicionarHelices() {


        this.he1 = new helices();
        this.helices.push(this.he1);
        this.add(this.he1);
        this.collidersHelices.push(this.he1.h1);
        this.collidersHelices.push(this.he1.h2);

        var he2 = this.he1.clone();
        he2.position.copy(this.he1.position);
        he2.position.x += 220;
        he2.position.y += 40;
        this.helices.push(he2);
        this.collidersHelices.push(he2.h1);
        this.collidersHelices.push(he2.h2);
        this.add(he2);

        var he3 = he2.clone();
        he3.position.copy(he2.position);
        he3.position.x += 340;
        he3.position.y -= 40;
        he3.position.z += 15;
        this.helices.push(he3);
        this.collidersHelices.push(he3.h1);
        this.collidersHelices.push(he3.h2);
        this.add(he3);

        var he4 = he3.clone();
        he4.position.copy(he3.position);
        he4.position.x += 40;
        he4.position.z -= 30;
        this.helices.push(he4);
        this.collidersHelices.push(he4.h1);
        this.collidersHelices.push(he4.h2);
        this.add(he4);



    }

    posicionarPinchos() {
        // this.pincho = new Pinchos(6);
        // this.colliderPinchos.push(this.pincho.sphere);
        // this.pincho.position.x = -10;
        // this.add(this.pincho);

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


        var pincho2 = pincho1.clone();
        pincho2.position.copy(pincho1.position);
        pincho2.position.x += 120;
        pincho2.position.z -= 20;
        this.colliderPinchos.push(pincho2.sphere);
        this.add(pincho2);
    }

    posicionarGemas() {
        var gema = new Gema();
        gema.position.set(270, 50, 0);
        this.add(gema);
        this.gemas.push(gema);
        this.collidersGemas.push(gema.transparentBox);

        var gema = new Gema();
        gema.position.set(470, 13, 13);
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

        // var p3 = new Physijs.BoxMesh(geometryGround, materialFis, 0);
        // p3.scale.x = 2;
        // p3.position.set(240, 32, 0);
        // this.add(p3);

        p1.addEventListener('collision',
            function(o, v, r, n) {
                MyScene.SUELO = 1;
            }

        );
        p2.addEventListener('collision',
            function(o, v, r, n) {
                MyScene.SUELO = 1;
            }

        );

        // p3.addEventListener('collision',
        //     function(o, v, r, n) {
        //         MyScene.SUELO = 1;
        //     }

        // );

    }

    posicionarAros() {
        var aro = new Aro();
        aro.position.x = 370;
        aro.position.z = -4;
        aro.position.y = 20;
        this.add(aro);
        this.collidersAros.push(aro.transparentBox);
        this.aros.push(aro);

        var aro1 = aro.clone();
        aro1.position.copy(aro.position);
        aro.position.x += 250;
        aro.position.z -= 5;
        this.add(aro1);
        this.collidersAros.push(aro1.transparentBox);
        this.aros.push(aro);
    }

    posicionarMartillos() {
        var martillo = new Martillo();
        this.martillos.push(martillo);

        this.add(martillo);
        
  

        var martillo = new Martillo();
        this.martillos.push(martillo);
        martillo.position.x = 470;
        martillo.position.z = -35;
        martillo.rotation.y = 1.57;

        this.add(martillo);
    }

    createObstaculos() {
        this.posicionarHelices();
        this.posicionarGemas();
        this.posicionarPlataformas();
        this.posicionarPinchos();
        this.posicionarAros();
        this.posicionarObjetivos();
        this.posicionarMartillos();
        this.createGround(350);
        this.createGround(590);

    }

    createGround(offset) {

        var geometryGround = new THREE.BoxGeometry(200, 50, 50);

        var texture = new THREE.TextureLoader().load('../imgs/suelo.png');
        var materialGround = new THREE.MeshPhongMaterial({ map: texture });
        var materialFis = new Physijs.createMaterial(materialGround, 0, 0);


        var ground = new Physijs.BoxMesh(geometryGround, materialFis, 0);
        ground.position.y = -25;
        ground.position.x = offset;
        ground.addEventListener('collision',
            function(o, v, r, n) {
                // Si el objeto que colisiona con el suelo es colisionable, se le quita el modo alambre
                MyScene.SUELO = 1;
                console.log(MyScene.SUELO);

            }
        );
        this.add(ground);
    }

    createSkyBox() {
        var geometry = new THREE.BoxGeometry(6000, 500, 1500);
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
        skyBox.position.x = 1900;
        this.add(skyBox);
        this.colliderSkyBox.push(skyBox);
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
            this.camera.position.z = this.guiControls.z;

            var look = this.camera.position;
            look.z -= 100;

        } else {

            this.camera.position.x = this.physicBox.position.x;
            var vector3 = new THREE.Vector3(this.physicBox.position.x, this.physicBox.position.y, 0);
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
            this.z = 200.0;
        }


        var folder = gui.addFolder('Cámara');


        folder.add(this.guiControls, 'design').name('Desarrollo: ');
        folder.add(this.guiControls, 'x', 0.0, 5000.0, 0.1).name('X');
        folder.add(this.guiControls, 'y', 0.0, 1000.0, 0.1).name('Y');
        folder.add(this.guiControls, 'z', 0.0, 1000.0, 0.1).name('Z');


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
                this.fuerzaAbajo += 2;
                /*
                var offset = new THREE.Vector3(0, 0, 1);
                var effect = offset.normalize().multiplyScalar(this.fuerzaAbajo);
                this.physicBox.applyCentralImpulse(effect);*/
                this.physicBox.position.z += 0.5;
                this.physicBox.__dirtyPosition = true;
                break;
            case MyScene.ARRIBA:
                this.fuerzArriba += 2;
                /* var offset = new THREE.Vector3(0, 0, 1);
                 var effect = offset.normalize().multiplyScalar(this.fuerzArriba);
                 this.physicBox.applyCentralImpulse(effect.negate());*/
                this.physicBox.position.z -= 0.5;
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

    eventosSueltaTecla(event) {

        var tecla = event.which || event.KeyCode;
        /*
                switch (tecla) {
                    case MyScene.ARRIBA:
                      
                        var offset = new THREE.Vector3(0, 0, 1);
                        var effect = offset.normalize().multiplyScalar(this.fuerzArriba * 6);
                        this.physicBox.applyCentralImpulse(effect);
                        this.fuerzArriba = 0;
                     
                        break;
                    case MyScene.ABAJO:
                        
                        var offset = new THREE.Vector3(0, 0, 1);
                        var effect = offset.normalize().multiplyScalar(this.fuerzaAbajo * 6);
                        this.physicBox.applyCentralImpulse(effect.negate());
                        this.fuerzaAbajo = 0;
                        break;
                }
                
            */

        if (tecla == MyScene.SALTAR && MyScene.SUELO && !MyScene.INICIO) {
            this.saltando = true;
            MyScene.SUELO = 0;
            var fuerza = 1300;
            var offset = new THREE.Vector3(0, 1, 0);
            var effect = offset.normalize().multiplyScalar(fuerza);
            this.physicBox.applyCentralImpulse(effect);

            //this.physicBox.position.y += 20;
            // this.physicBox.__dirtyPosition = true;
            this.saltando = false;
        }

        if (MyScene.INICIO && tecla == MyScene.SALTAR) {
            MyScene.INICIO = 0;
            document.getElementById('inicio').style = 'display: none';
            document.getElementById('audio').play(); 
        }

        if (MyScene.MUERTO && tecla == MyScene.SALTAR) {
            location.reload();
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
    window.addEventListener("keyup", (event) => scene.eventosSueltaTecla(event));
    // Que no se nos olvide, la primera visualización.

    scene.update();
});