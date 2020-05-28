import { Loader } from 'three/src/loaders/Loader';
import { LoadingManager } from 'three/src/loaders/LoadingManager';
import { CubeTexture } from 'three/src/textures/CubeTexture';

export class CubeTextureLoader extends Loader {

	constructor( manager?: LoadingManager );

	load(
		urls: Array<string>,
		onLoad?: ( texture: CubeTexture ) => void,
		onProgress?: ( event: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): CubeTexture;

}
