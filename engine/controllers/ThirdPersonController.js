import { quat, vec3, mat4 } from '../../../lib/gl-matrix-module.js';

import {
    Camera,
    Model,
    Node,
    Transform,
} from '../core.js';
import { EnemyController } from './EnemyController.js';

export class ThirdPersonController {

    constructor(player, enemies, scene, node, domElement, {
        pitch = -0.2,
        yaw = 0,
        velocity = [0, 0, 0],
        acceleration = 50,
        maxSpeed = 20,
        decay = 0.9999999,
        pointerSensitivity = 0.001,
        damage = 35,
        health = 100,
        range = 4,
    } = {}) {
        this.view = 150
        this.player = player;
        this.target = this.player.getComponentOfType(Transform);
        
        this.target.translation = [0,22.75,0]
        vec3.copy(this.target,this.target.translation)

        this.node = node
        this.enemies = enemies
        this.scene = scene
        this.domElement = domElement

        this.keys = {};
        this.locked = {}
        this.clicked = false
        this.rclicked = false

        this.pitch = pitch;
        this.yaw = yaw;
        this.rotation = [ 0.7, -0.7, 0, 0 ]
        this.rotation2 = [ 0, 0, -0.7, 0.7 ]

        this.velocity = velocity;
        this.acceleration = acceleration;
        this.maxSpeed = maxSpeed;
        this.decay = decay;
        this.pointerSensitivity = pointerSensitivity;
        this.isGrounded = true
        this.step = 1

        this.damage = damage
        this.health = health
        this.range = range
        this.kills = 0

        this.charge = new Audio("../../Assets/Sounds/starfire.wav")
        this.charge.volume = 0.2

        this.initHandlers();
    }
    

    initHandlers() {
        const neki = this.node.getComponentOfType(Transform)

        this.pointermoveHandler = this.pointermoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.click = this.click.bind(this);

        const element = this.domElement;
        const doc = element.ownerDocument;

        doc.addEventListener('keydown', this.keydownHandler);
        doc.addEventListener('keyup', this.keyupHandler);
        
        element.addEventListener('click', e => element.requestPointerLock());
        doc.addEventListener('pointerlockchange', e => {
            if (doc.pointerLockElement === element) {
                doc.addEventListener('pointermove', this.pointermoveHandler);
                doc.addEventListener('click',this.click);
            } else {
                doc.removeEventListener('pointermove', this.pointermoveHandler);
                doc.removeEventListener('click',this.click);
            }
        });
    }

    update(t, dt) {
        const transform = this.player.getComponentOfType(Transform);
        const camTransform = this.node.getComponentOfType(Transform);
        // Calculate forward and right vectors.
        const cos = Math.cos(this.yaw);
        const sin = Math.sin(this.yaw);
        const forward = [-sin, 0, cos];
        const right = [-cos, 0, -sin];

        this.maxSpeed = 20
        // Map user input to the acceleration vector.
        const acc = vec3.create();
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            vec3.sub(acc, acc, right);
        }
        if(this.keys['ShiftLeft']){
            this.maxSpeed = 5
        }
        if(this.keys['KeyM'] && !this.locked['KeyM']){
            this.view *= this.view >= 5000 ? 0.01 : 10
            this.locked['KeyM'] = true
        }
        if(this.clicked){
            this.attackEnemy(1)
            this.clicked = false
            
        }
        if(this.rclicked){
            this.attackEnemy(2)
            this.rclicked = false
        }
        
        this.animate(acc)


        // detecting collisions with trees and rocks
        this.scene.children.forEach(child => {
            if(child.name.includes("tree")){
                const tr = child.getComponentOfType(Transform)
                const a = transform.translation
                const b = tr.translation
                const distance = Math.sqrt(Math.pow(a[0]-b[0],2)+Math.pow(a[2]-b[2],2))
                if(distance < tr.scale[0] + 1){
                    console.log(child.name);
                    vec3.scale(acc,acc,- 20)
                    this.maxSpeed = 10
                }       
            }
            else if(child.name.includes("skala")) {
                const tr = child.getComponentOfType(Transform)
                const a = transform.translation
                const b = tr.translation
                const distance = Math.sqrt(Math.pow(a[0]-b[0],2)+Math.pow(a[2]-b[2],2))
                if(distance < tr.scale[0] * 5){
                    console.log(child.name);
                    vec3.scale(acc, acc, -20)
                    this.maxSpeed = 10
                } 
            }
            else if(child.name.includes("starfire")) {
                const tr = child.getComponentOfType(Transform)
                const a = transform.translation
                const b = tr.translation
                const distance = Math.sqrt(Math.pow(a[0]-b[0],2)+Math.pow(a[2]-b[2],2))
                if(distance < tr.scale[0]/10){
                    console.log(child.name);
                    this.health += 0.01
                    this.charge.play()
                } 
            }
                
        });
        if(this.health > 100) this.health = 100
        // Update velocity based on acceleration.
        vec3.scaleAndAdd(this.velocity, this.velocity, acc, dt * this.acceleration);
        
