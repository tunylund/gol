_import.module('gol.entity').promise('Flock', 'Flocky', function(_export) {

  var env = _import('env').from('gol'),
      m = _import('math').from('gol')

  function isBadPosition(pos, collection) {
    var isBad = _.filter(collection, function(b) {
      return new THREE.Sphere(b.position, b.radius).distanceToPoint(pos) < 0
    }).length > 0
    return isBad
  }

  function Flock(base) {
    this.animals = [];
    this.matedWith = [];
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

    Flock.collection.push(this)
    
  }

  Flock.prototype.create = function(Flocky) {
    var a = new Flocky()
    a.position =
      this.base.position.clone()
        .vadd(new THREE.Vector3(
            m.pn(m.r(32)), 
            m.pn(m.r(32)), 
            m.pn(m.r(32))
           ).setLength(this.base.radius+1))
    a.base = this.base;

    while(isBadPosition(a.position, a.base.constructor.collection)) {
      a.position = a.position.vadd(m.one)
    }

    this.append(a)
  }

  Flock.prototype.append = function(animal) {
    this.animals.push(animal)
    animal.flock = this

    var geometry = new THREE.Geometry();
    for(var i=0, l=this.animals.length; i<l; i++) {
      geometry.vertices.push(this.animals[i].vertice)
    }
    
    this.pointCloud.material.attributes.size.value.push(animal.size)
    env.scene.remove(this.pointCloud)
    this.pointCloud = new THREE.PointCloud(geometry, this.pointCloud.material)
    env.scene.add(this.pointCloud)
  }

  Flock.prototype.refresh = function() {
    this.pointCloud.geometry.verticesNeedUpdate = true
  }

  Object.defineProperty(Flock.prototype, 'threatRadius', { value: 200 });
  
  Flock.prototype.mate = function(flock, position) { 
    if(this.mateWith == flock) return;
    if(flock) {
      this.mateWith = flock
      this.matePos = position;
      flock.mate(this, position)
    } else {
      var f = this.mateWith;
      this.mateWith = this.matePos = null;
      f && f.mate(null)
    }
  }

  Flock.prototype.threaten = function(value) {
    this.threat = value
    this.mate(null)
  }

  Flock.prototype.move = function() {
    if(this.threat) {
      if(this.threat.position.distanceTo(this.base.position) > this.threatRadius) {
        this.threat = null
      } 
    }
    if(this.nurture) {
      if(!this.nurture.isInfant()) {
        this.nurture = null
      }
    }
    if(this.mateWith) {
      if(isBadPosition(this.matePos, this.base.constructor.collection)) {
        this.mate(null)
      } else {
        var i, l, a, c=0;
        for(i=0, l=this.mateWith.animals.length; i<l; i++) {
          if(this.mateWith.animals[i].position.distanceTo(this.matePos) < 10) c++;
        }
        for(i=0, l=this.animals.length; i<l; i++) {
          if(this.animals[i].position.distanceTo(this.matePos) < 10) c++;
        }
        if(c >= (this.animals.length + this.mateWith.animals.length)*.75) {
          new this.base.constructor(this.matePos)
          this.mate(null)
        }
      }
    }
  }
  
  Flock.prototype.tick = function(){}

  Flock.collection = []

  _export('Flock', Flock)


  function Flocky() {}
  Flocky.prototype.move = function() {}
  _export('Flocky', Flocky)

});
