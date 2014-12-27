precision mediump float;
precision mediump int;

uniform float time;
uniform vec3 resolution;

varying vec3 vPosition;
varying vec4 vColor;

void main() {

  vec4 color = vec4(
    max(20./length(vPosition.xyz), .3),
    max(20./length(vPosition.xyz), .3),
    max(20./length(vPosition.xyz), .3),
    1.);
  gl_FragColor = color;

}