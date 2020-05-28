import { Loader } from 'three/src/loaders/Loader';
import { LoadingManager } from 'three/src/loaders/LoadingManager';
import { Font } from 'three/src/extras/core/Font';

export class FontLoader extends Loader {

	constructor( manager?: LoadingManager );

	load(
		url: string,
		onLoad?: ( responseFont: Font ) => void,
		onProgress?: ( event: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): void;
	parse( json: any ): Font;

}
