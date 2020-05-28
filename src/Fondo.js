class Fondo extends Physijs.Scene{
    constructor(){
        super();
    
        var geometryGround = new THREE.BoxGeometry(400,0.1,100);
        var texture = new THREE.TextureLoader().load('../imgs/ladrillo-difuso.png');
   
        var materialGround = new THREE.MeshPhongMaterial ({map: texture});
        var materialFis = new Physijs.createMaterial(materialGround, 0.3, 0.2);
        var fondo = new Physijs.BoxMesh(geometryGround, materialFis, 0);

        fondo.rotation.x = 1.5708;
        fondo.position.z = -25;
        fondo.position.y = 24;
        this.add(fondo);
    }
}