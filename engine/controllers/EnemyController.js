import { quat, vec3, mat4 } from '../../../lib/gl-matrix-module.js';

import {
    Camera,
    Model,
    Node,
    Transform,
} from '../core.js';

export class EnemyController {
    constructor(node, player, domElement, {
        velocity = [0, 0, 0],
        acceleration = 50,
        maxSpeed = 20,
        damage = 10,
        health = 100,
    } = {}) {
        this.node = node
        this.player = player
        this.domElement = domElement

        this.velocity = velocity
        this.acceleration = acceleration
        this.maxSpeed = maxSpeed
        
        this.damage = damage
        this.health = health



    }
}