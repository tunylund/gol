_import.module('gol.threat').promise('Threat', function(_export) {

  var env = _import('env').from('gol'), 
      Bodily = _import('Bodily').from('gol.entity'),
      Meshed = _import('Meshed').from('gol.entity'),
      movement = _import('movement').from('gol')

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

})
