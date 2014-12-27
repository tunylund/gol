_import.module('gol.objects').promise('Sphere', 'BodilySphere', 'Line', function(_export) {

  var env = _import('env').from('gol'), 
      Entity = _import('Entity').from('gol.entity'),
      Meshed = _import('Meshed').from('gol.entity')

  function Sphere(parent, radius, color, opacity) {
    Entity.apply(this, arguments)
    this._mesh = new THREE.Mesh( 
      new THREE.SphereGeometry(radius, 32, 32), 
      new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity || .1
      })
    );
    env.scene.add(this._mesh);
  }

  Sphere.prototype = Object.create(Entity.prototype)
 
  Sphere.prototype.constructor = Sphere;

  Sphere.prototype.tick = function() {
    Entity.prototype.tick.apply(this, arguments)
    Meshed.tick.apply(this, arguments)
  }

  _export('Sphere', Sphere)



  var Bodily = _import('Bodily').from('gol.entity')
  function SphereBodily(parent, radius, color, opacity) {
    Entity.apply(this, arguments)
    Bodily.call(this, 100, new CANNON.Sphere(radius));
    this.parent = parent
    this._mesh = new THREE.Mesh( 
      new THREE.SphereGeometry(radius, 32, 32), 
      new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity || .1
      })
    );
    env.scene.add(this._mesh);
  }

  SphereBodily.prototype = Object.create(Entity.prototype)
 
  SphereBodily.prototype.constructor = SphereBodily;

  SphereBodily.prototype.tick = function() {
    Bodily.prototype.tick.apply(this, arguments)
    Entity.prototype.tick.apply(this, arguments)
    Meshed.tick.apply(this, arguments)
    this.body.position.x = this.position.x
    this.body.position.y = this.position.y
    this.body.position.z = this.position.z
  }

  _export('SphereBodily', SphereBodily)




  function Line(parent, endPoint, color) {
    Entity.apply(this, arguments)

    var material = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1
    });

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0), endPoint);

    this._mesh = new THREE.Line( geometry, material );
    env.scene.add(this._mesh);
  }

  Line.prototype = Object.create(Entity.prototype)
  
  Line.prototype.constructor = Line;

  Line.prototype.tick = function() {
    Entity.prototype.tick.apply(this, arguments)
    Meshed.tick.apply(this, arguments)
    this._mesh.geometry.vertices[1] = this.parent.velocity
    this._mesh.geometry.verticesNeedUpdate = true
  }

  _export('Line', Line)


})