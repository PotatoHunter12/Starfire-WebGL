import { quat, vec3, mat4 } from '../../../lib/gl-matrix-module.js';

import {
    Model,
    Node,
    Transform,
} from '../core.js';
import { ThirdPersonController } from './ThirdPersonController.js';

export class EnemyController {
    constructor(node, player, domElement, {
        velocity = [0, 0, 0],
        acceleration = 50,
        decay = 0.9999999,
        maxSpeed = 4,
        damage = 10,
        health = 100,
        range = 3.5,
    } = {}) {
        this.node = node
        this.player = player
        this.stats 
        this.domElement = domElement
        this.yaw = 0

        this.velocity = velocity
        this.acceleration = acceleration
        this.maxSpeed = maxSpeed
        this.decay = decay

        this.transform
        this.target
        this.distance
        this.angle
        
        this.damage = damage
        this.health = health
        this.range = range

        this.cooldown = 5
        this.timer = 5

        this.init()
    }
    init() {
        this.transform = this.node.getComponentOfType(Transform)
        this.target = this.player.getComponentOfType(Transform)
        this.stats = this.player.getComponentOfType(ThirdPersonController)

        // Spawn enemy at random location
        this.transform.translation = [Math.random()*700-350,21,Math.random()*700-350]
    }

    update(t, dt) {
        this.timer += dt
        this.distance = vec3.distance(this.target.translation, this.transform.translation)

        const forward = vec3.sub(vec3.create(),this.target.translation, this.transform.translation)
        forward[1] = 0

        const twopi = Math.PI * 2;
        const halfpi = Math.PI / 2;

        this.angle = ((Math.atan2(forward[2],forward[0]) / Math.PI) + 1) * Math.PI
        this.angle = -((this.angle % twopi) + twopi) % twopi - halfpi

        // Follow player
        let acc = vec3.create();
        if (this.distance < 100 && this.distance > this.range) {
            vec3.add(acc, acc, forward)
        }
        else if (this.distance < this.range*0.9){
            vec3.sub(acc, acc, forward)
        }
        else {
            this.velocity = vec3.create()
            acc = vec3.create()
            if(this.timer >= this.cooldown && this.distance < this.range){
                this.timer %= this.cooldown
                this.stats.health -= this.damage
                if(this.stats.health <= 0){
                    this.stats.health = 100
                    //kle bo umru
                }
                console.log(this.stats.health);
            }

        }

        // Make sure enemy doesn't start drifting
        const decay = Math.exp(dt * Math.log(1 - this.decay));
        this.velocity[0] *= decay
        this.velocity[2] *= decay

        vec3.scaleAndAdd(this.velocity, this.velocity, acc, dt * this.acceleration);

        // Limit acceleration
        const speed = vec3.length(this.velocity);
        if (speed > this.maxSpeed) {
            vec3.scale(this.velocity, this.velocity, this.maxSpeed / speed);
        }

        // Move
        vec3.scaleAndAdd(this.transform.translation, this.transform.translation, this.velocity, dt)

        // Rotate
        this.transform.rotation = quat.rotateY(quat.create(),quat.create(),this.angle)
        
    }
}