import { GUI } from '../lib/dat.gui.module.js';

import { ResizeSystem } from '../engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../engine/systems/UpdateSystem.js';

import { GLTFLoader } from '../engine/loaders/GLTFLoader.js';

import {
    ThirdPersonController,
    EnemyController
} from '../engine/controllers/controllers.js'

import {
    Camera,
    Node,
    Transform,
} from '../engine/core.js';

import { Renderer } from './Renderer.js';
import { Light } from './Light.js'

const enemies = []

const canvas = document.querySelector('canvas');
const renderer = new Renderer(canvas);
renderer.initialize();

const gltfLoader = new GLTFLoader()
await gltfLoader.load('../Assets/Models/mapa/Proluxiraz.gltf')
const scene = await gltfLoader.loadScene(gltfLoader.defaultScene)

const playerLoader = new GLTFLoader()
await playerLoader.load('../Assets/Models/zhigga/zhigga.gltf')
const playerScene = await playerLoader.loadScene(playerLoader.defaultScene)

const player = await playerLoader.loadNode("Zhigga_standing");
const camera = await playerScene.find(node => node.getComponentOfType(Camera));

player.addComponent(new ThirdPersonController(player, enemies, scene, camera, canvas));
scene.addChild(player)


const enemyLoader = new GLTFLoader()
await enemyLoader.load('../Assets/Models/monsters/ghost_walking.gltf')
const enemy = await enemyLoader.loadNode("ghost")
const cape = await enemyLoader.loadNode("cape")
enemy.addChild(cape)

const model = enemyLoader.gltf.scenes[0]
const animation = enemyLoader.gltf.animations[0]


const light = new Node();
light.addComponent(new Transform({
    translation: [0,1,0],
}));
light.addComponent(new Light({
    ambient: 0.1,
}));
player.addChild(light);

function update(time, dt) {
    const stats = player.getComponentOfType(ThirdPersonController)
    document.querySelector(".full").style.width = stats.health / 2 + "%"
    if (player.getComponentOfType(ThirdPersonController).health > 0){

        // spawn additional enemies
        spawn(Math.floor(stats.kills/5)+0-enemies.length)

        //update scene
        scene.traverse(node => {
            for (const component of node.components) {
                component.update?.(time, dt);
            }
        });

    }
    else {
        // ded
        window.location.href = "ded.html"
    }
    
}

function render() {
    renderer.render(scene, camera);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}
function spawn(n){
    for (let i = 0; i < n; i++) {
        const nme = enemy.clone()
        nme.addComponent(new EnemyController(nme,player,canvas))
        enemies.push(nme)
        scene.addChild(nme)
        
    }
}
new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();


