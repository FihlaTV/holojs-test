uniform highp vec3 color;
uniform highp vec3 cameraPosition;

void main () {
    gl_FragColor = vec4(color, 1.0);
}