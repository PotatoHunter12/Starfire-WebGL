import { GUI } from '../lib/dat.gui.module.js';

import { ResizeSystem } from '../engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../engine/systems/UpdateSystem.js';

import { GLTFLoader } from '../engine/loaders/GLTFLoader.js';

import { FirstPersonController } from '../engine/controllers/FirstPersonController.js';
import { ThirdPersonController } from '../engine/controllers/ThirdPersonController.js';
import { TurntableController } from '../engine/controllers/TurntableController.js';
import { OrbitController } from '../engine/controllers/OrbitController.js';
import { RotateAnimator } from '../engine/animators/RotateAnimator.js';
import { LinearAnimator } from '../engine/animators/LinearAnimator.js';

import {
    Camera,
    Model,
    Node,
    Transform,
} from '../engine/core.js';

import { Renderer } from './Renderer.js';
import { Light } from './Light.js'

const canvas = document.querySelector('canvas');
const renderer = new Renderer(canvas);
renderer.initialize();

const gltfLoader = new GLTFLoader();
await gltfLoader.load('../Assets/Models/test-mapa/mapa.gltf');

const playerLoader = new GLTFLoader();
await playerLoader.load('../Assets/Models/zhigga-basic/zhigga_basic.gltf');
const player = await playerLoader.loadNode("Sphere");

const scene = await gltfLoader.loadScene(gltfLoader.defaultScene);
const playerScene = await playerLoader.loadScene(playerLoader.defaultScene);
const camera = await playerScene.find(node => node.getComponentOfType(Camera));


player.addComponent(new ThirdPersonController(camera, canvas));
scene.addChild(player)

const light = new Node();
light.addComponent(new Transform({
    translation: [-100, 200, 3],
}));
light.addComponent(new Light({
    ambient: 0.3,
}));
scene.addChild(light);

function update(time, dt) {
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(time, dt);
        }
    });
}

function render() {
    renderer.render(scene, camera);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();

