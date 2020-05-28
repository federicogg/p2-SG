import { LoadingManager } from 'three/src/loaders/LoadingManager';
import { Loader } from 'three/src/loaders/Loader';
import { AnimationClip } from 'three/src/animation/AnimationClip';

export class AnimationLoader extends Loader {

	constructor( manager?: LoadingManager );

	load(
		url: string,
		onLoad: ( response: AnimationClip[] ) => void,
		onProgress?: ( request: ProgressEvent ) => void,
		onError?: ( event: ErrorEvent ) => void
	): void;
	parse( json: any ): AnimationClip[];

}
