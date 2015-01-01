_import.module('gol.life').promise('life', function(_export) {

  var Tick = _import('Tick').from('gol.tick'),
      TickBase = _import('TickBase').from('gol.tick'),
      Threat = _import('Threat').from('gol.threat'),
      Flock = _import('Flock').from('gol.entity'),
      env = _import('env').from('gol'),
      m = _import('math').from('gol')

  _export('life', function life() {

    var fpsRunner = _import('fpsRunner').from('gol'),
        runner = _import('runner').from('gol'),
        fps = _import('fps').from('gol')

    env.world.solver.tolerance = 0.001;
    var physicsRunner = runner(function(diff) {
      env.world.step(1/20, diff)
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

      setTimeout(function() {
        var threat = new Threat(TickBase);
        var threatTick = fpsRunner(function (diff, now) {
          threat.preTick()
          threat.tick()
        }, 24)
      }, 0)
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

    basesWithThreat()
  })
})
