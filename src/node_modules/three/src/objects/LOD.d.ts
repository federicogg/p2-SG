import { Object3D } from 'three/src/core/Object3D';
import { Raycaster } from 'three/src/core/Raycaster';
import { Camera } from 'three/src/cameras/Camera';
import { Intersection } from 'three/src/core/Raycaster';

export class LOD extends Object3D {

	constructor();

	type: 'LOD';

	levels: { distance: number; object: Object3D }[];
	autoUpdate: boolean;
	readonly isLOD: true;

	addLevel( object: Object3D, distance?: number ): this;
	getCurrentLevel(): number;
	getObjectForDistance( distance: number ): Object3D | null;
	raycast( raycaster: Raycaster, intersects: Intersection[] ): void;
	update( camera: Camera ): void;
	toJSON( meta: any ): any;

	/**
	 * @deprecated Use {@link LOD#levels .levels} instead.
	 */
	objects: any[];

}
