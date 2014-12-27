_import.module('gol.animal').promise('Animal', 'animals', 'others', function(_export) {

  var m = _import('math').from('gol'),
      env = _import('env').from('gol'),
      Flock = _import('Flock').from('gol.entity'),
      Entity = _import('Entity').from('gol.entity'),
      ParticleBodily = _import('ParticleBodily').from('gol.entity'),
      Threat = _import('Threat').from('gol.threat'),
      Sphere = _import('Sphere').from('gol.objects'),
      movement = _import('movement').from('gol'),
      others = _import('others').from('gol.life')

  function Animal() {
    Entity.apply(this, arguments)
    this.speed = 40
    this.maxSpeed = 60
    this.move()
  }

  Animal.prototype = Object.create(Entity.prototype)
  
  Animal.prototype.constructor = Animal;

  Animal.prototype.move = function() {
    Entity.prototype.move.apply(this, arguments)
    this.flock.refresh()
  }

  Animal.prototype.preTick = function() {
    this.repelledBy = []
    this.alignedWith = []
    this.acceleration = new THREE.Vector3(0,0,0)
  }

  Animal.prototype.tick = function(diff, now) {
    Entity.prototype.tick.apply(this, arguments)
    
    if(this.flock.threat) {
      this.threaten(this.flock.threat.position)
    } else {
      this.swarm()
      /*
      Math.random() > .75 ? 
        (Math.random() > .5 ? 
          this.stop() :
          this.clamp()) :
        this.swarm()
      */
      others.forEach(function(o) {
        if(this.position.distanceTo(o.position) < this.visibilityRadius) {
          if(o.position.distanceTo(this.base.position) < this.flock.threatRadius) {
            this.flock.threat = o;
          }
        }
      }.bind(this))

    }

  }

  Animal.prototype.stop = function() {
    movement(this.acceleration).decelerate(this.velocity)
  }

  Animal.prototype.threaten = function(target) {
    var i = this.flock.animals.indexOf(this),
        variance = Math.sqrt(this.flock.animals.length),
        flockPos = new THREE.Vector3(Math.floor(i/variance)-variance/2, i%variance - variance/2,0),
        d = flockPos.length(),
        baseToTarget = target.clone().sub(this.base.position),
        absPointBetween = this.base.position.clone().add(baseToTarget.multiplyScalar(.5)),
        dir = new THREE.Matrix4().lookAt(this.base.position, target, m.up)

    flockPos.transformDirection(dir).setLength(d)
    var pointPosBetween = absPointBetween.add(flockPos)
    
    this.acceleration
      .add(movement()
          .gravity(this.position, pointPosBetween, this.speed)
          .limit(this.maxSpeed)
          .value())

    movement(this.velocity).decelerateAtAngle(this.velocity, pointPosBetween.clone().sub(this.position), THREE.Math.degToRad(90))

  }

  Animal.prototype.fall = function() {
    this.acceleration.add(
      movement()
      .gravity(this.position, this.base.position, this.speed*10)
      .value()
    )
  }

  Animal.prototype.clamp = function() {
    
    var baseTooClose = [], baseWayTooFar = [], baseTooFar = [],
        distToBase = this.base.position.distanceTo(this.position),
        baseRadius = this.base._mesh.geometry.boundingSphere.radius;

    if (distToBase < baseRadius)
      baseTooClose.push(this.base)

    else if (distToBase > baseRadius*4)
      baseWayTooFar.push(this.base)

    else if (distToBase > baseRadius)
      baseTooFar.push(this.base)

    this.acceleration.add(
      movement()
      .encircle(this.position, this.base.position, this.speed)
      .approach(this.position, baseTooFar, this.speed)
      .limit(this.maxSpeed)
      .approach(this.position, baseWayTooFar, this.speed*10)
      .value()
    )
  }

  Animal.prototype.swarm = function() {
    var a = this.flock.animals,
        i = a.indexOf(this),
        l = a.length,
        approach = [
          a[(i + Math.floor(l/2))%l]
        ],
        alignWith = [
          a[(i + 2)%l],
          a[i - 2] || a[l + (i - 2)]
        ]

    this.acceleration.add(
      movement().align(alignWith).limit(this.speed/2).value())
    this.acceleration.add(
      movement()
      .approach(this.position, approach, this.speed)
      .limit(this.maxSpeed)
      .gravity(this.position, this.base.position, this.speed)
      .decelerateAtLimit(this.position, this.base.position, this.visibilityRadius, this.velocity)
      .value())

    //movement(this.velocity).decelerateAtAngle(this.velocity, this.base.position.clone().sub(this.position), THREE.Math.degToRad(90))
  }

  Animal.prototype.swarm2 = function() {
    var repelFrom = [], alignWith = [], approach = [], 
        animals = this.flock.animals, 
        i = animals.indexOf(this), 
        l = animals.length, 
        e, d;
    
    for(i=0; i<l; i++) {
      e = animals[i]
      if(e != this) {
        d = this.position.distanceTo(e.position)
        
        if(d < this.repelRadius) {
          repelFrom.push(e)
        } 

        else if(d < this.alignRadius) {
          if(e.alignedWith.indexOf(this) == -1) {
            alignWith.push(e)
          }
        } 

        else {
          if(d < this.visibilityRadius) {
            approach.push(e)
          }
        }
      } 
    }


    var baseTooClose = [], baseTooFar = [],
        distToBase = this.base.position.distanceTo(this.position),
        baseRadius = this.base._mesh.geometry.boundingSphere.radius;

    if (distToBase < baseRadius)
      baseTooClose.push(this.base)

    else if (distToBase > this.visibilityRadius*2)
      baseTooFar.push(this.base)

    if(baseTooFar.length) {
       this.acceleration
        .add(movement().gravity(this.position, this.base.position, this.speed).limit(this.maxSpeed).value())
    } else {
      this.acceleration.add(
        movement()
        .repel(this.position, repelFrom, this.speed)
        .align(alignWith)
        .approach(this.position, approach, this.speed*.5)
        .limit(this.maxSpeed)
        .decelerateAtLimit(this.position, this.base.position, this.visibilityRadius, this.velocity)
        .value())
      movement(this.velocity).decelerateAtAngle(this.velocity, this.base.position.clone().sub(this.position), THREE.Math.degToRad(180))
    }

    this.alignedWith = alignWith

  }

  Object.defineProperty(Animal.prototype, 'repelRadius', { value: 5 });
  Object.defineProperty(Animal.prototype, 'alignRadius', { value: 15 });
  Object.defineProperty(Animal.prototype, 'visibilityRadius', { value: 40 });
  Object.defineProperty(Animal.prototype, 'flock', { value: new Flock(), writable: true })

  _export('Animal', Animal)

})
