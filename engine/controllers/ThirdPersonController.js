import { quat, vec3, mat4 } from '../../../lib/gl-matrix-module.js';

import {
    Camera,
    Model,
    Node,
    Transform,
} from '../core.js';

export class ThirdPersonController {

    constructor(player, node, domElement, {
        pitch = -1.75,
        yaw = 0,
        velocity = [0, 0, 0],
        acceleration = 50,
        maxSpeed = 20,
        decay = 0.9999999,
        pointerSensitivity = 0.002,
        rotation = [ 0,0, -0.7, 0.7 ]
    } = {}) {
        this.player = player;
        this.target = this.player.getComponentOfType(Transform);

        vec3.copy(this.target,this.target.translation)

        this.node = node
        this.domElement = domElement

        this.keys = {};

        this.pitch = pitch;
        this.yaw = yaw;
        this.camV = [0,0,0]
        this.rotation = rotation
        this.rotation2 = this.target.rotation

        this.velocity = velocity;
        this.acceleration = acceleration;
        this.maxSpeed = maxSpeed;
        this.decay = decay;
        this.pointerSensitivity = pointerSensitivity;

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
        if(this.keys['Space']){
            vec3.add(acc,acc,[0,1,0])
        }
        if(this.keys['ShiftLeft']){
            vec3.add(acc,acc,[0,-1,0])
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
            vec3.scale(this.velocity, this.velocity, decay);
        }

        // Limit speed to prevent accelerating to infinity and beyond.
        const speed = vec3.length(this.velocity);
        if (speed > this.maxSpeed) {
            vec3.scale(this.velocity, this.velocity, this.maxSpeed / speed);
        }

        const transform = this.player.getComponentOfType(Transform);
        const camTransform = this.node.getComponentOfType(Transform);
        transform.scale = [0.8,0.8,0.8]
        
        if (transform && camTransform) {
            quat.copy(transform.rotation, this.rotation2)
            quat.copy(camTransform.rotation, this.rotation);

            vec3.transformQuat(camTransform.translation, [0,0,50], this.rotation);

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
        console.log(this.pitch);

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
    }

}