#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

out vec3 vPosition;
out vec2 vTexCoord;
out vec3 vNormal;

void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1);
    vPosition = (uModelMatrix * vec4(aPosition, 1)).xyz;
    vTexCoord = aTexCoord;
    vNormal = uNormalMatrix * aNormal;
}
