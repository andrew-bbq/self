import * as THREE from 'three';
import { TITLE_FADE_START, TITLE_FADE_END } from './constants.js';

const ROCK_COUNT = 8;
const ROCK_SIZE = 0.3;
const ROCK_VARIANCE = 0.25;

const PLANET_RADIUS = 50;
const TREE_COUNT = 16;
const FOLIAGE_COUNT = 8;
const MAX_TREE_RADIUS = Math.PI / 6;
const MIN_TREE_RADIUS = Math.PI / 11;

export function createPlanet(scene) {
    const group = new THREE.Group();

    const planetGeo = new THREE.SphereGeometry(PLANET_RADIUS, 32, 32);
    const planetMat = new THREE.MeshLambertMaterial({ color: 0x523528 });
    group.add(new THREE.Mesh(planetGeo, planetMat));
    group.position.set(60, -95, 80);

    const campfireDir = new THREE.Vector3(2.6, 4.5, -4.5).normalize();
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

    for (let i = 0; i < FOLIAGE_COUNT; i++) {
        const patch = makeFoliagePatch();
        const randomTheta = Math.random() * Math.PI * 2;
        const randomPhi = Math.random() * MAX_TREE_RADIUS + MIN_TREE_RADIUS;
        const dir = new THREE.Vector3().copy(campfireDir).applyAxisAngle(new THREE.Vector3(0, 1, 0), randomPhi).applyAxisAngle(campfireDir, randomTheta).normalize();
        patch.position.copy(dir.clone().multiplyScalar(PLANET_RADIUS));
        patch.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        group.add(patch);
    }

    scene.add(group);

    // Rotating around campfireDir in local space leaves campfireDir unchanged (a vector
    // rotated around its own axis stays fixed), so the campfire holds its world position.
    let time = 0;
    function update(delta) {
        group.rotateOnAxis(campfireDir, delta * 0.07);
        time += delta;
        const flicker = (1 + 0.25 * Math.sin(time * 9.3) + 0.15 * Math.sin(time * 14.7)) * 5;

        if (time < TITLE_FADE_START) {
            return;
        } else if (time < TITLE_FADE_END) {
            const light_scale = ((time - TITLE_FADE_START) / (TITLE_FADE_END - TITLE_FADE_START)) * flicker;
            light.intensity = light_scale;
            light.distance = 200;
        } else {
            light.intensity = flicker;
            flame.scale.set(1, 0.9 + 0.02 * flicker, 1);
            innerFlame.scale.set(1, flicker * 0.2, 1);
        }
    }

    return { update };
}

function makeCampfire() {
    const campfire = new THREE.Group();

    const rockMat = new THREE.MeshLambertMaterial({ color: 0x404040 });
    for (let i = 0; i < ROCK_COUNT; i++) {
        const rockGeo = new THREE.SphereGeometry(ROCK_SIZE + (Math.random() * ROCK_VARIANCE));
        const rock = new THREE.Mesh(rockGeo, rockMat);
        const theta = (i / ROCK_COUNT) * Math.PI * 2;
        const x = Math.cos(theta);
        const z = Math.sin(theta);
        rock.position.set(x, 0.1, z);
        campfire.add(rock);
    }

    const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.8, 1.8, 8, true),
        new THREE.MeshPhysicalMaterial({ color: 0xff6600 })
    );
    flame.position.y = 1;
    campfire.add(flame);

    const innerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.4, 1.4, 8, true),
        new THREE.MeshPhysicalMaterial({ color: 0xffdd00 })
    );
    innerFlame.position.y = 0.8;
    campfire.add(innerFlame);

    const light = new THREE.PointLight(0xffffff, 0, 0);
    light.position.y = 2.5;
    campfire.add(light);

    return { campfire, flame, innerFlame, light };
}

const BASE_TREE_HEIGHT = 10;
const TREE_HEIGHT_VARIANCE = 16;

function makePineTree() {
    const tree = new THREE.Group();

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x120c08 });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });
    const treeHeight = BASE_TREE_HEIGHT + (Math.random() * TREE_HEIGHT_VARIANCE);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.7, treeHeight, 8), trunkMat);
    trunk.position.y = treeHeight / 2;
    tree.add(trunk);

    for (const [radius, height, y] of [[3.2, 3.4, treeHeight - 2.8], [2.5, 2.8, treeHeight - 0.9], [1.8, 2.4, treeHeight + 0.5]]) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 8), leafMat);
        cone.position.y = y;
        tree.add(cone);
    }

    return tree;
}

function makeFoliagePatch() {
    const patch = new THREE.Group();
    const bladeCount = 5 + Math.floor(Math.random() * 5);
    const colors = [0x4a7c35, 0x5a9040, 0x3d6b2e];

    for (let i = 0; i < bladeCount; i++) {
        const height = 1.2 + Math.random() * 1.5;
        const geo = new THREE.ConeGeometry(0.25, height, 3);
        const mat = new THREE.MeshLambertMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
        const blade = new THREE.Mesh(geo, mat);
        blade.position.set(
            (Math.random() - 0.5) * 3,
            height / 2,
            (Math.random() - 0.5) * 3
        );
        blade.rotation.z = (Math.random() - 0.5) * 0.4;
        blade.rotation.x = (Math.random() - 0.5) * 0.4;
        patch.add(blade);
    }

    return patch;
}
