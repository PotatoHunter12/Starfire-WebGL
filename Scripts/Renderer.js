import { vec3, mat3, mat4 } from '../lib/gl-matrix-module.js';

import * as WebGL from '../engine/WebGL.js';

import { BaseRenderer } from '../engine/renderers/BaseRenderer.js';

import {
    getLocalModelMatrix,
    getGlobalModelMatrix,
    getGlobalViewMatrix,
    getProjectionMatrix,
    getModels,
} from '../engine/core/SceneUtils.js';

import { Light } from './Light.js';

export class Renderer extends BaseRenderer {

    constructor(canvas) {
        super(canvas);
    }

    async initialize() {
        const gl = this.gl;

        const vertexShader = await fetch(new URL('shader.vs', import.meta.url))
            .then(response => response.text());

        const fragmentShader = await fetch(new URL('shader.fs', import.meta.url))
            .then(response => response.text());

        this.programs = WebGL.buildPrograms(gl, {
            shader: {
                vertex: vertexShader,
                fragment: fragmentShader,
            },
        });

        gl.clearColor(1, 1, 1, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
    }

    render(scene, camera) {
        const gl = this.gl;

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const { program, uniforms } = this.programs.shader;
        gl.useProgram(program);

        const viewMatrix = getGlobalViewMatrix(camera);
        const projectionMatrix = getProjectionMatrix(camera);

        gl.uniformMatrix4fv(uniforms.uViewMatrix, false, viewMatrix);
        gl.uniformMatrix4fv(uniforms.uProjectionMatrix, false, projectionMatrix);

        const light = scene.find(node => node.getComponentOfType(Light));
        const lightComponent = light.getComponentOfType(Light);
        const lightMatrix = getGlobalModelMatrix(light);
        const lightPosition = mat4.getTranslation(vec3.create(), lightMatrix);
        gl.uniform3fv(uniforms.uLightPosition, lightPosition);
        gl.uniform1f(uniforms.uLightAmbient, lightComponent.ambient);

        this.renderNode(scene);
    }

    renderNode(node, modelMatrix = mat4.create()) {
        const gl = this.gl;

        const { program, uniforms } = this.programs.shader;

        const localMatrix = getLocalModelMatrix(node);
        modelMatrix = mat4.mul(mat4.create(), modelMatrix, localMatrix);
        gl.uniformMatrix4fv(uniforms.uModelMatrix, false, modelMatrix);

        const normalMatrix = mat3.normalFromMat4(mat3.create(), modelMatrix);
        gl.uniformMatrix3fv(uniforms.uNormalMatrix, false, normalMatrix);

        const models = getModels(node);
        for (const model of models) {
            for (const primitive of model.primitives) {
                this.renderPrimitive(primitive);
            }
        }

        for (const child of node.children) {
            this.renderNode(child, modelMatrix);
        }
    }

    renderPrimitive(primitive) {
        const gl = this.gl;

        const { program, uniforms } = this.programs.shader;

        const vao = this.prepareMesh(primitive.mesh);
        gl.bindVertexArray(vao);

        const material = primitive.material;
        gl.uniform4fv(uniforms.uBaseFactor, material.baseFactor);

        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(uniforms.uBaseTexture, 0);

        const glTexture = this.prepareImage(material.baseTexture.image);
        const glSampler = this.prepareSampler(material.baseTexture.sampler);

        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.bindSampler(0, glSampler);

        gl.drawElements(gl.TRIANGLES, primitive.mesh.indices.length, gl.UNSIGNED_INT, 0);

        gl.bindVertexArray(null);
    }

}
