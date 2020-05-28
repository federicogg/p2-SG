class Aro extends THREE.Object3D{
    constructor(){
        super();
        this.radio = 10;
        var geometry = new THREE.TorusGeometry(10, 0.5, 16, 100);
        var material = new THREE.MeshPhongMaterial({color: 0xff8000});
        var a = new THREE.Mesh(geometry,material);
        a.rotation.y = 1.57;
        
        this.aro = new THREE.Object3D();
        this.aro.add(a);
        this.add(this.aro);




    }

    getradio (){
        return this.radio;
    }
    update(){
        this.aro.rotation.x += 0.1;
    }
}