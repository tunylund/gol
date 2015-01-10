_import.module('gol.life').promise('life', function(_export) {

  var Tick = _import('Tick').from('gol.tick'),
      TickBase = _import('TickBase').from('gol.tick'),
      Threat = _import('Threat').from('gol.threat'),
      TriangleThreat = _import('TriangleThreat').from('gol.threat'),
      Flock = _import('Flock').from('gol.entity'),
      env = _import('env').from('gol'),
      m = _import('math').from('gol')

  _export('life', function life() {

    var fpsRunner = _import('fpsRunner').from('gol'),
        runner = _import('runner').from('gol'),
        fps = _import('fps').from('gol')

    env.world.solver.tolerance = 0.001;
    var physicsRunner = runner(function(diff) {
      env.world.step(1/60, diff)
    })
    fps(physicsRunner)

    function invoke(collection, fn, diff, now) {
      if(_.isString(fn)) {
        for(var i=0, l=collection.length; i<l; i++) {
          collection[i][fn](diff, now)
        }
      } else {
        for(var i=0, l=collection.length; i<l; i++) {
          fn.call(collection[i], diff, now)
        }
      }
      var i;
      while((i = collection.indexOf(null)) > -1) {
        collection.splice(i, 1)
      } 
    }

    var flockRunner = fpsRunner(function(diff, now) {
      invoke(Threat.collection, 'move', diff, now)
      invoke(Flock.collection, 'move', diff, now)
      invoke(Tick.collection, 'move', diff, now)
      invoke(TickBase.collection, 'move', diff, now)
    }, 24)
    fps(flockRunner)
    runner(function (diff, now) {
      invoke(Threat.collection, 'tick', diff, now)
      invoke(Flock.collection, 'tick', diff, now)
      invoke(Tick.collection, 'tick', diff, now)
      invoke(TickBase.collection, 'tick', diff, now)
    });

    function birth() {
      var b = new TickBase(new THREE.Vector3(m.pn(m.r(100)), m.pn(m.r(100))))
      b.radius = 3
      b.refresh()
    }
    function basesWithThreat() {
      birth()
      setTimeout(birth, 2000)
      setTimeout(birth, 4000)
      //setTimeout(birth, 6000)
      //setTimeout(birth, 10000)
      //setTimeout(birth, 12000)

      var threat = new TriangleThreat(TickBase);
    }

    function bases() {
      birth()
      birth()
    }

    function ticks() {
      var a = { position: new CANNON.Vec3(0,-10,0), radius: 10 }
      var b = { position: new CANNON.Vec3(0,10,0), radius: 10 }
      var fa = new Flock(a)
      var fb = new Flock(b)
      while(Tick.collection.length < 20) {
        fa.create(Tick)
      }
      while(Tick.collection.length < 40) {
        fb.create(Tick)
      }
    }

    function tri() {
      var target = {collection: [{
        position: new CANNON.Vec3(40, 40, 0)
      }]}
      var t = new THREE.Mesh( 
        new THREE.SphereGeometry(5, 8, 8), 
        new THREE.MeshBasicMaterial({
          color: 0xff6666,
          transparent: true,
          opacity: 1
        }))
        t.position.set(40,40,0)
      var b = new CANNON.Body({
          mass: 0
        });
        b.addShape(new CANNON.Sphere(5));
        b.position.set(100,100,0)
      
      env.world.add(b);
      env.scene.add(t);

      var t = new TriangleThreat(target)
      t.grow();t.grow();t.grow();t.grow();t.grow();t.grow();t.grow();t.grow();
      
    }

    function collisions() {
      birth()
      var threat = new Threat(TickBase);
      threat.move = function(){}
      threat.body.mass = 0
      Flock.collection[0].threat = threat
      setTimeout(function(){
      Tick.collection.forEach(function(t) {
        t.base=null
      })
      }, 500)

      setInterval(function() {
        threat.position = new THREE.Vector3()
      }, 4000)
    }

    function trit() {
      var TriangleCube = _import('TriangleCube').from('gol.shapes')
          TriangleCubeMaterial = _import('TriangleCubeMaterial').from('gol.shapes')
      var t;
      function render() {
        if(t) {
          env.scene.remove(t)
          t.geometry.dispose()
        }
        t = new THREE.Mesh( 
                  TriangleCube(8), 
                  TriangleCubeMaterial())
        env.scene.add(t)
      }
      fpsRunner(render, .2)
      render()
      /*runner(function(diff, now) {
        t.material.uniforms.time.value += diff
        t.material.uniforms.diff.value = diff
      })*/
    }
    function tric() {
      var TriangleCloud = _import('TriangleCloud').from('gol.shapes')
          TriangleCloudMaterial = _import('TriangleCloudMaterial').from('gol.shapes')
      var t;
      function render() {
        if(t) {
          env.scene.remove(t)
          t.geometry.dispose()
        }
        t = new THREE.PointCloud( 
                  TriangleCloud(128/8, 128), 
                  TriangleCloudMaterial())
        env.scene.add(t)
      }
      fpsRunner(render, .2)
      render()
      runner(function(diff, now) {
        t.material.uniforms.time.value += diff
        t.material.uniforms.diff.value = diff
      })
    }

    basesWithThreat()
  })
})
