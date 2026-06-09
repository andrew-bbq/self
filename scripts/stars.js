import * as THREE from 'three';
import { START_FADE_IN_TIME, END_FADE_IN_TIME } from './constants.js';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

let time = 0;

const STAR_COUNT = (WIDTH + HEIGHT);
const starData = [];
const BASE_STAR_RADIUS = Math.min(1, WIDTH / 1300);
const MIN_STAR_DISTANCE = 300;
const MAX_STAR_DISTANCE = 400;

export function createStars(scene) {
    const starGeometry = new THREE.SphereGeometry(BASE_STAR_RADIUS, 16, 16);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const instancedMesh = new THREE.InstancedMesh(starGeometry, starMaterial, STAR_COUNT);

    const dummy = new THREE.Object3D();
    const position = new THREE.Vector3();
    const color = new THREE.Color();

    for (let i = 0; i < STAR_COUNT; i++) {
        //const y = (Math.random() * HEIGHT * 2) - HEIGHT;
        //const x = (Math.random() * 100) + 300 + (100 - Math.abs(y)); // push stars closer to middle further from camera
        //const z = (Math.random() * WIDTH) - (WIDTH / 2);
        //position.set(x, y, z);

        // Testing alternate star position generation, this seems fine for now though
        // will modify if the camera animation makes this weird
        position.randomDirection(); position.multiplyScalar(THREE.MathUtils.randFloat(MIN_STAR_DISTANCE, MAX_STAR_DISTANCE));

        dummy.position.copy(position);
        dummy.updateMatrix();

        instancedMesh.setMatrixAt(i, dummy.matrix);
        instancedMesh.material.transparent = true;
        instancedMesh.material.opacity = 1;
        /**
         * size: max size of star (should oscillate between max and some smaller value)
         * opacity: also oscillating to simulate twinkling, can probly use this for size oscillation, too
         * midpoint: time when we should stop turning red and start turning blue
         * endpoint: time when we should esplode
         */
        const midpoint = (Math.random() * 30) + 30;
        starData.push({
            index: i,
            size: Math.random() * 3,
            opacity: Math.random() * Math.PI,
            midpoint: midpoint,
            endpoint: midpoint + 5
        });
    }

    scene.add(instancedMesh);

    function update(delta) {
        time += delta;
        starData.forEach((star) => {
            instancedMesh.getMatrixAt(star.index, dummy.matrix);

            star.opacity += (delta / 3);
            const brightness = (Math.sin(star.opacity) + 1) / 2;

            if (time < START_FADE_IN_TIME) {
                color.setHex(0x000000);
            } else if (time < END_FADE_IN_TIME) {
                const scaled_brightness = (time - START_FADE_IN_TIME) * brightness;
                color.setRGB(scaled_brightness, scaled_brightness, scaled_brightness);
            } else {
                color.setRGB(brightness, brightness, brightness);
                // todo: color depending on timescale (stage 1 turn white to red, stage 2 turn red to blue and explode)
                /**if (star.time < RED_GIANT_TIME) {
                    const redness = (RED_GIANT_TIME - star.time) / RED_GIANT_TIME;
                    color.setRGB(255 * brightness, redness * 255 * brightness, redness * 255 * brightness);
                } else if (star.time < SUPERNOVA_TIME) {
                    color.setRGB(255, 0, 0);
                }*/
            }

            //instancedMesh.scale.set(brightness * star.size, brightness * star.size, brightness * star.size);
            instancedMesh.setColorAt(star.index, color)


        });
        instancedMesh.instanceColor.needsUpdate = true;
    }

    return { update };
}
