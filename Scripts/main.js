import { GUI } from '../lib/dat.gui.module.js';

import { ResizeSystem } from '../engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../engine/systems/UpdateSystem.js';

import { GLTFLoader } from '../engine/loaders/GLTFLoader.js';

import {
    FirstPersonController,
    ThirdPersonController,
    EnemyController,
    OrbitController
} from '../engine/controllers/controllers.js'

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
await gltfLoader.load('../Assets/Models/mapa/Proluxiraz.gltf');
const scene = await gltfLoader.loadScene(gltfLoader.defaultScene);

const playerLoader = new GLTFLoader();
await playerLoader.load('../Assets/Models/zhigga-basic/zhigga_basic_standing.gltf');
const playerScene = await playerLoader.loadScene(playerLoader.defaultScene);
const player = await playerLoader.loadNode("Zhigga_standing");

const enemyLoader = new GLTFLoader()
await enemyLoader.load('../Assets/Models/monsters/ghost_walking.gltf')
const enemy = await enemyLoader.loadNode("ghost")

const cape = await enemyLoader.loadNode("cape")
enemy.addChild(cape)

for (let i = 0; i < 100; i++) {
    const nme = enemy.clone()
    nme.addComponent(new EnemyController(nme,player,canvas))
    scene.addChild(nme)
    
}

const camera = await playerScene.find(node => node.getComponentOfType(Camera));
player.addComponent(new ThirdPersonController(player, camera, canvas));

scene.addChild(player)

const light = new Node();
light.addComponent(new Transform({
    translation: [-100, 200, 3],
}));
light.addComponent(new Light({
    ambient: 0.2,
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

