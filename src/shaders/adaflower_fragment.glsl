uniform sampler2D uTexture;
varying vec2 vUv;
void main()
{
    // Apply texture
    vec3 textureColor = texture2D(uTexture, vUv).rgb;

    // FINAL COLOR
    gl_FragColor = vec4(1.0 - textureColor, 1.0);
}