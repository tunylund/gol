_import.module('gol').promise('movement', function(_export) {

  var math = _import('math').from('gol')

  function noop(){ return this };
  
  function movement(m) {
  
    m = m || new THREE.Vector3();

    return {

      encircle: function(position, targetPosition, speed) {
        var dir = new THREE.Matrix4(),
            vel = new THREE.Vector3(1, 0, 0)
        dir.lookAt(position, targetPosition, math.up)
        vel.transformDirection(dir);
        m.add(vel.multiplyScalar(speed))
        return this
      },

      gravity: function(position, targetPosition, speed) {
        m.add(position.clone().vsub(targetPosition).negate().unit().scale(speed));
        return this;
      },

      repel: function(position, entities, speed) {
        for(var i=0, l=entities.length; i<l; i++) {
          var a = entities[i],
              dist = position.clone().distanceTo(a.position),
              acc = position.clone().sub(a.position)
          if(dist == 0) acc = movement().random().value()
          m.add(acc.normalize().multiplyScalar(speed))
        }
        return this
      },

      align: function(entities) {
        for(var i=0, l=entities.length; i<l; i++) {
          var a = entities[i]
          m.add(a.velocity.clone())
        }
        return this
      },

      approach: function(position, entities, speed) {
        for(var i=0, l=entities.length; i<l; i++) {
          this.gravity(position, entities[i].position, speed)
        }
        return this
      },

      decelerate: function(velocity) {
        m.add(velocity.clone().negate().scale(.25))
        return this;
      },

      decelerateAtLimit: function(position, center, radius, velocity) {
        if(position.distanceTo(center) >= radius) {
          this.decelerate(velocity)
        }
        return this;
      },

      decelerateWithinLimit: function(position, center, radius, velocity) {
        if(position.distanceTo(center) <= radius) {
          this.decelerate(velocity)
        }
        return this;
      },

      decelerateAtAngle: function(velocity, center, angle) {
        var a = new THREE.Vector3(velocity.x, velocity.y, velocity.z),
            b = new THREE.Vector3(center.x, center.y, center.z)
        if(a.angleTo(b) >= angle) {
          this.decelerate(velocity)
        }
        return this;
      },

      random: function(speed) {
        m = new THREE.Vector3(
          math.pn(Math.random()),
          math.pn(Math.random()),
          math.pn(Math.random()))
          .setLength(speed)
        return this
      },

      or: function() {
        if(m.length() != 0) {
          return _.extend(this, _.chain(this).functions().without("value").map(function(name) { return [name, noop] }).object().value())
        }
        return this
      },

      limit: function(max) {
        m.clampScalar(-max, max)
        return this
      },

      value: function() {
        return m;
      }
    }
  }
  _export('movement', movement)

})
