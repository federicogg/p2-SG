class Pinchos extends THREE.Object3D{
    constructor(num){
        super();
        this.radius = 5;
        var geometry = new THREE.CylinderGeometry( 1, 5, 20 );
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        
        for( var i = 0 ; i < num/3; i++){
            var cone = new THREE.Mesh( geometry, material );
            cone.position.x =i*5; 
            this.add(cone);
        }

        for( var i = 0 ; i < num/3 ; i++){
            var cone = new THREE.Mesh( geometry, material );
            cone.position.z = -5;
            cone.position.x =i*5; 
            this.add(cone);

            
        }
        for( var i = 0 ; i < num/3 ; i++){
            var cone = new THREE.Mesh( geometry, material );
            cone.position.z = +5;
            cone.position.x =i*5; 
            this.add(cone);

            
        }
    }
}