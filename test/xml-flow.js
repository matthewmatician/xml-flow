/*global describe, it */

var flow = require('../lib/xml-flow')
  , fs = require('fs')
  , should = require('chai').should()
;

function getFlow(fileName, options) {
    return flow(fs.createReadStream(fileName), options);
}

describe('xml-flow', function(){
    describe('invoke', function(){
        it('should create an emitter when invoked with a stream and options', function(){
            var simpleStream = getFlow('./test/simple.xml');
            simpleStream.on.should.be.a('function');
            simpleStream.pause();
            simpleStream.resume();
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

        it('should handle tags with both attributes and other stuff', function(done){
            var simpleStream = getFlow('./test/test.xml')
              , output = {
                    $name: 'mixed',
                    person: [
                        {$attrs:{name: 'Bill', id: '1', age:'27'}, $text: 'some text'},
                        {$attrs: {name: 'Joe', id: '2', age:'29'}, p: 'some paragraph'},
                        {$attrs: {name: 'Smitty', id: '3', age:'37'}, thing: {id:'999', ref:'blah'}}
                    ]
              }
            ;

            simpleStream.on('tag:mixed', function(node){
                node.should.deep.equal(output);
                done();
            });
        });

        it('should handle scripts', function(done){
            var simpleStream = getFlow('./test/test.xml')
              , output = {
                    $name: 'has-scripts',
                    script: [
                        'var x = 3;',
                        {$attrs: {type: 'text/javascript'}, $script: '//this is a comment'}
                    ]
              }
            ;

            simpleStream.on('tag:has-scripts', function(node){
                node.should.deep.equal(output);
                done();
            });
        });
    });
});
