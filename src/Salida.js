class Salida extends THREE.Object3D{
    constructor(){
        super();
        var boxgeometry = new THREE.CylinderGeometry(3,3,1,64);
        var material = new THREE.MeshPhongMaterial({ color: 0x0033ff});
        var caja1 = new THREE.Mesh(boxgeometry, material);
        var caja2 =new THREE.Mesh(boxgeometry, material);;
        var torogeometry = new THREE.TorusGeometry( 20, 3, 16, 100,3.1 );
        var arco = new THREE.Mesh(torogeometry,material);

        caja1.scale.y = 50;
       
        caja1.position.x = -70;
        caja1.position.z = 20;

        caja2.scale.y = 50;
       
        caja2.position.x = -70;
        caja2.position.z = -20;

        arco.rotation.y = 1.5708;;
        arco.position.x = -70;
        arco.position.y = 23;

        this.add(caja1);
        this.add(caja2);
        this.add(arco);

    }
}