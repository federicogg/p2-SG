import { HemisphereLight } from 'three/src/lights/HemisphereLight';
import { Color } from 'three/src/math/Color';
import { Matrix4 } from 'three/src/math/Matrix4';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { Object3D } from 'three/src/core/Object3D';

export class HemisphereLightHelper extends Object3D {

	constructor(
		light: HemisphereLight,
		size: number,
		color?: Color | number | string
	);

	light: HemisphereLight;
	matrix: Matrix4;
	matrixAutoUpdate: boolean;
	material: MeshBasicMaterial;

	color: Color | string | number | undefined;

	dispose(): void;
	update(): void;

}
