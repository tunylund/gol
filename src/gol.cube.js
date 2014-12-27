_import.module('gol.cubes').promise('Cube', 'cubes', function(_export) {

  var env = _import('env').from('gol'), 
      movement = _import('movement').from('gol'),
      Entity = _import('Entity').from('gol.entity')

  function Cube() {
    Entity.apply(this, arguments)
    this._mesh = new THREE.Mesh( 
      new THREE.BoxGeometry(20, 20, 20), 
      new THREE.MeshBasicMaterial({
        color: 0x9999ff,
        transparent: true,
        opacity: .8
      })
    );
    env.scene.add(this._mesh);
  }

  Cube.prototype = Object.create(Entity.prototype)
 
  Cube.prototype.constructor = Cube;

  Cube.prototype.tick = function(diff, now) {
    Entity.prototype.tick.apply(this, arguments)
    //this.acceleration = movement(this.velocity).random(50).value()
    this.acceleration.add(movement().gravity(this.position, new THREE.Vector3(), 50).value())
    this._mesh.position.x = this.position.x
    this._mesh.position.y = this.position.y
    this._mesh.position.z = this.position.z

  }

  _export('Cube', Cube)




  _export('cubes', function cubes() {

    var fpsRunner = _import('fpsRunner').from('gol'),
        runner = _import('runner').from('gol'),
        fps = _import('fps').from('gol')

    function birth() {

      var cube = new Cube(),
          ru = fpsRunner(function(diff, now) {
            //cube.preTick()
            cube.tick(diff, now)
          }, 24)

      fps(ru)
      
      runner(cube.move.bind(cube));
    }
    birth()
  })


});
