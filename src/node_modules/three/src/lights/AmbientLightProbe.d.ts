import { Color } from 'three/src/math/Color';
import { LightProbe } from 'three/src/lights/LightProbe';

export class AmbientLightProbe extends LightProbe {

	constructor( color?: Color | string | number, intensity?: number );

	readonly isAmbientLightProbe: true;

}
