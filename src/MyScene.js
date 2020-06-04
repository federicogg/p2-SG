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
        MyScene.TERMINADO = 0;
        MyScene.REINICIABONUS = 0;
        MyScene.CHECKPOINT = 0;
        MyScene.VUELVECHECK = 67;

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


        // this.axis = new THREE.AxesHelper(7);
        // this.add(this.axis);

        this.createPlayer(-70, 2, 0);
        //this.createPlayer(1390, 70, 0); //Check point
        //this.createPlayer(2220, 70, -2); //Meta




        var salida = new Salida();
        this.add(salida);
        var meta = new Meta();
        meta.position.x = 2350;
        meta.position.z = -10;
        this.add(meta);
        this.colliderMeta = [];
        this.colliderMeta.push(meta.collider);
        this.checkpoint = new THREE.Vector3(0, 0, 0);


        this.createCamera();
        this.collidersHelices = [];
        this.collidersAros = [];
        this.collidersGemas = [];
        this.colliderObjetivos = [];
        this.colliderPinchos = [];
        this.colliderSkyBox = [];
        this.colliderCheckPoint = [];

        this.collidersHelices2 = [];
        this.collidersAros2 = [];
        this.collidersGemas2 = [];
        this.colliderPinchos2 = [];

        this.helices = [];
        this.gemas = [];
        this.aros = [];
        this.martillos = [];

        this.helices2 = [];
        this.gemas2 = [];
        this.aros2 = [];

        this.createObstaculos();

        this.luces = new Luces();
        this.add(this.luces);
        this.createLights();

        this.createSkyBox();

        //Contador
        this.contador = 0;
        this.checkscore = 0;

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




    createPlayer(x, y, z) {

        var materialPlayer = new THREE.MeshPhongMaterial({ color: 0xff0000 });

        var materialFis = new Physijs.createMaterial(materialPlayer, 0, 0);

        var geometry = new THREE.BoxGeometry(6, 6, 6);

        this.physicBox = new Physijs.BoxMesh(geometry, materialFis, 25);
        this.physicBox.position.y = y;
        this.physicBox.position.x = x;
        this.physicBox.position.z = z;
        // this.physicBox.position.set(posicion);

        var fuerza = 3;
        this.aceleracion = 0;
        var offset = new THREE.Vector3(20, 0, 0);
        this.effect = offset.normalize().multiplyScalar(fuerza);
        this.physicBox.setLinearVelocity(offset);


        this.physicBox.radio = 4;
        this.add(this.physicBox);

        this.antiguaPos = this.physicBox.position.x;



    }

    incrementaPuntos(pts) {
        this.puntos += pts;
        document.getElementById('panel').innerHTML = "<h2>Score: " + this.puntos + "</h2>";
    }

    createEscalera(width, num, index, z) {

        var texture = new THREE.TextureLoader().load('../imgs/escalera.png');
        var materialGround = new THREE.MeshPhongMaterial({ map: texture });
        var materialFis = new Physijs.createMaterial(materialGround, 0, 0);

        var geometry = new THREE.BoxGeometry(width, 2, 50);

        for (var i = 0; i < num; i++) {
            var platform = new Physijs.BoxMesh(geometry, materialFis, 0);
            platform.position.y += (i + 0.2) * 10;
            platform.position.x += (i * width) + 70 * index;
            platform.position.z = z;

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

            var colliderSkyBox = ray.intersectObjects(this.colliderSkyBox);
            var colliderCheckPoint = ray.intersectObjects(this.colliderCheckPoint);
            var colliderObjetivos = ray.intersectObjects(this.colliderObjetivos);
            var colliderMeta = ray.intersectObjects(this.colliderMeta);

            if (colliderCheckPoint.length > 0 && colliderCheckPoint[0].distance < directionVector.length()) {
                MyScene.CHECKPOINT = 1;
                this.checkpoint.copy(this.physicBox.position);

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

            if (colliderSkyBox.length > 0 && colliderSkyBox[0].distance < directionVector.length()) {

                console.log('Vacio');
                this.paraElBonus();
                MyScene.MUERTO = 1;

            }


            if (colliderMeta.length > 0 && colliderMeta[0].distance < directionVector.length() && !MyScene.TERMINADO) {
                console.log('META');
                MyScene.TERMINADO = 1;
            }

            if (!MyScene.CHECKPOINT) {
                var collidersGemas = ray.intersectObjects(this.collidersGemas);
                var collidersAros = ray.intersectObjects(this.collidersAros);
                var collidersHelices = ray.intersectObjects(this.collidersHelices);
                var colliderPinchos = ray.intersectObjects(this.colliderPinchos);
                var colliderMeta = ray.intersectObjects(this.colliderMeta);


                if (collidersGemas.length > 0 && collidersGemas[0].distance < directionVector.length()) {
                    console.log('GEMA');
                    var index = this.collidersGemas.indexOf(collidersGemas[0].object);
                    if (index != -1) {
                        this.collidersGemas.splice(index, 1);
                        this.remove(this.gemas[index]);
                        this.gemas.splice(index, 1);
                    }
                    if (MyScene.ENBONUS) {
                        MyScene.REINICIABONUS = 1;

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
                        document.getElementById('audioAro').play();
                    }

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


            } else {

                var collidersGemas2 = ray.intersectObjects(this.collidersGemas2);
                var collidersAros2 = ray.intersectObjects(this.collidersAros2);
                var collidersHelices2 = ray.intersectObjects(this.collidersHelices2);
                var colliderPinchos2 = ray.intersectObjects(this.colliderPinchos2);

                if (collidersGemas2.length > 0 && collidersGemas2[0].distance < directionVector.length()) {
                    console.log('GEMA');
                    var index = this.collidersGemas2.indexOf(collidersGemas2[0].object);
                    if (index != -1) {
                        this.collidersGemas2.splice(index, 1);
                        this.remove(this.gemas2[index]);
                        this.gemas2.splice(index, 1);

                    }
                    if (MyScene.ENBONUS) {
                        MyScene.REINICIABONUS = 1;

                    }
                    MyScene.ENBONUS = 1;

                }



                if (collidersAros2.length > 0 && collidersAros2[0].distance < directionVector.length()) {
                    console.log('ARO');
                    this.incrementaPuntos(30);
                    var index = this.collidersAros2.indexOf(collidersAros2[0].object);
                    if (index != -1) {
                        //Borramos el aro de la lista de colliders y de la escena
                        this.collidersAros2.splice(index, 1);
                        this.remove(this.aros2[index]);
                        this.aros2.splice(index, 1);
                        document.getElementById('audioAro').play();
                    }

                }
                if (collidersHelices2.length > 0 && collidersHelices2[0].distance < directionVector.length() && !MyScene.ENBONUS) {
                    console.log('Helices');
                    if (this.hayHelices) {
                        MyScene.MUERTO = 1;
                        this.hayHelices = false;

                    }



                } else {
                    this.hayHelices = true;
                }

                if (colliderPinchos2.length > 0 && colliderPinchos2[0].distance < directionVector.length() && !MyScene.ENBONUS) {
                    console.log('Pinchos');
                    if (this.hayPinchos) {
                        this.hayPinchos = false;
                        MyScene.MUERTO = 1;
                    }

                } else {

                    this.hayPinchos = true;
                }



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
        if (tiempo == 2.00) {
            document.getElementById('audioCuenta').play();
        }
        document.getElementById('bonus').innerHTML = "<h2>Inmunidad: " + tiempo.toFixed(2) + "s</h2>"
        if (this.contador == 700) {
            this.paraElBonus();
        }

    }

    reiniciaJuego(terminado) {
        if (!MyScene.CHECKPOINT && !terminado) {
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


        } else if (!terminado) {
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

            var f = document.createElement('h2');
            f.innerText = "Pulsa C para volver al punto de control"
            e.appendChild(f);

        } else {
            var fin = document.getElementById('fin');
            var score = document.getElementById('panel');

            var d = document.createElement('h2');
            d.innerText = "¡EHNORABUENA HAS TERMINADO!";
            fin.appendChild(d);

            var c = document.createElement('h2');
            c.innerText = score.innerText;
            d.appendChild(c);

            var e = document.createElement('h2');
            e.innerText = "Pulsa espacio para reiniciar el juego";
            c.appendChild(e);

        }

        this.remove(this.physicBox);


    }

    terminarJuego() {


    }


    update() {

        if (!MyScene.MUERTO && !MyScene.TERMINADO) {
            requestAnimationFrame(() => this.update());
        }

        if (MyScene.MUERTO || MyScene.TERMINADO) {
            this.reiniciaJuego(MyScene.TERMINADO);

        } else {
            if (!MyScene.INICIO)
                this.physicBox.applyCentralImpulse(this.effect);
        }


        if (MyScene.ENBONUS) {
            if (MyScene.REINICIABONUS) {
                this.contador = 0;
                MyScene.REINICIABONUS = 0;
            }
            this.incrementarTiempo();
        }

        if (!MyScene.CHECKPOINT) {
            for (var i = 0; i < this.helices.length; i++) {
                this.helices[i].update();
            }

            for (var i = 0; i < this.gemas.length; i++) {
                this.gemas[i].update();
            }

        } else {
            for (var i = 0; i < this.helices2.length; i++) {
                this.helices2[i].update();
            }

            for (var i = 0; i < this.gemas2.length; i++) {
                this.gemas2[i].update();
            }
        }


        this.barraupdate();
        this.cameraUpdate();
        this.updateSpotLight();

        this.renderer.render(this, this.getCamera());
        this.compruebaColision();

        this.simulate();
        TWEEN.update();

    }

    barraupdate() {
        var barra = document.getElementById('barra');
        var positionPlayer = this.physicBox.position.x + 70;

        var width = positionPlayer / 23.53;
        width = width + "%";
        barra.style.width = width;


    }

    posicionarCheckPoint() {
        var geometry = new THREE.BoxGeometry(1, 8, 8);
        var material = new THREE.MeshPhongMaterial({ color: 0xffffff });

        var c = new THREE.Mesh(geometry, material);
        c.scale.set(1, 6, 7);
        c.position.set(1400, 70, 0);
        this.colliderCheckPoint.push(c);
        this.add(c);


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
        ob4.position.x += 180;
        ob4.position.y -= 20;
        this.colliderObjetivos.push(ob4);
        this.add(ob4);

        var ob5 = ob4.clone();
        ob5.position.copy(ob4.position);
        ob5.position.x += 70;

        this.colliderObjetivos.push(ob5);
        this.add(ob5);

        var ob6 = ob5.clone();
        ob6.position.copy(ob5.position);
        ob6.position.x += 160;

        this.colliderObjetivos.push(ob6);
        this.add(ob6);

        var ob7 = ob6.clone();
        ob7.position.copy(ob6.position);
        ob7.position.x += 270;
        ob7.position.y += 30;

        this.colliderObjetivos.push(ob7);
        this.add(ob7);


        var o = ob7.clone();
        o.position.set(1120, 20, 0);
        this.colliderObjetivos.push(o);
        this.add(o);

        //Check point

        var o = ob7.clone();

        o.position.set(1420, 70, 0);

        this.colliderObjetivos.push(o);
        this.add(o);


    }

    posicionarHelices() {


        var he2 = new helices();
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

        he3 = he4.clone();
        he3.position.copy(he4.position);
        he3.position.x += 460;
        he4.position.z += 15;
        this.helices.push(he3);
        this.collidersHelices.push(he3.h1);
        this.collidersHelices.push(he3.h2);
        this.add(he3);

        he4 = he3.clone();
        he4.position.copy(he3.position);
        he4.position.z += 30;
        this.helices.push(he4);
        this.collidersHelices.push(he4.h1);
        this.collidersHelices.push(he4.h2);
        this.add(he4);

        //Check point

        var he5 = new helices();
        he5.position.set(1610, 35, -9);
        this.helices2.push(he5);
        this.collidersHelices2.push(he5.h1);
        this.collidersHelices2.push(he5.h2);
        this.add(he5);


    }

    posicionarPinchos() {

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

        var pincho3 = new Pinchos(6);
        pincho3.position.x = 875;
        pincho3.position.y = 45;
        pincho3.position.z -= 12;
        this.colliderPinchos.push(pincho3.sphere);
        this.add(pincho3);

        var pincho4 = pincho3.clone();
        pincho4.position.z += 30;
        this.colliderPinchos.push(pincho4.sphere);
        this.add(pincho4);

        pincho4 = new Pinchos(24);
        pincho4.position.copy(pincho3.position);
        pincho4.rotation.y = 1.57;
        pincho4.position.x += 90;
        pincho4.position.y -= 30;
        pincho4.position.z += 35;
        pincho4.scale.set(0.5, 0.5, 0.5);
        this.colliderPinchos.push(pincho4.sphere);
        this.add(pincho4);

        //Check point
        var pincho5 = new Pinchos(28);
        pincho5.position.set(1440, 20, 15);
        pincho5.rotation.y = 1.58;
        pincho5.scale.set(0.5, 0.5, 0.5);
        pincho5.sphere.scale.set(0.5, 1, 0.5);
        this.colliderPinchos2.push(pincho5.sphere);
        this.add(pincho5);

        var pincho5 = new Pinchos(28);
        pincho5.position.set(1440, 20, -35);
        pincho5.rotation.y = 1.58;
        pincho5.scale.set(0.5, 0.5, 0.5);
        pincho5.sphere.scale.set(0.5, 1, 0.5);
        this.colliderPinchos2.push(pincho5.sphere);
        this.add(pincho5);

    }

    posicionarGemas() {

        var gema = new Gema(false);
        gema.position.set(270, 50, 0);
        this.add(gema);
        this.gemas.push(gema);
        this.collidersGemas.push(gema.transparentBox);

        var gema = new Gema(false);
        gema.position.set(470, 13, 13);
        this.add(gema);
        this.gemas.push(gema);
        this.collidersGemas.push(gema.transparentBox);

        var gema = new Gema(true);
        gema.position.set(1039, 0, 0);
        this.add(gema);
        this.gemas.push(gema);
        this.collidersGemas.push(gema.transparentBox);

        //Check point

        var gema = new Gema(false);
        gema.position.set(1555, 25, -5);
        this.add(gema);
        this.gemas2.push(gema);
        this.collidersGemas2.push(gema.transparentBox);

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

        var p3 = new Physijs.BoxMesh(geometryGround, materialFis, 0);
        p3.scale.x = 2;
        p3.position.set(900, 32, 0);
        this.add(p3);

        var p4 = new Physijs.BoxMesh(geometryGround, materialFis, 0);
        p4.scale.set(0.8, 1, 0.7);
        p4.position.set(1160, 0, 25);
        this.add(p4);

        var p5 = new Physijs.BoxMesh(geometryGround, materialFis, 0);
        p5.scale.set(0.8, 1, 0.7);
        p5.position.set(1200, 0, 25);
        this.add(p5);

        var p6 = new Physijs.BoxMesh(geometryGround, materialFis, 0);
        p6.scale.set(2, 1, 0.7);
        p6.position.set(1185, 0, -15);
        this.add(p6);



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

        p3.addEventListener('collision',
            function(o, v, r, n) {
                MyScene.SUELO = 1;
            }

        );

        p4.addEventListener('collision',
            function(o, v, r, n) {
                MyScene.SUELO = 1;
            }

        );

        p5.addEventListener('collision',
            function(o, v, r, n) {
                MyScene.SUELO = 1;
            }

        );

        p6.addEventListener('collision',
            function(o, v, r, n) {
                MyScene.SUELO = 1;
            }

        );


        //Check point
        var p7 = new Physijs.BoxMesh(geometryGround, materialFis, 0);
        p7.scale.x = 2.5;
        p7.scale.z = 0.75;
        p7.position.set(1475, 15, -45);
        this.add(p7);

        var p8 = new Physijs.BoxMesh(geometryGround, materialFis, 0);
        p8.scale.x = 2.5;
        p8.scale.z = 0.75;
        p8.position.set(1475, 15, 5);
        this.add(p8);

        var p9 = new Physijs.BoxMesh(geometryGround, materialFis, 0);
        p9.scale.x = 2.5;
        p9.scale.z = 0.75;
        p9.position.copy(p8.position);
        p9.position.x += 105;
        p9.position.z -= 20;
        this.add(p9);

        var p10 = new Physijs.BoxMesh(geometryGround, materialFis, 0);

        p10.position.copy(p9.position);
        p10.scale.x = 2.5;
        p10.position.x += 330;

        p10.position.y += 40;
        this.add(p10);

        var p11 = new Physijs.BoxMesh(geometryGround, materialFis, 0);
        p11.scale.x = 2.5;
        p11.position.copy(p10.position);
        p11.position.x += 110;


        this.add(p11);

        p7.addEventListener('collision',
            function(o, v, r, n) {
                MyScene.SUELO = 1;
            }

        );

        p8.addEventListener('collision',
            function(o, v, r, n) {
                MyScene.SUELO = 1;
            }

        );

        p9.addEventListener('collision',
            function(o, v, r, n) {
                MyScene.SUELO = 1;
            }

        );

        p10.addEventListener('collision',
            function(o, v, r, n) {
                MyScene.SUELO = 1;
            }

        );

        p11.addEventListener('collision',
            function(o, v, r, n) {
                MyScene.SUELO = 1;
            }

        );

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

        aro1 = aro.clone();
        aro1.position.set(1095, 10, 0);
        this.add(aro1);
        this.collidersAros.push(aro1.transparentBox);
        this.aros.push(aro);

        aro1 = aro.clone();
        aro1.position.set(1160, 10, 25);
        this.add(aro1);
        this.collidersAros.push(aro1.transparentBox);
        this.aros.push(aro);

        aro1 = aro.clone();
        aro1.position.set(1200, 10, 25);
        this.add(aro1);
        this.collidersAros.push(aro1.transparentBox);
        this.aros.push(aro);


        //Check point

        aro1 = aro.clone();
        aro1.position.set(1475, 28, 10);
        this.add(aro1);
        this.collidersAros2.push(aro1.transparentBox);
        this.aros2.push(aro);
    }


    posicionarMartillos() {
        var martillo = new Martillo();

        var meshMartillo = martillo.getMesh();
        this.martillos.push(meshMartillo);
        meshMartillo.position.x -= 50;
        this.add(meshMartillo);


        martillo = new Martillo();
        var meshMartillo = martillo.getMesh();
        this.martillos.push(meshMartillo);
        meshMartillo.position.x = 1180;
        meshMartillo.position.z = 25;
        meshMartillo.position.y += 10;
        this.add(meshMartillo);


        //Check point

        martillo = new Martillo();
        var meshMartillo = martillo.getMesh();
        this.martillos.push(meshMartillo);
        meshMartillo.position.x = 1750;
        meshMartillo.position.z = -18;
        meshMartillo.position.y += 25;
        this.add(meshMartillo);

        for (let i = 0; i < this.martillos.length; i++) {
            this.createTweensMartillo(i);
        }
    }

    createTweensMartillo(i) {

        var origen = { x: 1.4 };
        var destino = { x: 5 };
        var loop1 = 2000;
        var movimiento = new TWEEN.Tween(origen).to(destino, loop1);
        movimiento.easing(TWEEN.Easing.Quadratic.InOut);

        var that = this.martillos[i];


        movimiento.onUpdate(function() {
            that.rotation.z = origen.x;
            that.__dirtyRotation = true;

        });

        var loop2 = 2000;
        var origen2 = { x: 5 };
        var destino2 = { x: 1.4 };
        var movimiento2 = new TWEEN.Tween(origen2).to(destino2, loop2);
        movimiento2.easing(TWEEN.Easing.Quadratic.InOut);

        movimiento2.onUpdate(function() {
            that.rotation.z = origen2.x;
            that.__dirtyRotation = true;
        });

        that.setLinearVelocity(new THREE.Vector3(0, 0, 0));
        that.setAngularVelocity(new THREE.Vector3(0, 0, 0));

        movimiento.chain(movimiento2);
        movimiento2.chain(movimiento);
        movimiento2.start();
    }

    posicionarEscalera() {
        this.createEscalera(40, 4, 0.3, 0);
        this.createEscalera(40, 4, 10.2, 0);
        this.createEscalera(40, 5, 17.8, 0);
        this.createEscalera(40, 5, 23.69, -20);
    }

    posicionarsuelos() {
        this.createGround(0, 0);
        this.createGround(350, 0);
        this.createGround(590, 0);
        this.createGround(1040, 0);
        this.createGround(2200, -10);

        //Check point
    }
    createObstaculos() {
        this.posicionarHelices();
        this.posicionarGemas();
        this.posicionarPlataformas();
        this.posicionarPinchos();
        this.posicionarAros();
        this.posicionarObjetivos();
        this.posicionarMartillos();
        this.posicionarsuelos();
        this.posicionarEscalera();
        this.posicionarCheckPoint();

    }

    createGround(offset, z) {

        var geometryGround = new THREE.BoxGeometry(200, 50, 50);

        var texture = new THREE.TextureLoader().load('../imgs/suelo.png');
        var materialGround = new THREE.MeshPhongMaterial({ map: texture });
        var materialFis = new Physijs.createMaterial(materialGround, 0, 0);


        var ground = new Physijs.BoxMesh(geometryGround, materialFis, 0);
        ground.position.y = -25;
        ground.position.x = offset;
        ground.position.z = z;
        ground.addEventListener('collision',
            function(o, v, r, n) {
                // Si el objeto que colisiona con el suelo es colisionable, se le quita el modo alambre
                MyScene.SUELO = 1;

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
            this.x = 2228.0;
            this.y = 92.0;
            this.z = 200.0;
        }


        var folder = gui.addFolder('Cámara');


        folder.add(this.guiControls, 'design').name('Desarrollo: ');
        folder.add(this.guiControls, 'x', 0.0, 5000.0, 0.1).name('X');
        folder.add(this.guiControls, 'y', 0.0, 120, 0.1).name('Y');
        folder.add(this.guiControls, 'z', 0.0, 1000.0, 0.1).name('Z');


        return gui;
    }

    updateSpotLight() {
        this.spotLight.position.copy(this.physicBox.position);
        this.spotLight.position.y += 40;
        this.spotLight.position.x += 50;

    }

    createLights() {

        var ambientLight = new THREE.AmbientLight(0x404040, 0.4);
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
        if (!MyScene.INICIO) {


            switch (tecla) {
                case MyScene.ABAJO:
                    this.fuerzaAbajo += 2;
                    /*
                    var offset = new THREE.Vector3(0, 0, 1);
                    var effect = offset.normalize().multiplyScalar(this.fuerzaAbajo);
                    this.physicBox.applyCentralImpulse(effect);*/
                    this.physicBox.position.z += 1;
                    this.physicBox.__dirtyPosition = true;
                    break;
                case MyScene.ARRIBA:
                    this.fuerzArriba += 2;
                    /* var offset = new THREE.Vector3(0, 0, 1);
                     var effect = offset.normalize().multiplyScalar(this.fuerzArriba);
                     this.physicBox.applyCentralImpulse(effect.negate());*/
                    this.physicBox.position.z -= 1;
                    this.physicBox.__dirtyPosition = true;
                    break;
                case MyScene.IZQUIERDA:
                    var fuerza = 80;
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

                case MyScene.VUELVECHECK:
                    this.physicBox.position.set(this.checkpoint);
                    //this.camera.position.copy(this.physicBox.position);
                    this.createPlayer(1390, 70, 0);
                    //this.camera.lookAt(this.physicBox.position);
                    MyScene.MUERTO = 0;
                    MyScene.INICIO = 1;

                    console.log(this.checkscore);
                    document.getElementById('fin').innerHTML = "";
                    requestAnimationFrame(() => this.update());
            }
        }

    }

    eventosSueltaTecla(event) {

        var tecla = event.which || event.KeyCode;

        if (tecla == MyScene.SALTAR && MyScene.SUELO && !MyScene.INICIO) {
            document.getElementById('jumpAudio').play();
            this.saltando = true;
            MyScene.SUELO = 0;
            var fuerza = 1300;
            var offset = new THREE.Vector3(0, 1, 0);
            var effect = offset.normalize().multiplyScalar(fuerza);
            this.physicBox.applyCentralImpulse(effect);

            this.saltando = false;
        }

        if (MyScene.INICIO && tecla == MyScene.SALTAR) {
            MyScene.INICIO = 0;
            document.getElementById('inicio').style = 'display: none';
            document.getElementById('manual').style = 'display:none';
            document.getElementById('startAudio').play();
        }

        if ((MyScene.MUERTO || MyScene.TERMINADO) && tecla == MyScene.SALTAR) {
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

    scene.update();
});