import { ResizeSystem } from '../engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../engine/systems/UpdateSystem.js';
import { GLTFLoader } from '../engine/loaders/GLTFLoader.js';
import { quat } from '../lib/gl-matrix-module.js'

import { OrbitController } from '../engine/controllers/OrbitController.js';

import {
    Camera,
    Node,
    Transform,
} from '../engine/core.js';

import { UnlitRenderer } from '../engine/renderers/UnlitRenderer.js';

const canvas = document.querySelector('canvas');
const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load('../Assets/Models/test-mapa/mapa.gltf');

const scene = await loader.loadScene(loader.defaultScene)

const camera = scene.find(node => node.getComponentOfType(Camera));

function update(time, dt) {
    
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