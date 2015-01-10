_import.module('gol').promise('main', 'env', 'math', 'movement', 'filter', 'fps', function(_export) {

  CANNON.Vec3.prototype.norm = THREE.Vector3.prototype.length

  var env = {},
      runner = _import('runner').from('gol')

  _export('env', env);

  _export('main', function main() {
    // renderer
    env.renderer = new THREE.WebGLRenderer();
    env.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(env.renderer.domElement);

    // camera
    env.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    env.camera.position.z = 500;

    // scene
    env.scene = new THREE.Scene();
 
    // cannon
    var world = new CANNON.World();
    var sph = new CANNON.SPHSystem();
    sph.density = 1;
    sph.viscosity = 0.03;
    sph.smoothingRadius = 1.0;
    world.subsystems.push(sph);
    world.solver.iterations=2
    env.world = world
    env.sph = sph


    _import('life').from('gol.life')()

    runner(function render() {
      env.renderer.render(env.scene, env.camera);
    })


    var m = new THREE.Matrix4(),
        up = new THREE.Vector3(0,1,0),
        cameraVel = new THREE.Vector3(-1, 0, 0)
    function rotate(diff, now) {
      var vel = cameraVel.clone()
      m.lookAt(env.camera.position, new THREE.Vector3(), up)
      vel.transformDirection(m);
      var t = (diff||0)/1000
      env.camera.position.add(vel.multiplyScalar(60*t))
      env.camera.lookAt( env.scene.position );
    }
    //runner(rotate)

    window.addEventListener( 'resize', onWindowResize, false );
    function onWindowResize() {
      env.camera.aspect = window.innerWidth / window.innerHeight;
      env.camera.updateProjectionMatrix();
      env.renderer.setSize( window.innerWidth, window.innerHeight );
    }
  })

  

  var math = {
    r: function random(max) {
      return Math.floor(Math.random()*(max||10))
    },
    pn: function positiveOrNegative(value) {
      var v = value instanceof Function ? value() : value
      return Math.random() > .5 ? v : -v;
    },
    limit: function(value, min, max) {
      if(value < min) return min
      if(value > max) return max
      return value
    },
    sign: function(value) {
      return value == 0 ? 1 : value / Math.abs(value)
    },
    up: new THREE.Vector3(0,1,0),
    center: new THREE.Vector3(0,0,0),
    one: new THREE.Vector3(1,1,1),
    goldenAngle: Math.PI * (3 - Math.sqrt(5))
  }
  _export('math', math)



  function filter(fn) {
    var chain = fn || _.identity
    function c(fn) {
      return filter(_.compose(fn, chain))
    }
    chain.without = function(item) {
      return c(_.partial(_.without, _, item))
    }
    chain.closest = function(radius, entity) {
      return c(_.partial(_.filter, _, function(a) {
        return a.position.distanceTo(entity.position) < radius
      }))
    },
    chain.outside = function(radius, entity) {
      return c(_.partial(_.filter, _, function(a) {
        return a.position.distanceTo(entity.position) >= radius
      }))
    },
    chain.not = function(collectionName, item) {
      return c(_.partial(_.filter, _, function(a) {
        return !a[collectionName] || a[collectionName].indexOf(item) == -1
      }))
    },
    chain.first = function(count) {
      return c(_.partial(_.first, _, count))
    }
    return chain;
  }
  _export('filter', filter);



  _export('fps', function (fpsRunnerStop) {
    var tmpl = '<div class="fps"></div>',
        fps = document.createElement('div'),
        fpss = document.querySelectorAll('.fps'),
        right = fpss.length * (fpss[0] ? fpss[0].clientWidth : 0);
    
    fps.className = 'fps';
    fps.style.left = right + "px";
    document.body.insertBefore(fps, document.body.childNodes[0])

    runner(function () {
      fps.innerHTML = fpsRunnerStop.fps;
    })
  })

})
