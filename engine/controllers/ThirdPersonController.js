import { quat, vec3, mat4 } from '../../../lib/gl-matrix-module.js';

import {
    Camera,
    Model,
    Node,
    Transform,
} from '../core.js';

export class ThirdPersonController {

    constructor(player, node, domElement, {
        pitch = -1.5,
        yaw = 0,
        velocity = [0, 0, 0],
        acceleration = 50,
        maxSpeed = 20,
        decay = 0.9999999,
        pointerSensitivity = 0.001,
        rotation = [ -0.7,0, 0, 0.7 ],
        damage = 20,
        health = 100,
    } = {}) {
        this.view = 50
        this.player = player;
        this.target = this.player.getComponentOfType(Transform);
        this.target.translation = [0,23.75,0]
        vec3.copy(this.target,this.target.translation)

        this.node = node
        this.domElement = domElement

        this.keys = {};
        this.locked = {}

        this.pitch = pitch;
        this.yaw = yaw;
        this.rotation = rotation
        this.rotation2 = this.target.rotation

        this.velocity = velocity;
        this.acceleration = acceleration;
        this.maxSpeed = maxSpeed;
        this.decay = decay;
        this.pointerSensitivity = pointerSensitivity;
        this.isGrounded = true

        this.damage = damage
        this.health = health

        this.initHandlers();
    }
    

    initHandlers() {
        this.pointermoveHandler = this.pointermoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);

        const element = this.domElement;
        const doc = element.ownerDocument;

        doc.addEventListener('keydown', this.keydownHandler);
        doc.addEventListener('keyup', this.keyupHandler);

        element.addEventListener('click', e => element.requestPointerLock());
        doc.addEventListener('pointerlockchange', e => {
            if (doc.pointerLockElement === element) {
                doc.addEventListener('pointermove', this.pointermoveHandler);
            } else {
                doc.removeEventListener('pointermove', this.pointermoveHandler);
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
        if(this.keys['Space'] && this.isGrounded){
            vec3.add(acc,acc,[0,200,0])
            this.isGrounded = false
        }
        if(this.keys['ShiftLeft']){
            this.maxSpeed = 5
        }
        if(this.keys['KeyM'] && !this.locked['KeyM']){
            this.view *= this.view == 5000 ? 0.01 : 10
            this.locked['KeyM'] = true
        }
        if(!this.isGrounded){
            vec3.sub(acc,acc,[0,1.5,0])
            if(transform.translation[1] < 23.75){
                transform.translation[1] = 23.75 
                acc[1] = 0
                this.velocity[1] = 0
                this.isGrounded = true
            }
        }

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
        

        if (!this.keys['ShiftLeft']){
            this.maxSpeed = 20
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
        const minpi = -Math.PI / 2.4;

        this.pitch = Math.min(Math.max(this.pitch, -Math.PI), minpi);
        this.yaw = ((this.yaw % twopi) + twopi) % twopi;
        

        this.rotation = quat.create()
        this.rotation2 = [ 0,0, -0.7, 0.7 ]
        quat.rotateX(this.rotation, this.rotation, this.pitch);
        quat.rotateX(this.rotation2, this.rotation2, this.yaw)
        
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
        this.locked[e.code] = false
    }

}