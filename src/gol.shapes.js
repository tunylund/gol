_import.module('gol.shapes').promise('TriangleCube', 'TriangleCloud', 'TriangleCloudMaterial', 'TriangleCubeMaterial', 'ThreatMaterial', function(_export) {

  var movement = _import('movement').from('gol')

  function defaultVertexShader() {
    function shader() {/*
      precision mediump float;
      precision mediump int;

      uniform mat4 modelViewMatrix; // optional
      uniform mat4 projectionMatrix; // optional

      attribute float size;
      attribute vec3 position;
      attribute vec4 color;

      varying vec3 vPosition;
      varying vec4 vColor;

      void main() {

        vPosition = position;
        vColor = color;

        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = min(abs(length(position.xyz)), 3.);

      }
    */}
    return shader.toString().replace(/^function.*\*/, "").replace(/\*\/.*\}$/, "")
  }

  function varyPositionShader() {
    function shader() {/*
    precision mediump float;
    precision mediump int;

    uniform mat4 modelViewMatrix; // optional
    uniform mat4 projectionMatrix; // optional
    uniform float diff;
    uniform float time;

    attribute float size;
    attribute vec3 position;
    attribute vec4 color;

    varying vec3 vPosition;
    varying vec4 vColor;

    void main() {
      vPosition = position;
      vColor = color;

      int dir = 10;

      float t = time/10000.0;
      float individuality = mod(length(position.xyz), 2.);
      vec3 offset = vec3(
        sin(t * position.x), 
        cos(t * position.y), 
        sin(t*position.z));
      vPosition = position + offset * 5.;

      vec4 mvPosition = modelViewMatrix * vec4( vPosition, 1.0 );
      gl_Position = projectionMatrix * mvPosition;
      //gl_PointSize = min(abs(length(position.xyz)), 3.);
    }
    */}
    return shader.toString().replace(/^function.*\*/, "").replace(/\*\/.*\}$/, "")
  }

  function pulsateShader() {
    function shader() {/*
    precision mediump float;
    precision mediump int;

    uniform mat4 modelViewMatrix; // optional
    uniform mat4 projectionMatrix; // optional
    uniform float diff;
    uniform float time;

    attribute float size;
    attribute vec3 position;
    attribute vec4 color;

    varying vec3 vPosition;
    varying vec4 vColor;

    void main() {
      float t = time/2000.0;
      vec3 offset = vec3(
        sin(t * position.x),
        sin(t * position.y),
        sin(t * position.z)
      );
      vPosition = position + offset * 1.;

      vColor = vec4(1., .5, .5, 1.);

      vec4 mvPosition = modelViewMatrix * vec4( vPosition, 1.0 );
      gl_Position = projectionMatrix * mvPosition;
    }
    */}
    return shader.toString().replace(/^function.*\*/, "").replace(/\*\/.*\}$/, "")
  }

  function haloShader() {
    function shader() {/*
    precision mediump float;
    precision mediump int;

    uniform float time;
    uniform vec3 resolution;

    varying vec3 vPosition;
    varying vec4 vColor;

    void main() {

      float t = time/1000.0;
      
      vec4 color = vec4(0.4, 0.2, 0.2, 0.);

      gl_FragColor = vec4(1., 0.2, 0.2, 1.);

      float hypot = sqrt(length(vPosition.x)*length(vPosition.y));
      if(
         //length(vPosition.x) < 1. ||
         //length(vPosition.y) < 1. ||
         hypot < abs(sin(t))
         ) {
        gl_FragColor = gl_FragColor - color;
      }

    }
    */}
    return shader.toString().replace(/^function.*\*/, "").replace(/\*\/.*\}$/, "")
  }

  function ThreatMaterial() {
    return new THREE.RawShaderMaterial({
      attributes: {},
      uniforms: {
        time: { type: "f", value: 1.0 },
        diff: { type: "f", value: 0.0 },
        resolution: { type: "v3", value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1)}
      },
      vertexShader: pulsateShader(),
      fragmentShader: haloShader(),
      side: THREE.DoubleSide
    })
  }
  _export('ThreatMaterial', ThreatMaterial)


  function TriangleCloud(density, radius) {
    var points = Math.max(density, 1),
        variance = radius/10,
        i, l;

    var geometry = new THREE.BoxGeometry(radius, radius, radius, density, density, density)
    for(i=0, l=geometry.vertices.length; i<l; i++) {
      geometry.vertices[i]
        .add(movement().random(variance).value())
        .clampScalar(-radius, radius)
    }
    return geometry
  }
  _export('TriangleCloud', TriangleCloud)



  function TriangleCloudMaterial() {
    return new THREE.RawShaderMaterial({
      attributes: {},
      uniforms: {
        time: { type: "f", value: 1.0 },
        diff: { type: "f", value: 0.0 },
        resolution: { type: "v3", value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1)}
      },
      vertexShader: varyPositionShader(),
      fragmentShader: document.getElementById( 'fragmentshader.glsl' ).textContent,
      side: THREE.DoubleSide
    })
  }

  _export('TriangleCloudMaterial', TriangleCloudMaterial)

  function TriangleCubeMaterial() {
    return new THREE.MeshPhongMaterial({
      color: 0xaaaaaa, 
      ambient: 0xaaaaaa, 
      specular: 0xffffff, 
      emissive: 0xff0000,
      shininess: 250,
      side: THREE.DoubleSide, 
      vertexColors: THREE.VertexColors
    })
  }
  _export('TriangleCubeMaterial', TriangleCubeMaterial)


  function TriangleCube(radius) {
    var triangles = radius*radius;

    var geometry = new THREE.BufferGeometry();



    var indices = new Uint32Array( triangles * 3 );

    for ( var i = 0; i < indices.length; i ++ ) {

      indices[ i ] = i;

    }

    var positions = new Float32Array( triangles * 3 * 3 );
    var normals = new Float32Array( triangles * 3 * 3 );
    var colors = new Float32Array( triangles * 3 * 3 );

    var color = new THREE.Color();

    var n = radius, n2 = n/2;  // triangles spread in the cube
    var d = 12, d2 = d/2; // individual triangle size

    var pA = new THREE.Vector3();
    var pB = new THREE.Vector3();
    var pC = new THREE.Vector3();

    var cb = new THREE.Vector3();
    var ab = new THREE.Vector3();

    for ( var i = 0; i < positions.length; i += 9 ) {

      // positions

      var x = Math.random() * n - n2;
      var y = Math.random() * n - n2;
      var z = Math.random() * n - n2;

      var ax = x + Math.random() * d - d2;
      var ay = y + Math.random() * d - d2;
      var az = z + Math.random() * d - d2;

      var bx = x + Math.random() * d - d2;
      var by = y + Math.random() * d - d2;
      var bz = z + Math.random() * d - d2;

      var cx = x + Math.random() * d - d2;
      var cy = y + Math.random() * d - d2;
      var cz = z + Math.random() * d - d2;

      positions[ i ]     = ax;
      positions[ i + 1 ] = ay;
      positions[ i + 2 ] = az;

      positions[ i + 3 ] = bx;
      positions[ i + 4 ] = by;
      positions[ i + 5 ] = bz;

      positions[ i + 6 ] = cx;
      positions[ i + 7 ] = cy;
      positions[ i + 8 ] = cz;

      // flat face normals

      pA.set( ax, ay, az );
      pB.set( bx, by, bz );
      pC.set( cx, cy, cz );

      cb.subVectors( pC, pB );
      ab.subVectors( pA, pB );
      cb.cross( ab );

      cb.normalize();

      var nx = cb.x;
      var ny = cb.y;
      var nz = cb.z;

      normals[ i ]     = nx;
      normals[ i + 1 ] = ny;
      normals[ i + 2 ] = nz;

      normals[ i + 3 ] = nx;
      normals[ i + 4 ] = ny;
      normals[ i + 5 ] = nz;

      normals[ i + 6 ] = nx;
      normals[ i + 7 ] = ny;
      normals[ i + 8 ] = nz;

      // colors

      var vx = ( x / n ) + 0.5;
      var vy = ( y / n ) + 0.5;
      var vz = ( z / n ) + 0.5;

      color.setRGB( vx, vy, vz );

      colors[ i ]     = color.r;
      colors[ i + 1 ] = color.g;
      colors[ i + 2 ] = color.b;

      colors[ i + 3 ] = color.r;
      colors[ i + 4 ] = color.g;
      colors[ i + 5 ] = color.b;

      colors[ i + 6 ] = color.r;
      colors[ i + 7 ] = color.g;
      colors[ i + 8 ] = color.b;

    }

    geometry.addAttribute( 'index', new THREE.BufferAttribute( indices, 1 ) );
    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

    geometry.computeBoundingSphere();
    
    return geometry
  }
  _export('TriangleCube', TriangleCube)

})
