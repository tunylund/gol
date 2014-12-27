_import.module('gol.entity').promise('Flock', 'Flocky', function(_export) {

  var env = _import('env').from('gol'),
      m = _import('math').from('gol')

  function Flock(Flocky, count, base) {
    this.animals = [];
    this.base = base;

    var geometry = new THREE.Geometry(),
        material = new THREE.RawShaderMaterial({
          attributes: {
            size: { type: 'f', value: [] }
          },
          uniforms: {
            time: { type: "f", value: 1.0 },
            resolution: { type: "v3", value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1)}
          },
          vertexShader: document.getElementById( 'vertexshader.glsl' ).textContent,
          fragmentShader: document.getElementById( 'fragmentshader.glsl' ).textContent,
          side: THREE.DoubleSide
        });

    this.pointCloud = new THREE.PointCloud(geometry, material)
    env.scene.add(this.pointCloud)

    while(this.animals.length < (count || 0)) {
      var a = new Flocky()
      if(base) {
        a.position =
          base.position.clone()
            .vadd(new THREE.Vector3(
                m.pn(m.r(32)), 
                m.pn(m.r(32)), 
                m.pn(m.r(32))
               ).setLength(base.radius))
        a.base = base;
      }
      this.append(a)
    }

    Flock.collection.push(this)
    
  }

  Flock.prototype.append = function(animal) {
    this.animals.push(animal)
    animal.flock = this
    this.pointCloud.geometry.vertices.push(animal.vertice)
    this.pointCloud.material.attributes.size.value.push(animal.size)
  }

  Flock.prototype.refresh = function() {
    this.pointCloud.geometry.verticesNeedUpdate = true
  }

  Object.defineProperty(Flock.prototype, 'threatRadius', { value: 200 });

  Flock.prototype.move = function() {
    if(this.threat) {
      if(this.threat.position.distanceTo(this.base.position) > this.threatRadius) {
        this.threat = null
      } 
    }
  }
  Flock.prototype.tick = function(){}

  Flock.collection = []

  _export('Flock', Flock)


  function Flocky() {}
  Flocky.prototype.move = function() {
    
  }
  _export('Flocky', Flocky)

});
