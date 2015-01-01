_import.module('gol.tick').promise('Tick', function(_export) {

  var m = _import('math').from('gol'),
      Flock = _import('Flock').from('gol.entity'),
      Flocky = _import('Flocky').from('gol.entity'),
      Threat = _import('Threat').from('gol.threat'),
      ParticleBodily = _import('ParticleBodily').from('gol.entity'),
      movement = _import('movement').from('gol')

  function Tick() {
    ParticleBodily.call(this, 1)
    Flocky.apply(this, arguments)
    Tick.collection.push(this)
  }

  Tick.prototype = Object.create(ParticleBodily.prototype)
  Tick.prototype.constructor = Tick
  Tick.collection = []

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
    } 

    if(this.flock.nurture) {
      this.nurture(this.flock.nurture)
      this.lookForThreats()
    }

    else if(this.flock.mateWith) {
      this.mate(this.flock.matePos)
      this.lookForThreats()
    } 

    else {
      this.swarm()
      this.lookForThreats() || this.lookForInfantBases() || this.lookForMates()
    }
  }

  Tick.prototype.lookForThreats = function() {
    var i, l, o;
    for(i=0, l=Threat.collection.length; i<l; i++) {
      o = Threat.collection[i]
      if(o.position.distanceTo(this.position) < this.visibilityRadius) {
        if(o.position.distanceTo(this.base.position) < this.flock.threatRadius) {
          this.flock.threaten(o);
        }
      }
    }
    return this.flock.threat
  }

  Tick.prototype.lookForInfantBases = function() {
    var i, l, bases = this.base.constructor.collection, b;

    if(this.base.isInfant()) {
      this.flock.nurture = this.base
    } else  {
      for(i=0, l=bases.length; i<l; i++) {
        b = bases[i]
        if(b.position.distanceTo(this.position) < this.visibilityRadius && b.isInfant()) {
          this.flock.nurture = b
          break;
        }
      }
    }
    return this.flock.nurture
  }

  Tick.prototype.lookForMates = function() {
    if(this.base.constructor.collection.length > 6) return false;
    var i, l, f, flocks = Flock.collection, a, j, k;
    for(i=0, l=flocks.length; i<l; i++) {
      f = flocks[i]
      if(f != this.flock) {
      if(!f.mateWith) {
      if(this.flock.matedWith.indexOf(f) == -1) {
        for(j=0, k=f.animals.length; j<k; j++) {
          a = f.animals[j]
          if(a.position.distanceTo(this.position) < this.visibilityRadius) {
            this.flock.mate(f, a.position.clone())
            break;
          }
        }
      }}}
      if(this.flock.mateWith) break;
    }
    return !!this.flock.mateWith
  }

  Tick.prototype.mate = function(position) {
    this.body.applyForce(
      movement().gravity(this.position, position, this.speed*2).value(),
      this.position)
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

  Tick.prototype.nurture = function(target) {
    if(this.position.distanceTo(this.base.position) < this.base.radius+1) {
      this.body.applyForce(
      movement()
      .gravity(this.position, target.position, this.speed*-2)
      .value(), 
      this.position)
    } else {
      this.body.applyForce(
        movement()
        .gravity(this.position, target.position, this.speed*10)
        .value(), 
        this.position)
    }
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
        l = this.flock.animals.length,
        theta = i * m.goldenAngle,
        r = Math.sqrt(i) / Math.sqrt(l),
        flockPos = new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), 0),
        t = new THREE.Vector3(target.position.x, target.position.y, target.position.z),
        baseToTarget = t.clone().sub(this.base.position),
        absPointBetween = this.base.position.clone().vadd(baseToTarget.multiplyScalar(.5)),
        dir = new THREE.Matrix4().lookAt(this.base.position, t, m.up)


    flockPos.transformDirection(dir).multiplyScalar(i*.25)
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
        alignWith = a.length > 1 ? [
          a[(i + 2)%l],
          a[i - 2] || a[l + (i - 2)]
        ] : [],
        p = this.position,
        v = this.velocity

    this.body.applyForce(
      movement().align(alignWith).limit(this.speed/2).value(),
      this.position)
    this.body.applyForce(
      movement()
      .approach(p, approach, this.speed)
      .limit(10)
      .random(4)
      .gravity(p, this.base.position, this.speed)
      .decelerateAtLimit(p, this.base.position, this.visibilityRadius, v)
      .value(),
      this.position)

  }

  _export('Tick', Tick)

})
