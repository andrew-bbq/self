import * as THREE from 'three';
import { START_FADE_IN_TIME, END_FADE_IN_TIME, TITLE_FADE_START } from './constants.js';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const STAR_COUNT = (WIDTH + HEIGHT) * 2;
const BASE_STAR_RADIUS = Math.min(1, WIDTH / 1300);
const MIN_STAR_DISTANCE = 300;
const MAX_STAR_DISTANCE = 400;

// couldn't think of a better name for this, higher is slower; inverse spin factor?
const STAR_SPIN_FACTOR = 30;

// supernova criteria
const RED_GIANT_OFFSET = 300; // minimum time for stars to go supernova
const RED_GIANT_SCALE = 4000; // max possible time after offset for supernova to happen
const RED_GIANT_START_OFFSET = 120; // stars will start turning red over x seconds
const SUPERNOVA_OFFSET = 10; // stars will go supernova x seconds after red giant has been reached

const STATUS_DEFAULT = "DEFAULT";
const STATUS_REDMODE = "REDMODE";
const STATUS_EXPLODED = "ESPLODED";

// supernova color constants
const SUPERNOVA_G = 0.75;

// explosion constants
const PARTICLE_COUNT = 600;
const PARTICLES_PER_EXPLOSION = 20;
const PARTICLE_LIFETIME = 2.6;

