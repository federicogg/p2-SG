class Fondo extends THREE.Object3D{
    constructor(){
        super();
    
        var geometryGround = new THREE.BoxGeometry(400,0.1,100);
        var texture = new THREE.TextureLoader().load('../imgs/ladrillo-difuso.png');
   
        var materialGround = new THREE.MeshBasicMaterial ({map: texture});
        var fondo = new THREE.Mesh(geometryGround,materialGround);
        fondo.rotation.x = 1.5708;
        fondo.position.z = -50;
        fondo.position.y = 24;
        this.add(fondo);
    }
}