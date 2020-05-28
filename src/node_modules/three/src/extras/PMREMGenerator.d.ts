import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';
import { Texture } from 'three/src/textures/Texture';
import { CubeTexture } from 'three/src/textures/CubeTexture';
import { Scene } from 'three/src/scenes/Scene';

export class PMREMGenerator {

	constructor( renderer:WebGLRenderer );
	fromScene( scene:Scene, sigma?:number, near?:number, far?:number ): WebGLRenderTarget;
	fromEquirectangular( equirectangular:Texture ): WebGLRenderTarget;
	fromCubemap( cubemap:CubeTexture ): WebGLRenderTarget;
	compileCubemapShader(): void;
	compileEquirectangularShader(): void;
	dispose(): void;

}
