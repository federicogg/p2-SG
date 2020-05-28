import { Loader } from 'three/src/loaders/Loader';
import { LoadingManager } from 'three/src/loaders/LoadingManager';
import { DataTexture } from 'three/src/textures/DataTexture';

export class DataTextureLoader extends Loader {

	constructor( manager?: LoadingManager );

	load(
		url: string,
		onLoad: ( dataTexture: DataTexture ) => void,
		onProgress?: ( event: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): void;

}
