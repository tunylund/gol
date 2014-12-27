_import.module('gol.test').promise('a', 'b', function(_export) {

  _export('b', function() {
    var env = _import('env').from('gol'),
        stage = env.stage
    
    // create a texture from an image path
    var texture = PIXI.Texture.fromImage("bunny.png");
    // create a new Sprite using the texture
    var bunny = new PIXI.Sprite(texture);
 
    // center the sprites anchor point
    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;
 
    // move the sprite t the center of the screen
    bunny.position.x = 200;
    bunny.position.y = 150;
 
    stage.addChild(bunny);
 
    function animate() {
      requestAnimFrame( animate );
      // just for fun, lets rotate mr rabbit a little
      bunny.rotation += 0.1;
      // render the stage   
      env.renderer.render(stage);
    }

  })

  _export('a', function() {
    var env = _import('env').from('gol'),
        geometry = new THREE.BoxGeometry( 100, 100, 100 ),
        material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } ),
        cube = new THREE.Mesh( geometry, material );
    env.scene.add( cube );
    env.camera.position.z = 1000;

    function render() {
      requestAnimationFrame( render );
      cube.rotation.x += 0.1;
      cube.rotation.y += 0.1;
      env.renderer.render( env.scene, env.camera );
    }
    render();
  })

})