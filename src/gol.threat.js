_import.module('gol.threat').promise('Threat', 'TriangleThreat', function(_export) {

  var env = _import('env').from('gol'), 
      m = _import('math').from('gol'), 
      Bodily = _import('Bodily').from('gol.entity'),
      Meshed = _import('Meshed').from('gol.entity'),
      movement = _import('movement').from('gol'),
      TriangleCube = _import('TriangleCube').from('gol.shapes'),
      ThreatMaterial = _import('ThreatMaterial').from('gol.shapes')

  function Threat(Victim) {
    Bodily.call(this, 20, new CANNON.Box(new CANNON.Vec3(5, 5, 5)))
    Meshed.call(this, new THREE.Mesh( 
      new THREE.BoxGeometry(10, 10, 10), 
      new THREE.MeshBasicMaterial({
        color: 0x99ff99,
        transparent: true,
        opacity: .8
      })
    ));
    this.Victim = Victim
    this.maxSpeed = 20
    this.position = movement().random(10).value()
    Threat.collection.push(this)
  }
  Threat.collection = []

  Threat.prototype = Object.create(Bodily.prototype)
 
  Threat.prototype.constructor = Threat;

  Threat.prototype.preTick = function() {
    this.acceleration = new THREE.Vector3(0,0,0)
  }

  Threat.prototype.move = function() {
    if(this.velocity.norm () < 5 || Math.random() > .75) {
      var m = movement(this.velocity).random(40).value()
      m.z = 0
      this.body.applyForce(m, this.position)
    }
    for(var i=0, l=this.Victim.collection.length; i<l; i++) {
      var o = this.Victim.collection[i]
      if(o.position.distanceTo(this.position) < 100) {
        this.body.applyForce(
          movement().gravity(this.position, o.position, 10).value(),
          this.position)
      }
    }

    if(this.position.distanceTo(new THREE.Vector3()) > 80) {
      this.body.applyForce(
        movement().gravity(this.position, new THREE.Vector3(), 10).value(),
        this.position)
    }

  }

  Threat.prototype.tick = function(diff, now) {
    Bodily.prototype.tick.apply(this, arguments);
    Meshed.prototype.tick.apply(this, arguments)
  }

  _export('Threat', Threat)




  function TriangleThreat(Victim) {
    Bodily.call(
      this, 
      this.mass, 
      new CANNON.Sphere(this.radius))

    this.Victim = Victim

    this.render()

    this.position = movement().random(2).value()
    Threat.collection.push(this)

    /*
    this.collision = new THREE.Mesh(new THREE.BoxGeometry(this.radius, this.radius, this.radius), new THREE.MeshBasicMaterial({
      color: 0x66ff66,
      transparent: true,
      opacity: .5
    }))
    env.scene.add(this.collision)
    */
  }

  TriangleThreat.prototype = Object.create(Bodily.prototype)
  TriangleThreat.prototype.constructor = TriangleThreat;
  Object.defineProperty(TriangleThreat.prototype, 'radius', { value: 6, writable: true });
  Object.defineProperty(TriangleThreat.prototype, 'mass', { value: 1, writable: true });
  Object.defineProperty(TriangleThreat.prototype, 'speed', { value: 20 });
  Object.defineProperty(TriangleThreat.prototype, 'visibilityRadius', { value: 500 });
  Object.defineProperty(TriangleThreat.prototype, 'biteDistance', { value: 1 });

  TriangleThreat.prototype.render = function() {
    if(this._mesh) Meshed.prototype.destroy.call(this)
    if(!this.material) {
      this.material = ThreatMaterial()
    }
    Meshed.call(this, new THREE.Mesh(new THREE.SphereGeometry(this.radius, 12, 12), this.material));
  }

  TriangleThreat.prototype.refresh = function() {
    this.body.mass = this.mass
    //circle-body
    this.body.shapes[0].radius = this.radius;
    //cube-body
    //this.body.shapes[0].halfExtents.set(this.radius*.5, this.radius*.5, this.radius*.5);
    this.body.updateBoundingRadius()
    this.body.updateMassProperties()
    
    var i, l, v, vertices = this._mesh.geometry.vertices;
    for(i=0, l=vertices.length; i<l; i++) {
      v = vertices[i]
      v.setLength(this.radius)
    }
    Meshed.prototype.refresh.call(this)

  }

  TriangleThreat.prototype.grow = function() {
    this.radius = this.radius+1
    this.mass = this.mass+.1
    this.refresh()
  }

  TriangleThreat.prototype.shrink = function() {
    if(this.radius > 1) {
      this.radius = this.radius-.2
      this.mass = this.mass-.02
      this.refresh()
    }
  }

  TriangleThreat.prototype.move = function() {
    if(!this.attack()) {
      this.wander()
    }
    this.keepCloseToHome()
    this.keepCloseToZOrigin()
  }

  TriangleThreat.prototype.keepCloseToZOrigin = function() {
    if(this.position.z != 0) {
      var zZero = this.position.clone(),
          zVelo = this.velocity.z,
          zPos = this.position.z
      zZero.z = 0
      if(m.sign(zVelo) == m.sign(zPos)) {
        this.body.applyForce(
          movement().decelerate(new CANNON.Vec3(0, 0, zVelo)).value(),
          this.position
        )
      }
      this.body.applyForce(
        movement()
          .gravity(this.position, zZero, this.speed).value(), 
        this.position)
    }
  }

  TriangleThreat.prototype.wander = function() {
    if(this.velocity.norm () < 5 || Math.random() > .75) {
      var m = movement(this.velocity).random(this.speed).value()
      m.z = 0
      this.body.applyForce(m, this.position)
    }
  }

  TriangleThreat.prototype.attack = function() {
    var closestVictim, closestVictimDistance, 
        distance, i, l, o;
    for(i=0, l=this.Victim.collection.length; i<l; i++) {
      o = this.Victim.collection[i]
      distance = o.position.distanceTo(this.position)
      if(distance < this.visibilityRadius) {
        if(!closestVictim || closestVictimDistance > distance) {
          closestVictim = o
          closestVictimDistance = distance
        }
      }
      if(distance < this.radius + o.radius + this.biteDistance) {
        this.bite(o)
      }
    }

    if(closestVictim) {
      this.body.applyForce(
        movement().gravity(this.position, closestVictim.position, this.speed).value(), 
        this.position
      )
      this.body.applyForce(
        movement().decelerateAtAngle(this.velocity.clone().unit().scale(this.speed), closestVictim.position, THREE.Math.degToRad(90)).value(),
        this.position
      )
    }
    return closestVictim;
  }

  TriangleThreat.prototype.keepCloseToHome = function() {
    if(this.position.distanceTo(new THREE.Vector3()) > this.visibilityRadius/2) {
      this.body.applyForce(
        movement().gravity(this.position, new THREE.Vector3(), this.speed).value(),
        this.position)
    }
  }

  TriangleThreat.prototype.bite = function(victim) {
    victim.shrink()
    if(victim.radius > 0) {
      this.grow()
    }
  }

  TriangleThreat.prototype.tick = function(diff, now) {
    Bodily.prototype.tick.apply(this, arguments);
    Meshed.prototype.tick.apply(this, arguments)
    this.material.uniforms.time.value = now

    //if(this.target) this._mesh.lookAt(this.target.position)

    /*
    var i, l, v, vertices = this.collision.geometry.vertices;
    for(i=0, l=vertices.length; i<l; i++) {
      v = vertices[i]
      v.setLength(this.radius)
    }
    this.collision.position.x = this.position.x
    this.collision.position.y = this.position.y
    this.collision.position.z = this.position.z
    */
  }
  _export('TriangleThreat', TriangleThreat)

})
