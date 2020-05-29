class gema extends THREE.Object3D{
    constructor(){
        super();
        var material = new THREE.MeshNormalMaterial({ color: 0x00ff00 } );
        this.rombo = this.crearRombo(material);
        this.add(this.rombo);
    }

    update(){
        this.rotation.y += 0.02;
    }

    crearRombo(mat){
        var figura = new THREE.Object3D();

        var shape = this.crearContorno();
        var options = {steps: 10,  curveSegments: 10 , amount: 1};
        var geometry = new THREE.ExtrudeGeometry(shape , options);
       
    
        var corazonMesh = new THREE.Mesh (geometry, mat);
        corazonMesh.scale.set(0.3,0.3,0.3);

        figura.add(corazonMesh);

        return figura
    }


    crearContorno(){
        var x = 0, y = 0;
        var rombo  = new THREE.Shape();
        rombo.moveTo(x, y );
        rombo.lineTo(x +2 , y+2);
        rombo.moveTo(x+2 , y+2);
        rombo.lineTo(x,y+4);
        rombo.moveTo(x,y+4);
        rombo.lineTo(x-2,y+2);
        rombo.moveTo(x-2,y+2);
        rombo.lineTo(x,y);
        

      
        return rombo;
    }
}