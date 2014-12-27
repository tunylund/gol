var expect = chai.expect;

var filter = _import('filter').from('gol')

describe('filter', function(){
  it('should filter without', function(){
    var collection = _.partial(_.identity, [1,2,3]),
        a = filter(collection).without(1).without(2)

    expect(a()).to.include(3)
    expect(a()).to.not.include(1)
    expect(a()).to.not.include(2)
  })

  it('should filter closest', function(){
    var collection = _.partial(_.identity, [
          {position: new THREE.Vector3(0,0,0)},
          {position: new THREE.Vector3(1,0,0)},
          {position: new THREE.Vector3(2,0,0)}
        ]),
        a = filter(collection)
            .closest(.5, {position: new THREE.Vector3(0,0,0)})

    expect(a()).to.include(collection()[0])
    expect(a()).to.not.include(collection()[1])
    expect(a()).to.not.include(collection()[2])
  })

  it('should filter outside', function(){
    var collection = _.partial(_.identity, [
          {position: new THREE.Vector3(0,0,0)},
          {position: new THREE.Vector3(1,0,0)},
          {position: new THREE.Vector3(2,0,0)}
        ]),
        a = filter(collection)
            .outside(.5, {position: new THREE.Vector3(0,0,0)})

    expect(a()).to.not.include(collection()[0])
    expect(a()).to.include(collection()[1])
    expect(a()).to.include(collection()[2])
  })

  it('should filter not(in)', function(){
    var collection = _.partial(_.identity, [
          {position: new THREE.Vector3(0,0,0)},
          {position: new THREE.Vector3(1,0,0)},
          {position: new THREE.Vector3(2,0,0)}
        ])
    collection()[1].col = [collection()[0]]
    collection()[2].col = [collection()[0]]
    var a = filter(collection)
            .not('col', collection()[0])

    expect(a()).to.include(collection()[0])
    expect(a()).to.not.include(collection()[1])
    expect(a()).to.not.include(collection()[2])
  })

  it('should filter first', function(){
    var collection = _.partial(_.identity, [
          {position: new THREE.Vector3(0,0,0)},
          {position: new THREE.Vector3(1,0,0)},
          {position: new THREE.Vector3(2,0,0)}
        ]),
        a = filter(collection).first(1)

    expect(a()).to.include(collection()[0])
    expect(a()).to.not.include(collection()[1])
    expect(a()).to.not.include(collection()[2])
  })
})
