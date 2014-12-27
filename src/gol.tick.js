_import.module('gol.tick').promise('Tick', 'TickBase', function(_export) {

  var m = _import('math').from('gol'),
      Flocky = _import('Flocky').from('gol.entity'),
      Bodily = _import('Bodily').from('gol.entity'),
      Meshed = _import('Meshed').from('gol.entity'),
      ParticleBodily = _import('ParticleBodily').from('gol.entity'),
      movement = _import('movement').from('gol'),
      others = _import('others').from('gol.life')

  function Tick() {
    ParticleBodily.call(this, 1)
    Flocky.apply(this, arguments)
  }

  Tick.prototype = Object.create(ParticleBodily.prototype)
  Tick.prototype.constructor = Tick

  Object.defineProperty(Tick.prototype, 'speed', { value: 1 });
  Object.defineProperty(Tick.prototype, 'repelRadius', { value: 5 });
  Object.defineProperty(Tick.prototype, 'alignRadius', { value: 15 });
  Object.defineProperty(Tick.prototype, 'visibilityRadius', { value: 40 });

  Tick.prototype.move = function() {
    ParticleBodily.prototype.move.apply(this, arguments)
    this.flock.refresh()
    if(this.flock.threat) {
      if(this.flock.threat.position.distanceTo(this.base.position) < this.visibilityRadius) {
        this.attack(this.flock.threat)
      } else {
        this.threaten(this.flock.threat)
      }
    } else {
      this.swarm()
      others.forEach(function(o) {
        if(!(o instanceof TickBase)) {
        if(o.position.distanceTo(this.position) < this.visibilityRadius) {
          if(o.position.distanceTo(this.base.position) < this.flock.threatRadius) {
            this.flock.threat = o;
          }
        }}
      }.bind(this))
    }
  }

  Tick.prototype.clamp = function() {
    
    var baseTooClose = [], baseWayTooFar = [], baseTooFar = [],
        distToBase = this.base.position.distanceTo(this.position),
        baseRadius = this.base._mesh.geometry.boundingSphere.radius;

    if (distToBase < baseRadius)
      baseTooClose.push(this.base)

    else if (distToBase > baseRadius*4)
      baseWayTooFar.push(this.base)

    else if (distToBase > baseRadius)
      baseTooFar.push(this.base)

    var p = new THREE.Vector3(this.position.x, this.position.y, this.position.z)
    this.body.applyForce(
      movement()
      .encircle(p, this.base.position, this.speed)
      .approach(p, baseTooFar, this.speed)
      .limit(10)
      .approach(p, baseWayTooFar, this.speed*10)
      .value(),
      this.position
    )
  }

  Tick.prototype.fall = function() {
    var p = new THREE.Vector3(this.position.x, this.position.y, this.position.z)
    this.body.applyForce(
      movement()
      .gravity(p, this.base.position, this.speed*10)
      .value(), 
    this.position
    )
  }

  Tick.prototype.attack = function(target) {
    this.body.applyForce(
      movement()
        .gravity(this.position, target.position, this.speed*10)
        .value(),
      this.position)
    
  }

  Tick.prototype.threaten = function(target) {
    var i = this.flock.animals.indexOf(this),
        variance = Math.sqrt(this.flock.animals.length),
        flockPos = new THREE.Vector3(Math.floor(i/variance)-variance/2, i%variance - variance/2,0),
        d = flockPos.length(),
        t = new THREE.Vector3(target.position.x, target.position.y, target.position.z),
        baseToTarget = t.clone().sub(this.base.position),
        absPointBetween = this.base.position.clone().vadd(baseToTarget.multiplyScalar(.5)),
        dir = new THREE.Matrix4().lookAt(this.base.position, t, m.up)

    flockPos.transformDirection(dir).setLength(d)
    var pointPosBetween = absPointBetween.vadd(flockPos)
    
    this.body.applyForce(
      movement()
        .gravity(this.position, pointPosBetween, this.speed)
        .limit(this.maxSpeed)
        .value(),
      this.position)

    this.body.applyForce(
      movement()
        .decelerateAtAngle(this.velocity.clone().scale(40), pointPosBetween.clone().vsub(this.position), THREE.Math.degToRad(90))
        .value(),
      this.position
    )
    
  }

  Tick.prototype.swarm = function() {
    var a = this.flock.animals,
        i = a.indexOf(this),
        l = a.length,
        approach = [
          a[(i + Math.floor(l/2))%l]
        ],
        alignWith = [
          a[(i + 2)%l],
          a[i - 2] || a[l + (i - 2)]
        ],
        p = this.position,
        v = this.velocity

    this.body.applyForce(
      movement().align(alignWith).limit(this.speed/2).value(),
      this.position)
    this.body.applyForce(
      movement()
      .approach(p, approach, this.speed)
      .limit(10)
      .gravity(p, this.base.position, this.speed)
      .decelerateAtLimit(p, this.base.position, this.visibilityRadius, v)
      .value(),
      this.position)

  }

  _export('Tick', Tick)




  function TickBase() {
    Bodily.call(this, this.mass, new CANNON.Sphere(this.radius));
    Meshed.call(this, new THREE.Mesh( 
      new THREE.SphereGeometry(this.radius, 32, 32), 
      new THREE.MeshBasicMaterial({
        color: 0x222222,
        transparent: true,
        opacity: 1
      })
    ));
  }
  TickBase.prototype = Object.create(Bodily.prototype)
  TickBase.prototype.constructor = TickBase
  Object.defineProperty(TickBase.prototype, 'radius', { value: 10 })
  Object.defineProperty(TickBase.prototype, 'mass', { value: 0 })

  TickBase.prototype.move = function() {}
  TickBase.prototype.tick = function() {
    Bodily.prototype.tick.apply(this, arguments)
    Meshed.prototype.tick.apply(this, arguments)
  }

  _export('TickBase', TickBase)
    
})
