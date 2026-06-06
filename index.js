import * as THREE from 'three';
import { createStars } from './scripts/stars.js';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT);
scene.add(camera);

const stars = createStars(scene);

const clock = new THREE.Clock();

const camera_times = [3, 6];
const camera_angles = [
    1, 1, 0,
    1, -1, 0
];

const camera_kf = new THREE.VectorKeyframeTrack('.lookAt', camera_times, camera_angles);

function render() {
    camera.lookAt(1, 0, 0);
    requestAnimationFrame(render);
    const delta = clock.getDelta();
    stars.update(delta);
    renderer.render(scene, camera);
}

render();