        // If there is no user input, apply decay.
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'])
        {
            const decay = Math.exp(dt * Math.log(1 - this.decay));
            this.velocity[0] *= decay
            this.velocity[2] *= decay
        }
        

        // Limit speed to prevent accelerating to infinity and beyond.
        const speed = vec3.length(this.velocity);
        if (speed > this.maxSpeed) {
            vec3.scale(this.velocity, this.velocity, this.maxSpeed / speed);
        }
        
        if (transform && camTransform) {
            quat.copy(transform.rotation, this.rotation2)
            quat.copy(camTransform.rotation, this.rotation);

            vec3.transformQuat(camTransform.translation, [0,0,this.view], this.rotation);

            vec3.scaleAndAdd(transform.translation, transform.translation, this.velocity, dt);
            
        }
    }

    pointermoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;

        this.pitch -= dy * this.pointerSensitivity;
        this.yaw   -= dx * this.pointerSensitivity;
        
        const twopi = Math.PI * 2;

        this.pitch = Math.min(Math.max(this.pitch, -Math.PI/2), Math.PI/64);
        this.yaw = ((this.yaw % twopi) + twopi) % twopi;
        
        // rotate the camera and then the whole player
        this.rotation = [ 0.7, -0.7, 0, 0 ]
        this.rotation2 = [ 0, 0, -0.7, 0.7 ]
        quat.rotateX(this.rotation, this.rotation, this.pitch);
        quat.rotateX(this.rotation2, this.rotation2, this.yaw)
        console.log(this.pitch);
        
    }

    attackEnemy(n) {
        const me = this.player.getComponentOfType(Transform).translation
        this.enemies.forEach(nme => {
            const pos = nme.getComponentOfType(Transform).translation
            const stat = nme.getComponentOfType(EnemyController)

            const dist = vec3.distance(pos,me)
            if (dist < this.range) {
                stat.health -= this.damage
                stat.push = true
                if(stat.health <= 0){
                    this.enemies.splice(this.enemies.indexOf(nme),1)
                    stat.die()
                    this.scene.removeChild(nme)
                    this.kills++
                    this.health += 5
                    document.querySelector(".starfire").innerHTML = this.kills
                }
            }
        });
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }
    keyupHandler(e) {
        this.keys[e.code] = false;
        this.locked[e.code] = false
    }
    click(e){
        if(e.which == 1)
            this.clicked = true
        else if(e.which == 3)
            this.rclicked = true
    }
    animate(acc){
        const left = this.scene.find(node => node.name == "arm_left")
        const right = this.scene.find(node => node.name == "arm_right")

        const leftleg = this.scene.find(node => node.name == "leg_left")
        const rightleg = this.scene.find(node => node.name == "leg_right")

        const lt = left.getComponentOfType(Transform)
        const rt = right.getComponentOfType(Transform)
        const ltl = leftleg.getComponentOfType(Transform)
        const rtl = rightleg.getComponentOfType(Transform)

        if(vec3.length(acc) > 0){
            if(rtl.rotation[3] < 0.97) this.step*=-1
            lt.rotation = quat.rotateY(quat.create(),lt.rotation,0.01*this.step)
            rt.rotation = quat.rotateY(quat.create(),rt.rotation,-0.01*this.step)
            ltl.rotation = quat.rotateY(quat.create(),ltl.rotation,-0.01*this.step)
            rtl.rotation = quat.rotateY(quat.create(),rtl.rotation,0.01*this.step)
        }
        else {
            lt.rotation = quat.create()
            rt.rotation = quat.create()
        }
        
        // lt.rotation = quat.rotateY(quat.create(),lt.rotation,0.02)
        // rt.rotation = quat.rotateY(quat.create(),rt.rotation,-0.02)
    }

}