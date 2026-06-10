import * as THREE from 'three';
import { START_FADE_IN_TIME, END_FADE_IN_TIME, TITLE_FADE_START } from './constants.js';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

let time = 0;

const STAR_COUNT = (WIDTH + HEIGHT) / 1.5;
const starData = [];
const BASE_STAR_RADIUS = Math.min(1, WIDTH / 1300);
const MIN_STAR_DISTANCE = 300;
const MAX_STAR_DISTANCE = 400;

// couldn't think of a better name for this, higher is slower; inverse spin factor?
const STAR_SPIN_FACTOR = 20;

// supernova criteria
const RED_GIANT_OFFSET = 300; // minimum time for stars to go supernova
const RED_GIANT_SCALE = 3000; // max possible time after offset for supernova to happen
const RED_GIANT_START_OFFSET = 120; // stars will start turning red over x seconds
const SUPERNOVA_OFFSET = 20; // stars will go supernova x seconds after red giant has been reached

// supernova color constants
const SUPERNOVA_G = 0.75;

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
         */
        const midpoint = (Math.random() * RED_GIANT_SCALE) + RED_GIANT_OFFSET;
        starData.push({
            index: i,
            size: Math.random() * 2.5,
            opacity: Math.random() * Math.PI,
            midpoint,
            exploded: false,
        });
    }

    scene.add(instancedMesh);

    function update(delta) {
        const rotation_matrix = new THREE.Matrix3();
        rotation_matrix.set(
            Math.cos((delta / STAR_SPIN_FACTOR)), 0, Math.sin((delta / STAR_SPIN_FACTOR)),
            0, 1, 0,
            -Math.sin((delta / STAR_SPIN_FACTOR)), 0, Math.cos((delta / STAR_SPIN_FACTOR))
        );
        time += delta;
        const toRemove = [];
        starData.forEach((star) => {
            instancedMesh.getMatrixAt(star.index, dummy.matrix);
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

            star.opacity += (delta / 3);
            const brightness = (Math.sin(star.opacity) + 1) / 2;

            if (time < START_FADE_IN_TIME) {
                color.setHex(0x000000);
            } else if (time < END_FADE_IN_TIME) {
                const scaled_brightness = (time - START_FADE_IN_TIME) * brightness;
                color.setRGB(scaled_brightness, scaled_brightness, scaled_brightness);
            } else if (time < star.midpoint - RED_GIANT_START_OFFSET) {
                color.setRGB(brightness, brightness, brightness);
            }
            else if (time < star.midpoint) {
                const redness = (star.midpoint - time) / (RED_GIANT_START_OFFSET);
                color.setRGB(brightness, redness * brightness, redness * brightness);
            } else if (time < (star.midpoint + SUPERNOVA_OFFSET)) {
                const redness = (star.midpoint + SUPERNOVA_OFFSET - time) / SUPERNOVA_OFFSET;
                const r = brightness * redness;
                const g = brightness * (1 - redness) * SUPERNOVA_G;
                const b = brightness * (1 - redness);
                color.setRGB(r, g, b);
            } else {
                if (!star.exploded) {
                    star.exploded = true;
                }
                color.setRGB(0.1 * brightness, SUPERNOVA_G * brightness, brightness);
                // play some particle effects and mark this for deletion
            }


            // rotate around y axis
            if (time > TITLE_FADE_START) {
                dummy.position.applyMatrix3(rotation_matrix);
            }

            // derive scale from brightness
            dummy.scale.setScalar(brightness * star.size * 0.5);

            dummy.updateMatrix();
            instancedMesh.setMatrixAt(star.index, dummy.matrix);

            //instancedMesh.scale.set(brightness * star.size, brightness * star.size, brightness * star.size);
            instancedMesh.setColorAt(star.index, color)

        });
        instancedMesh.instanceColor.needsUpdate = true;
        instancedMesh.instanceMatrix.needsUpdate = true;
    }

    return { update };
}
