#version 300 es
precision mediump float;
precision mediump sampler2D;

uniform sampler2D uBaseTexture;
uniform vec4 uBaseFactor;

uniform vec3 uLightPosition;
uniform float uLightAmbient;

in vec3 vPosition;
in vec2 vTexCoord;
in vec3 vNormal;

out vec4 oColor;

void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uLightPosition - vPosition);
    float lambert = max(dot(N, L), 0.0);

    vec4 baseColor = texture(uBaseTexture, vTexCoord);
    vec4 lambertFactor = vec4(vec3(lambert), 1);
    vec4 ambientFactor = vec4(vec3(uLightAmbient), 1);
    oColor = uBaseFactor * baseColor * (lambertFactor + ambientFactor);
}
