_import.module('gol.tick').promise('TickBase', function(_export) {

  var Bodily = _import('Bodily').from('gol.entity'),
      Meshed = _import('Meshed').from('gol.entity'),
      Flock = _import('Flock').from('gol.entity'),
      Tick = _import('Tick').from('gol.tick')

  function TickBase(position) {
    Bodily.call(this, this.mass, new CANNON.Sphere(this.radius));
    this.body.type = CANNON.Body.STATIC
    Meshed.call(this, new THREE.Mesh( 
      new THREE.SphereGeometry(this.radius, 8, 8), 
      new THREE.MeshBasicMaterial({
        color: 0x222222,
        transparent: true,
        opacity: 1
      })
    ));
    this.position = position
    this.flock = new Flock(this)
    TickBase.collection.push(this)
  }
  TickBase.collection = []
  TickBase.prototype = Object.create(Bodily.prototype)
  TickBase.prototype.constructor = TickBase
  Object.defineProperty(TickBase.prototype, 'radius', { value: 1, writable: true })
  Object.defineProperty(TickBase.prototype, 'baseRadius', { value: 5 })
  Object.defineProperty(TickBase.prototype, 'maxRadius', { value: 10 })
  Object.defineProperty(TickBase.prototype, 'mass', { value: 0 })

  TickBase.prototype.isInfant = function() {
    return this.radius < this.baseRadius
  }

  TickBase.prototype.move = function() {
    var i, l, a, c=0;
    if(this.radius < this.maxRadius) {
      for(i=0, l=Tick.collection.length; i<l; i++) {
        a = Tick.collection[i]
        if(a.position.distanceTo(this.position) < this.radius + 2) {
          c += a.velocity.norm2()
        } 
      }
      if(c > this.radius*this.radius) {
        this.radius += .1
        this.refresh()
      }
    }
  }

  TickBase.prototype.refresh = function() {
    var i, l, v, vertices = this._mesh.geometry.vertices;
    for(i=0, l=vertices.length; i<l; i++) {
      v = vertices[i]
      v.setLength(this.radius)
    }
    this.body.shapes[0].radius = this.radius;
    this.body.updateBoundingRadius()
    Meshed.prototype.refresh.call(this)
  }

  TickBase.prototype.tick = function() {
    Bodily.prototype.tick.apply(this, arguments)
    Meshed.prototype.tick.apply(this, arguments)
    if(this.radius*this.baseRadius > this.flock.animals.length) {
      this.flock.create(Tick)
    }
  }

  _export('TickBase', TickBase)
      
});
