import { Loader } from 'three/src/loaders/Loader';
import { LoadingManager } from 'three/src/loaders/LoadingManager';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { InstancedBufferGeometry } from 'three/src/core/InstancedBufferGeometry';

export class BufferGeometryLoader extends Loader {

	constructor( manager?: LoadingManager );

	load(
		url: string,
		onLoad: ( bufferGeometry: InstancedBufferGeometry | BufferGeometry ) => void,
		onProgress?: ( request: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): void;
	parse( json: any ): InstancedBufferGeometry | BufferGeometry;

}
