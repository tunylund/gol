var expect = chai.expect;

var movement = _import('movement').from('gol')

describe('movement', function(){

  describe('encircle', function(){

    it('should encircle on x axis', function(){
      var pos = new THREE.Vector3(),
          target = new THREE.Vector3(1,0,0),
          mov = movement().encircle(pos, target, 1).value()

      expect(mov.x).to.equal(0)
      expect(mov.y).to.equal(0)
      expect(mov.z).to.equal(1)
    })

    it('should encircle on y axis', function(){
      var pos = new THREE.Vector3(),
          target = new THREE.Vector3(0,1,0),
          mov = movement().encircle(pos, target, 1).value()

      expect(mov.x).to.equal(0)
      expect(mov.y).to.equal(0)
      expect(mov.z).to.equal(-1)
    })

    it('should encircle on z axis', function(){
      var pos = new THREE.Vector3(),
          target = new THREE.Vector3(0,0,1),
          mov = movement().encircle(pos, target, 1).value()

      expect(mov.x).to.equal(-1)
      expect(mov.y).to.equal(0)
      expect(mov.z).to.equal(0)
    })

  })

  describe('gravity', function() {
    it('should fall on x axis', function(){
      var pos = new THREE.Vector3(),
          target = new THREE.Vector3(1,0,0),
          mov = movement().gravity(pos, target, 1).value()

      expect(mov.x).to.equal(1)
      expect(mov.y).to.equal(0)
      expect(mov.z).to.equal(0)
    })
    it('should fall on y axis', function(){
      var pos = new THREE.Vector3(),
          target = new THREE.Vector3(0,1,0),
          mov = movement().gravity(pos, target, 1).value()

      expect(mov.x).to.equal(0)
      expect(mov.y).to.equal(1)
      expect(mov.z).to.equal(0)
    })
    it('should fall on z axis', function(){
      var pos = new THREE.Vector3(),
          target = new THREE.Vector3(0,0,1),
          mov = movement().gravity(pos, target, 1).value()

      expect(mov.x).to.equal(0)
      expect(mov.y).to.equal(0)
      expect(mov.z).to.equal(1)
    })
    it('should fall on xyz axis', function(){
      var pos = new THREE.Vector3(),
          target = new THREE.Vector3(1,1,1),
          mov = movement().gravity(pos, target, 1).value(),
          d = new THREE.Vector3(1,1,1).normalize()

      expect(mov.x).to.equal(d.x)
      expect(mov.y).to.equal(d.y)
      expect(mov.z).to.equal(d.z)
    })
  })

  describe('repel', function() {
    it('should repel on x axis', function(){
      var pos = new THREE.Vector3(),
          target = new THREE.Vector3(1,0,0),
          mov = movement().repel(pos, [{position: target}], 1).value()

      expect(mov.x).to.equal(-1)
      expect(mov.y).to.equal(0)
      expect(mov.z).to.equal(0)
    })
    it('should repel on y axis', function(){
      var pos = new THREE.Vector3(),
          target = new THREE.Vector3(0,1,0),
          mov = movement().repel(pos, [{position: target}], 1).value()

      expect(mov.x).to.equal(0)
      expect(mov.y).to.equal(-1)
      expect(mov.z).to.equal(0)
    })
    it('should repel on z axis', function(){
      var pos = new THREE.Vector3(),
          target = new THREE.Vector3(0,0,1),
          mov = movement().repel(pos, [{position: target}], 1).value()

      expect(mov.x).to.equal(0)
      expect(mov.y).to.equal(0)
      expect(mov.z).to.equal(-1)
    })
    it('should repel on xyz axis', function(){
      var pos = new THREE.Vector3(),
          target = new THREE.Vector3(1,1,1),
          mov = movement().repel(pos, [{position: target}], 1).value(),
          d = new THREE.Vector3(-1,-1,-1).normalize()

      expect(mov.x).to.equal(d.x)
      expect(mov.y).to.equal(d.y)
      expect(mov.z).to.equal(d.z)
    })
  })

  describe('align', function() {
    it('should align on xyz axis', function(){
      var vel = new THREE.Vector3(1,1,1),
          mov = movement().align([{velocity: vel}]).value(),
          d = new THREE.Vector3(1,1,1)

      expect(mov.x).to.equal(d.x)
      expect(mov.y).to.equal(d.y)
      expect(mov.z).to.equal(d.z)
    })
  })

  describe('decelerateAtLimit', function() {
    it('should decelerateAtLimit on x axis', function(){
      var pos = new THREE.Vector3(0,0,0),
          target = new THREE.Vector3(1,0,0),
          vel = new THREE.Vector3(2,0,0),
          limit = .5,
          mov = movement().decelerateAtLimit(pos, target, limit, vel).value(),
          d = new THREE.Vector3(-.5,0,0)

      expect(mov.x).to.equal(d.x)
      expect(mov.y).to.equal(d.y)
      expect(mov.z).to.equal(d.z)
    })
    it('should decelerateAtLimit on y axis', function(){
      var pos = new THREE.Vector3(0,0,0),
          target = new THREE.Vector3(0,1,0),
          vel = new THREE.Vector3(0,2,0),
          limit = .5,
          mov = movement().decelerateAtLimit(pos, target, limit, vel).value(),
          d = new THREE.Vector3(0,-.5,0)

      expect(mov.x).to.equal(d.x)
      expect(mov.y).to.equal(d.y)
      expect(mov.z).to.equal(d.z)
    })
    it('should decelerateAtLimit on xyz axis', function(){
      var pos = new THREE.Vector3(0,0,0),
          target = new THREE.Vector3(1,1,1).normalize(),
          vel = new THREE.Vector3(1,1,1).setLength(2),
          limit = .5,
          mov = movement().decelerateAtLimit(pos, target, limit, vel).value(),
          d = new THREE.Vector3(-1,-1,-1).setLength(.5)

      expect(mov.x).to.equal(d.x)
      expect(mov.y).to.equal(d.y)
      expect(mov.z).to.equal(d.z)
    })
    it('should not decelerateAtLimit on too close', function(){
      var pos = new THREE.Vector3(0,0,0),
          target = new THREE.Vector3(1,0,0),
          vel = new THREE.Vector3(2,0,0),
          limit = 1.5,
          mov = movement().decelerateAtLimit(pos, target, limit, vel).value(),
          d = new THREE.Vector3()

      expect(mov.x).to.equal(d.x)
      expect(mov.y).to.equal(d.y)
      expect(mov.z).to.equal(d.z)
    })
  })

  describe('decelerateWithinLimit', function() {
    it('should decelerateWithinLimit on x axis', function(){
      var pos = new THREE.Vector3(0,0,0),
          target = new THREE.Vector3(1,0,0),
          vel = new THREE.Vector3(2,0,0),
          limit = 1.5,
          mov = movement().decelerateWithinLimit(pos, target, limit, vel).value(),
          d = new THREE.Vector3(-.5,0,0)

      expect(mov.x).to.equal(d.x)
      expect(mov.y).to.equal(d.y)
      expect(mov.z).to.equal(d.z)
    })
    it('should decelerateWithinLimit on y axis', function(){
      var pos = new THREE.Vector3(0,0,0),
          target = new THREE.Vector3(0,1,0),
          vel = new THREE.Vector3(0,2,0),
          limit = 1.5,
          mov = movement().decelerateWithinLimit(pos, target, limit, vel).value(),
          d = new THREE.Vector3(0,-.5,0)

      expect(mov.x).to.equal(d.x)
      expect(mov.y).to.equal(d.y)
      expect(mov.z).to.equal(d.z)
    })
    it('should decelerateWithinLimit on xyz axis', function(){
      var pos = new THREE.Vector3(0,0,0),
          target = new THREE.Vector3(1,1,1).normalize(),
          vel = new THREE.Vector3(1,1,1).setLength(2),
          limit = 1.5,
          mov = movement().decelerateWithinLimit(pos, target, limit, vel).value(),
          d = new THREE.Vector3(-1,-1,-1).setLength(.5)

      expect(mov.x).to.equal(d.x)
      expect(mov.y).to.equal(d.y)
      expect(mov.z).to.equal(d.z)
    })
    it('should not decelerateWithinLimit on too far', function(){
      var pos = new THREE.Vector3(0,0,0),
          target = new THREE.Vector3(1,0,0).normalize(),
          vel = new THREE.Vector3(2,0,0),
          limit = .5,
          mov = movement().decelerateWithinLimit(pos, target, limit, vel).value(),
          d = new THREE.Vector3()

      expect(mov.x).to.equal(d.x)
      expect(mov.y).to.equal(d.y)
      expect(mov.z).to.equal(d.z)
    })
  })

  describe('decelerateAtAngle', function() {
    it('should not decelerate within angle', function(){
      var target = new THREE.Vector3(1,0,0),
          vel = new THREE.Vector3(1,0,0),
          limit = THREE.Math.degToRad(45),
          mov = movement().decelerateAtAngle(vel, target, limit, vel).value(),
          d = new THREE.Vector3()

      expect(mov.x).to.equal(d.x)
      expect(mov.y).to.equal(d.y)
      expect(mov.z).to.equal(d.z)
    })

    it('should decelerate outside angle', function(){
      var target = new THREE.Vector3(0,1,0),
          vel = new THREE.Vector3(1,0,0),
          limit = THREE.Math.degToRad(45),
          mov = movement().decelerateAtAngle(vel, target, limit, vel).value(),
          d = new THREE.Vector3(-.25,0,0)

      expect(mov.x).to.equal(d.x)
      expect(mov.y).to.equal(d.y)
      expect(mov.z).to.equal(d.z)
    })

    it('should decelerate outside neg angle', function(){
      var target = new THREE.Vector3(0,-1,0),
          vel = new THREE.Vector3(1,0,0),
          limit = THREE.Math.degToRad(45),
          mov = movement().decelerateAtAngle(vel, target, limit, vel).value(),
          d = new THREE.Vector3(-.25,0,0)

      expect(mov.x).to.equal(d.x)
      expect(mov.y).to.equal(d.y)
      expect(mov.z).to.equal(d.z)
    })
  })

  describe('random', function() {
    it('should randomize', function(){
      var mov = movement().random(1).value()
      expect(mov.length()).to.equal(1)
    })
  })

  describe('limit', function() {
    it('should limit too long values', function(){
      var value = new THREE.Vector3(2,0,0),
          mov = movement(value).limit(1).value(),
          d = new THREE.Vector3(1,0,0)
      expect(mov.x).to.equal(d.x)
      expect(mov.y).to.equal(d.y)
      expect(mov.z).to.equal(d.z)
    })
    it('should not limit too small values', function(){
      var value = new THREE.Vector3(1,0,0),
          mov = movement(value).limit(2).value(),
          d = new THREE.Vector3(1,0,0)
      expect(mov.x).to.equal(d.x)
      expect(mov.y).to.equal(d.y)
      expect(mov.z).to.equal(d.z)
    })
  })

})
