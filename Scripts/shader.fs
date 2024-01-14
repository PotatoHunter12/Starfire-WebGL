#version 300 es
precision mediump float;
precision mediump sampler2D;

uniform sampler2D uBaseTexture;
uniform vec4 uBaseFactor;

uniform vec4 uLightColor;
uniform float uLightRange;
uniform vec3 uLightPosition[2];
uniform float uLightAmbient;

in vec3 vPosition;
in vec2 vTexCoord;
in vec3 vNormal;

out vec4 oColor;

void main() {
    vec3 dist1 = uLightPosition[0] - vPosition;
    vec3 dist2 = uLightPosition[1] - vPosition;

    vec3 N = normalize(vNormal);
    vec3 L = normalize(dist1);

    float lambert = dot(N,L);
    vec4 baseColor = texture(uBaseTexture, vTexCoord);
    vec4 lambertFactor;
    if (length(dist1) < uLightRange) {
        lambertFactor = vec4(vec3(lambert/length(dist1)*5.0), 1);
        baseColor = baseColor + (uLightColor/length(dist1)*0.008);
    }
    else {
        lambertFactor = vec4(0,0,0, 0);
    }
    lambertFactor = lambertFactor + vec4(vec3(dot(N,normalize(dist2))/25.0),1);
    vec4 ambientFactor = vec4(vec3(uLightAmbient), 1);
    oColor = uBaseFactor * baseColor * (lambertFactor + ambientFactor);

}
