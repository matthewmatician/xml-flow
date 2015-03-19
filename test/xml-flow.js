/*global describe, it */

var flow = require('../lib/xml-flow')
  , fs = require('fs')
  , should = require('chai').should()
;

function getFlow(fileName) {
    return flow(fs.createReadStream(fileName));
}

describe('xml-flow', function(){
    describe('invoke', function(){
        it('should create an emitter when invoked with a stream and options', function(){
            var simpleStream = getFlow('./test/simple.xml');
            simpleStream.on.should.be.a('function');
        });
    });

    describe(".on('end')", function(){
        it('should emit after the file has been read', function(done){
            var simpleStream = getFlow('./test/simple.xml');
            simpleStream.on('end', function(){
                done();
            });
        });
    });

    describe(".on('tag:...')", function(){
        it('should emit the right number of nodes', function(done){
            var simpleStream = getFlow('./test/simple.xml')
              , count = 0
            ;

            simpleStream.on('tag:item', function(){
                count++;
            });

            simpleStream.on('end', function(){
                count.should.equal(3);
                done();
            });
        });

        it('should make non-attributed data look really simple', function(done){
            var simpleStream = getFlow('./test/test.xml')
              , output = {
                    $name: 'no-attrs',
                    person: [
                        {name: 'Bill', id: '1', age:'27'},
                        {name: 'Joe', id: '2', age:'29'},
                        {name: 'Smitty', id: '3', age:'37'}
                    ]
              }
            ;

            simpleStream.on('tag:no-attrs', function(node){
                node.should.deep.equal(output);
                done();
            });
        });

        it('should make all-attributed data look really simple', function(done){
            var simpleStream = getFlow('./test/test.xml')
              , output = {
                    $name: 'all-attrs',
                    person: [
                        {name: 'Bill', id: '1', age:'27'},
                        {name: 'Joe', id: '2', age:'29'},
                        {name: 'Smitty', id: '3', age:'37'}
                    ]
              }
            ;

            simpleStream.on('tag:all-attrs', function(node){
                node.should.deep.equal(output);
                done();
            });
        });
    });
});
