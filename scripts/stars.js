import * as THREE from 'three';
import { START_FADE_IN_TIME, END_FADE_IN_TIME } from './constants.js';

const WIDTH = window.innerWidth;

let time = 0;

const STAR_COUNT = 2000;
const starData = [];
const BASE_STAR_RADIUS = Math.min(1, WIDTH / 1300);
// const MIN_STAR_DISTANCE = 300;
// const MAX_STAR_DISTANCE = 400;

export function createStars(scene) {
    const starGeometry = new THREE.SphereGeometry(BASE_STAR_RADIUS, 16, 16);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const instancedMesh = new THREE.InstancedMesh(starGeometry, starMaterial, STAR_COUNT);

    const dummy = new THREE.Object3D();
    const position = new THREE.Vector3();
    const color = new THREE.Color();

    for (let i = 0; i < STAR_COUNT; i++) {
        const x = (Math.random() * 100) + 300;
        const y = (Math.random() * 1000) - 500;
        const z = (Math.random() * 1200) - 600;
        position.set(x, y, z);

        // Testing alternate star position generation, this seems fine for now though
        // will modify if the camera animation makes this weird
        // position.randomDirection();
        // position.multiplyScalar(THREE.MathUtils.randFloat(MIN_STAR_DISTANCE, MAX_STAR_DISTANCE));

        dummy.position.copy(position);
        dummy.updateMatrix();

        instancedMesh.setMatrixAt(i, dummy.matrix);
        instancedMesh.material.transparent = true;
        instancedMesh.material.opacity = 1;
        starData.push({
            index: i,
            timescale: (Math.random() * 30) + 5,
            size: Math.random() * 3,
            opacity: Math.random() * Math.PI,
        });
    }

    scene.add(instancedMesh);

    function update(delta) {
        time += delta;
        starData.forEach((star) => {
            instancedMesh.getMatrixAt(star.index, dummy.matrix);

            star.opacity += (delta / 5);
            const brightness = (Math.sin(star.opacity) + 1) / 2;

            if (time < START_FADE_IN_TIME) {
                color.setHex(0x000000);
            } else if (time < END_FADE_IN_TIME) {
                const scaled_brightness = (time - START_FADE_IN_TIME) * brightness;
                color.setRGB(scaled_brightness, scaled_brightness, scaled_brightness);
            } else {
                // todo: color depending on timescale (stage 1 turn white to red, stage 2 turn red to blue and explode)
                color.setRGB(brightness, brightness, brightness);
            }
            instancedMesh.setColorAt(star.index, color);


        });
        instancedMesh.instanceColor.needsUpdate = true;
    }

    return { update };
}
