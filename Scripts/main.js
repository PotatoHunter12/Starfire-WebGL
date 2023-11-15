import { ResizeSystem } from '../engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../engine/systems/UpdateSystem.js';

import { GLTFLoader } from '../engine/loaders/GLTFLoader.js';

import { FirstPersonController } from '../engine/controllers/FirstPersonController.js';
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
await playerLoader.load('../Assets/Models/test-clovek/clovek.gltf');

const scene = gltfLoader.loadScene(gltfLoader.defaultScene);

const camera = scene.find(node => node.getComponentOfType(Camera));

scene.find(node => console.log(node));
const light = new Node();
light.addComponent(new Transform({
    translation: [-100, 200, 3],
}));
light.addComponent(new Light({
    ambient: 0.3,
}));
scene.addChild(light);

function update(time, dt) {
}

function render() {
    renderer.render(scene, camera);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();


// const dud = new GLTFLoader();
// await dud.load('../Assets/Models/test-clovek/clovek.gltf')

// const scene = await loader.loadScene(loader.defaultScene)
// console.log(scene);
// const camera = scene.find(node => node.getComponentOfType(Camera));

// const light = new Node();
// light.addComponent(new Transform({
//     translation: [3, 3, 3],
// }));
// light.addComponent(new Light({
//     ambient: 0.3,
// }));
// scene.addChild(light);

// camera.addComponent(new FirstPersonController(camera, canvas));

// function update(time, dt) {

// }

// function render() {
//     renderer.render(scene,camera);
// }

// function resize({ displaySize: { width, height }}) {
//     camera.getComponentOfType(Camera).aspect = width / height;
// }

// new ResizeSystem({ canvas, resize }).start();
// new UpdateSystem({ update, render }).start();


// document.querySelector('.loader-container').remove();