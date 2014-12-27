_import.module('gol.life').promise('life', 'others', function(_export) {

  var others = [], flocks = []
  _export('others', others)
  
  var Animal = _import('Animal').from('gol.animal'),
      Tick = _import('Tick').from('gol.tick'),
      TickBase = _import('TickBase').from('gol.tick'),
      SphereBodily = _import('SphereBodily').from('gol.objects'),
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
      invoke(others, 'move', diff, now)
      invoke(flocks, 'move', diff, now)
      invoke(flocks, function() {
        invoke(this.animals, 'move', diff, now)
      })
    }, 24)
    fps(flockRunner)
    runner(function (diff, now) {
      invoke(others, 'tick', diff, now)
      invoke(flocks, 'tick', diff, now)
      invoke(flocks, function() {
        invoke(this.animals, 'tick', diff, now)
      })
    });


    function birth() {
      var base = new TickBase()
      base.position = new THREE.Vector3(m.pn(m.r(100)), m.pn(m.r(100)))
      base.tick()
      others.push(base)
      flocks.push(new Flock(Tick, 64, base))
    }
    birth()
    setTimeout(birth, 2000)
    setTimeout(birth, 4000)
    //setTimeout(birth, 6000)

    setTimeout(function() {
      var threat = new Threat();
      others.push(threat)
      var threatTick = fpsRunner(function (diff, now) {
        threat.preTick()
        threat.tick()
      }, 24)
    }, 0)
  })
})
