_import.module('gol.entity').promise('Entity', 'Meshed', 'Bodily', 'ParticleBodily', function(_export) {

  var env = _import('env').from('gol')

  function Entity(parent){
    this.id = _.uniqueId('e')
    this.parent = parent
    this.children = []
    this.speed = 0
    this.maxSpeed = 0
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, 0, 0);
  }

  Entity.prototype.tick = function(now, diff) {
    _.invoke(this.children, 'tick', now, diff)
  }

  Entity.prototype.move = function(diff) {
    var t = (diff||0)/1000
    this.velocity.add(this.acceleration.clone().multiplyScalar(t)).clampScalar(-this.maxSpeed, this.maxSpeed)
    this.position.add(this.velocity.clone().multiplyScalar(t))
    _.invoke(this.children, 'follow', diff)
  }

  Entity.prototype.follow = function() {
    this.position.x = this.parent.position.x
    this.position.y = this.parent.position.y
    this.position.z = this.parent.position.z
  }

  Entity.prototype.hitTest = function(b) {
    return this.hitArea.intersectsSphere(b.hitArea);
  }

  Object.defineProperty(Entity.prototype, 'speed', {
    writable: true
  });

  Object.defineProperty(Entity.prototype, 'maxSpeed', {
    writable: true
  });

  Object.defineProperty(Entity.prototype, 'acceleration', {
    writable: true
  });

  Object.defineProperty(Entity.prototype, 'velocity', {
    writable: true
  });

  Object.defineProperty(Entity.prototype, 'position', {
    writable: true
  });

  Object.defineProperty(Entity.prototype, 'parent', {
    writable: true
  });

  Object.defineProperty(Entity.prototype, 'children', {
    writable: true
  });

  Object.defineProperty(Entity.prototype, 'size', {
    value: 1.0,
    writable: true
  });

  Object.defineProperty(Entity.prototype, 'hitArea', {
    writable: true
  });

  _export('Entity', Entity)



  function Meshed(mesh) {
    this._mesh = mesh
    env.scene.add(this._mesh);
  }
  Meshed.prototype.tick = function() {
    this._mesh.position.x = this.position.x
    this._mesh.position.y = this.position.y
    this._mesh.position.z = this.position.z
    this._mesh.quaternion.set(
      this.body.quaternion.x,
      this.body.quaternion.y,
      this.body.quaternion.z,
      this.body.quaternion.w
    )
  }
  Meshed.prototype.refresh = function() {
    this._mesh.geometry.verticesNeedUpdate = true
  }
  _export('Meshed', Meshed)



  function Bodily(mass, shape) {
    this.body = new CANNON.Body({
      mass: mass
    });
    this.body.addShape(shape);
    env.world.add(this.body);
  }
  Bodily.prototype.tick = function() {}
  Object.defineProperty(Bodily.prototype, 'position', {
    get: function() {
      return this.body.position
    },
    set: function(value) {
      this.body.position.set(value.x, value.y, value.z)
    }
  });
  Object.defineProperty(Bodily.prototype, 'velocity', {
    get: function() {
      return this.body.velocity
    }
  })
  _export('Bodily', Bodily)



  function ParticleBodily(mass) {
    Bodily.call(this, mass, new CANNON.Particle())
    env.sph.add(this.body);
    this.vertice = new THREE.Vector3()
  }
  ParticleBodily.prototype = Object.create(Bodily.prototype)
  ParticleBodily.prototype.constructor = ParticleBodily;
  ParticleBodily.prototype.move = function() {}
  ParticleBodily.prototype.tick = function() {
    Bodily.prototype.tick.apply(this)
    this.vertice.x = this.position.x
    this.vertice.y = this.position.y
    this.vertice.z = this.position.z
  }
  Object.defineProperty(ParticleBodily.prototype, 'size', {
    value: 1.0,
    writable: true
  });
  _export('ParticleBodily', ParticleBodily)


})