export function createStars(scene) {
    const starGeometry = new THREE.SphereGeometry(BASE_STAR_RADIUS, 16, 16);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const instancedMesh = new THREE.InstancedMesh(starGeometry, starMaterial, STAR_COUNT);

    const particleGeometry = new THREE.SphereGeometry(BASE_STAR_RADIUS, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0x00a5ff });
    const particleMesh = new THREE.InstancedMesh(particleGeometry, particleMaterial, PARTICLE_COUNT);

    const dummy = new THREE.Object3D();
    const particleDummy = new THREE.Object3D();
    const position = new THREE.Vector3();
    const color = new THREE.Color();
    const rotation_matrix = new THREE.Matrix3();

    const starData = [];
    const particleData = [];
    let particlePointer = 0;
    let time = 0;

    for (let i = 0; i < STAR_COUNT; i++) {
        position.randomDirection(); position.multiplyScalar(THREE.MathUtils.randFloat(MIN_STAR_DISTANCE, MAX_STAR_DISTANCE));

        dummy.position.copy(position);
        dummy.updateMatrix();

        instancedMesh.setMatrixAt(i, dummy.matrix);
        /**
         * size: max size of star (should oscillate between max and some smaller value)
         * opacity: also oscillating to simulate twinkling, can probly use this for size oscillation, too
         * midpoint: time when we should stop turning red and start turning blue
         * status: current phase of the da moon :P
         */
        const midpoint = (Math.random() * RED_GIANT_SCALE) + RED_GIANT_OFFSET;
        starData.push({
            index: i,
            size: Math.random() * 1.25,
            opacity: Math.random() * Math.PI * 2,
            midpoint,
            brightness: 0,
            status: STATUS_DEFAULT
        });
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // reserve 200 particles for explosions
        // When supernova is reached, take the next 20 particles and send them in random directions
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        particleMesh.setMatrixAt(i, dummy.matrix);
        particleData.push({
            index: i,
            velocity: new THREE.Vector3(0, 0, 0),
            size: 1,
            lifetime: 0.0,
        });
    }

    scene.add(instancedMesh);
    scene.add(particleMesh);

    function update(delta) {
        rotation_matrix.set(
            Math.cos((delta / STAR_SPIN_FACTOR)), 0, Math.sin((delta / STAR_SPIN_FACTOR)),
            0, 1, 0,
            -Math.sin((delta / STAR_SPIN_FACTOR)), 0, Math.cos((delta / STAR_SPIN_FACTOR))
        );
        time += delta;
        // UPDATE STARS
        starData.forEach((star) => {
            instancedMesh.getMatrixAt(star.index, dummy.matrix);
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

            star.opacity += (delta / 3);
            const brightness = (Math.sin(star.opacity) + 1) / 2;

            if (time < START_FADE_IN_TIME) {
                color.setHex(0x000000);
                dummy.scale.setScalar(brightness * star.size);
            } else if (time < END_FADE_IN_TIME) {
                const scaled_brightness = (time - START_FADE_IN_TIME) / (END_FADE_IN_TIME - START_FADE_IN_TIME) * brightness;
                color.setRGB(scaled_brightness, scaled_brightness, scaled_brightness);
                dummy.scale.setScalar(brightness * star.size);
            } else if (time < star.midpoint - RED_GIANT_START_OFFSET) {
                color.setRGB(brightness, brightness, brightness);
                dummy.scale.setScalar(brightness * star.size);
            }
            else if (time < star.midpoint) {
                // if first time switching to turning red, store current size and begin shrinking
                if (star.status != STATUS_REDMODE) {
                    star.status = STATUS_REDMODE;
                    star.size = star.size * brightness; // star.size now stores the max size of the star
                    star.brightness = brightness; // and store brightness so that we can shift to red from this
                }
                const redness = (star.midpoint - time) / (RED_GIANT_START_OFFSET);
                dummy.scale.setScalar(star.size * ((redness * 0.75) + 0.25));
                color.setRGB(star.brightness, redness * star.brightness, redness * star.brightness);
            } else if (time < (star.midpoint + SUPERNOVA_OFFSET)) {
                const redness = (star.midpoint + SUPERNOVA_OFFSET - time) / SUPERNOVA_OFFSET;
                const r = star.brightness * redness;
                const g = star.brightness * (1 - redness) * SUPERNOVA_G;
                const b = star.brightness * (1 - redness);
                dummy.scale.setScalar((star.size * 0.25) + (1 - redness));
                color.setRGB(r, g, b);
            } else {
                if (star.status != STATUS_EXPLODED) {
                    star.status = STATUS_EXPLODED;
                    dummy.scale.setScalar(0);
                    // grab next PARTICLES_PER_EXPLOSION particles
                    particleData
                        .slice(particlePointer, particlePointer + PARTICLES_PER_EXPLOSION)
                        .forEach((particle) => {
                            particle.velocity = new THREE.Vector3().randomDirection();
                            particle.lifetime = PARTICLE_LIFETIME;
                            particle.size = star.size;
                            particleDummy.position.copy(dummy.position);
                            particleDummy.scale.setScalar(star.size * 0.25);
                            particleDummy.updateMatrix();
                            particleMesh.setMatrixAt(particle.index, particleDummy.matrix);
                        });

                    // move pointer
                    particlePointer = (particlePointer + PARTICLES_PER_EXPLOSION) % PARTICLE_COUNT;
                }
            }


            // rotate around y axis
            if (time > TITLE_FADE_START) {
                dummy.position.applyMatrix3(rotation_matrix);
            }

            dummy.updateMatrix();
            instancedMesh.setColorAt(star.index, color)
            instancedMesh.setMatrixAt(star.index, dummy.matrix);

            //instancedMesh.scale.set(brightness * star.size, brightness * star.size, brightness * star.size);

        });
        // UPDATE EXPLOSION PARTICLES
        particleData.forEach((particle) => {
            if (particle.lifetime <= 0) return;
            particle.lifetime -= delta;
            particleMesh.getMatrixAt(particle.index, particleDummy.matrix);
            particleDummy.matrix.decompose(particleDummy.position, particleDummy.quaternion, particleDummy.scale);
            particleDummy.position.addScaledVector(particle.velocity, delta);
            particleDummy.position.applyMatrix3(rotation_matrix);
            const scale = Math.max(0, (particle.lifetime * particle.size) / PARTICLE_LIFETIME);
            particleDummy.scale.setScalar(scale);
            particleDummy.updateMatrix();
            particleMesh.setMatrixAt(particle.index, particleDummy.matrix);
        });
        particleMesh.instanceMatrix.needsUpdate = true;
        instancedMesh.instanceColor.needsUpdate = true;
        instancedMesh.instanceMatrix.needsUpdate = true;
    }

    return { update };
}
