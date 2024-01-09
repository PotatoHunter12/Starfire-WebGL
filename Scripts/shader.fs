#version 300 es
precision mediump float;
precision mediump sampler2D;

uniform sampler2D uBaseTexture;
uniform vec4 uBaseFactor;

uniform vec4 uLightColor;
uniform float uLightRange;
uniform vec3 uLightPosition;
uniform float uLightAmbient;

in vec3 vPosition;
in vec2 vTexCoord;
in vec3 vNormal;

out vec4 oColor;

void main() {
    vec3 N = normalize(vNormal);
    vec3 dist = uLightPosition - vPosition;
    vec3 L = normalize(dist);
    float a = dot(N,L);

    float lambert = a;
    vec4 baseColor = texture(uBaseTexture, vTexCoord);
    vec4 lambertFactor;
    if (length(dist) < uLightRange) {
        lambertFactor = vec4(vec3(lambert/length(dist)*5.0), 0);
        baseColor = baseColor + (uLightColor/length(dist)*0.008);
    }
    else {
        lambertFactor = vec4(0,0,0, 0);
    }
    vec4 ambientFactor = vec4(vec3(uLightAmbient), 1);
    oColor = uBaseFactor * baseColor * (lambertFactor + ambientFactor);

}
