import * as THREE from 'three';
import { START_FADE_IN_TIME } from './constants.js';

let time = 0;
export function createBackground(scene) {
    const color = new THREE.Color(0x000000);
    scene.background = color;

    function update(delta) {
        time += delta;
        //const brightness = 0.03 * (Math.min(time - START_FADE_IN_TIME, 1));
        //color.setRGB(brightness, brightness, 2 * brightness);
    }

    return { update }
}
