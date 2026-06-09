import * as THREE from 'three';
import { TITLE_FADE_START, TITLE_FADE_END } from './constants.js';

const PLANET_RADIUS = 50;
const TREE_COUNT = 15;
const MAX_TREE_RADIUS = Math.PI / 6;
const MIN_TREE_RADIUS = Math.PI / 9;

export function createPlanet(scene) {
    const group = new THREE.Group();

    const planetGeo = new THREE.SphereGeometry(PLANET_RADIUS, 32, 32);
    const planetMat = new THREE.MeshLambertMaterial({ color: 0x523528 });
    group.add(new THREE.Mesh(planetGeo, planetMat));
    group.position.set(60, -95, 65);

    const campfireDir = new THREE.Vector3(1.5, 4.5, -3).normalize();
    const { campfire, flame, innerFlame, light } = makeCampfire();
    campfire.position.copy(campfireDir.clone().multiplyScalar(PLANET_RADIUS));
    campfire.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), campfireDir);
    group.add(campfire);

    for (let i = 0; i < TREE_COUNT; i++) {
        const tree = makePineTree();

        // randomize from campfire direction
        // this is google-math
        const randomTheta = Math.random() * Math.PI * 2;
        const randomPhi = Math.random() * MAX_TREE_RADIUS + MIN_TREE_RADIUS;
        const dir = new THREE.Vector3().copy(campfireDir).applyAxisAngle(new THREE.Vector3(0, 1, 0), randomPhi).applyAxisAngle(campfireDir, randomTheta).normalize();
        tree.position.copy(dir.clone().multiplyScalar(PLANET_RADIUS));
        tree.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        group.add(tree);
    }


    scene.add(group);

    // Rotating around campfireDir in local space leaves campfireDir unchanged (a vector
    // rotated around its own axis stays fixed), so the campfire holds its world position.
    let time = 0;
    function update(delta) {
        group.rotateOnAxis(campfireDir, delta * 0.07);
        time += delta;

        if (time < TITLE_FADE_START) {
            return;
        } else if (time < TITLE_FADE_END) {
            const light_scale = (time - TITLE_FADE_START) / (TITLE_FADE_END - TITLE_FADE_START);
            light.intensity = light_scale * 5;
            light.distance = light_scale * 200;
        }
        const flicker = 1 + 0.25 * Math.sin(time * 9.3) + 0.15 * Math.sin(time * 14.7);
        light.intensity = 5 * flicker;
        flame.scale.set(1, 0.9 + 0.1 * flicker, 1);
        innerFlame.scale.set(1, flicker, 1);
    }

    return { update };
}

function makeCampfire() {
    const campfire = new THREE.Group();

    const logMat = new THREE.MeshLambertMaterial({ color: 0x5c3d1e });
    const logGeo = new THREE.CylinderGeometry(0.2, 0.25, 4, 6);

    const log1 = new THREE.Mesh(logGeo, logMat);
    log1.rotation.z = Math.PI / 2;
    log1.rotation.y = Math.PI / 4;
    log1.position.y = 0.2;
    campfire.add(log1);

    const log2 = new THREE.Mesh(logGeo, logMat);
    log2.rotation.z = Math.PI / 2;
    log2.rotation.y = -Math.PI / 4;
    log2.position.y = 0.2;
    campfire.add(log2);

    const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.8, 1.8, 8),
        new THREE.MeshPhysicalMaterial({ color: 0xff6600 })
    );
    flame.position.y = 1;
    campfire.add(flame);

    const innerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.4, 1.4, 8),
        new THREE.MeshPhysicalMaterial({ color: 0xffdd00 })
    );
    innerFlame.position.y = 0.8;
    campfire.add(innerFlame);

    const light = new THREE.PointLight(0xffffff, 0, 0);
    light.position.y = 3;
    campfire.add(light);

    return { campfire, flame, innerFlame, light };
}

function makePineTree() {
    const tree = new THREE.Group();

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x2b1b16 });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 5, 8), trunkMat);
    trunk.position.y = 2.5;
    tree.add(trunk);

    for (const [radius, height, y] of [[3.0, 4.0, 5.0], [2.2, 3.5, 7.5], [1.4, 3.0, 9.5]]) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 8), leafMat);
        cone.position.y = y;
        tree.add(cone);
    }

    return tree;
}
