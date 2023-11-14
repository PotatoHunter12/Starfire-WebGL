import { ResizeSystem } from '../engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../engine/systems/UpdateSystem.js';
import { GLTFLoader } from '../engine/loaders/GLTFLoader.js';

import { TurntableController } from '../engine/controllers/TurntableController.js';

import {
    Camera,
    Node,
    Transform,
} from '../engine/core.js';

import { Renderer } from './Renderer.js';

const canvas = document.querySelector('canvas');
const renderer = new Renderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load('../Assets/Models/clovek.gltf');

const mapLoader = new GLTFLoader();
await mapLoader.load('../Assets/Models/mapa.gltf');

const scene = await mapLoader.loadScene(mapLoader.defaultScene)

const camera = new Node();
camera.addComponent(new Transform());
camera.addComponent(new Camera({
    near: 0.1,
    far: 100,
}));
const cameraController = new TurntableController(camera, canvas);

function update(time, dt) {
    cameraController.update(time, dt);
}

function render() {
    renderer.render(scene,camera);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();


document.querySelector('.loader-container').remove();