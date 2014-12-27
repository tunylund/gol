var expect = chai.expect;

describe('runner', function(){
  it('should run at least once', function(done){
    var runner = _import('runner').from('gol')
        stop = runner(testRun)
    function testRun() {
      stop();
      done();
    }
  });
});



describe('fpsRunner', function(){
  
  it('should run at least once', function(done){
    var fpsRunner = _import('fpsRunner').from('gol')
        stop = fpsRunner(testRun)
    function testRun() {
      stop();
      done();
    }
  });

  it('should run at defined fps', function(done){
    var fpsRunner = _import('fpsRunner').from('gol')
        stop = fpsRunner(testRun, 10),
        cycles = 0;
    function testRun(diff, now) {
      cycles++;
      if(cycles > 15) {
        stop()
        setTimeout(finish, 1)
      }
    }
    function finish() {
      expect(stop.fps).to.be.within(9, 11)
      done();
    }
  });

});
