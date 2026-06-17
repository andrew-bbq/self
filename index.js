import * as THREE from 'three';
import { createStars } from './scripts/stars.js';
import { createBackground } from './scripts/background.js';
import { CAMERA_END_PAN, CAMERA_START_PAN, SOFT_KEYFRAME_BUFFER } from './scripts/constants.js';
import { createPlanet } from './scripts/planet.js';
import { updateWriting } from './scripts/writing.js';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT);
let camera_animation = softKeyframeVector3(
    camera,
    "lookAt",
    CAMERA_START_PAN,
    CAMERA_END_PAN,
    new THREE.Vector3(1, 0.5, 0),
    new THREE.Vector3(1, -0.5, 0)
);
scene.add(camera);

const stars = createStars(scene);
const background = createBackground(scene);
const planet = createPlanet(scene);

const clock = new THREE.Clock();

function render() {
    const delta = clock.getDelta();
    // comment to group updates to other scripts
    stars.update(delta);
    background.update(delta);
    planet.update(delta);
    updateWriting(delta);

    camera_animation.update(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

/**
 * creates logistic curve been start vector 3 and end vector 3 from times from start_time to end_time
 * Math done by hand! I have it in my notebook (to prove to myself that I can remember basic algebra :3)
 * returns update function to be called every frame to update the object
 */
function softKeyframeVector3(item, method, start_time, end_time, start, end) {
    let time = 0;
    const midpoint = (end_time - start_time) / 2 + start_time;
    const growth_factor = Math.log(99) / (start_time - midpoint);
    function update(delta) {
        time += delta;
        if (time <= (start_time - SOFT_KEYFRAME_BUFFER)) {
            item[method](start);
            return false;
        }
        if (time >= (end_time + SOFT_KEYFRAME_BUFFER)) {
            item[method](end);
            return true;
        }
        const modifier = 1 / (1 + Math.pow(Math.E, (growth_factor * (time - midpoint))));
        const x = start.x + ((end.x - start.x) * modifier);
        const y = start.y + ((end.y - start.y) * modifier);
        const z = start.z + ((end.z - start.z) * modifier);
        const curr = new THREE.Vector3(x, y, z);
        item[method](curr);
    }
    return { update };
}

render();
