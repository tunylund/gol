_import.module('gol').promise('fpsRunner', 'runner', function(_export) {

  function fpsRunner(tick, fps) {
    var fps = fps || 60,
        timeout = 1000/fps,
        diff = 0,
        lastTime = performance.now();

    var s = lastTime, c = 0;

    var stop = function() {
      clearTimeout(r)
    }
    stop.fps = 0
    
    var frame = function() {
      var now = performance.now(),
      diff = now - lastTime
      r = setTimeout(frame, timeout)
      lastTime = now
      tick(diff, now)
      c++
      if(now - s > 1000) {
        stop.fps = c
        s = now;
        c = 0;
      }
    }, r = setTimeout(frame, timeout);
    
    return stop
  }
  _export('fpsRunner', fpsRunner)



  function runner(tick) {
    var diff = 0, 
        lastTime = performance.now(),
        s = lastTime, c = 0;
    
    var stop = function() {
      cancelAnimationFrame(r)
    }
    stop.fps = 0

    var frame = function(now) {
      diff = Math.min(now - lastTime, 60)
      lastTime = now;
      r = requestAnimationFrame(frame)
      tick(diff, now)
      c++
      if(now - s > 1000) {
        stop.fps = c
        s = now;
        c = 0;
      }
    }, r = requestAnimationFrame(frame)

    return stop
  }
  _export('runner', runner)

});
