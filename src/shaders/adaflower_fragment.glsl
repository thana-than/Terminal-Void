uniform float uTime;
uniform vec2 uMouse;
uniform sampler2D videoTex;
uniform sampler2D flowerTex;
uniform sampler2D textTex;
varying vec2 vUv;
float hueSpeed = .2;

//? See https://www.shadertoy.com/view/XljGzV
vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

//? See https://www.shadertoy.com/view/XljGzV
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

//? See https://www.shadertoy.com/view/lf2XDR
float scanlines(float x, float repeat, float modValue)
{
    x = floor(x * repeat);
    return mod(x, modValue);
}

void main()
{
    float t = sin(1.5 + uTime * hueSpeed) *.5 + .5;
    vec2 scan = vec2(scanlines(vUv.y + uTime * 0.05, 5.0, 3.0));

    float mouse = sin(1.0 - smoothstep(0.0, .3, distance(uMouse, vUv)));

    vec3 videoColor = 1.0 - texture2D(videoTex, vUv).rgb + mouse;
    vec3 textColor = texture2D(textTex, vUv - scan * .001).rgb;
    vec3 flowerColor = texture2D(flowerTex, vUv - scan * .01).rgb;

    textColor *= max(videoColor.x,(1.0 - t));

    flowerColor = hsv2rgb(flowerColor);
    flowerColor.r += t * 0.005;
    flowerColor.r = mod(flowerColor.r, 1.0);
    flowerColor = rgb2hsv(flowerColor);
    flowerColor -= textColor;
    float videoMask = smoothstep(.5,1.0, videoColor.r);

    flowerColor = mix(flowerColor, 1.0 - flowerColor * .25 + textColor, videoMask);

    vec3 outputColor = mix(videoColor,flowerColor, videoColor);
    outputColor += textColor * .1;
    gl_FragColor = vec4(outputColor, 1.0);
}