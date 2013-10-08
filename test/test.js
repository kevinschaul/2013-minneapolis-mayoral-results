var assert = require('assert');
var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom').jsdom;

describe('map', function() {
  var map = null;

  before(function(done) {
    jsdom.env({
      file: 'public/index.html',
      features: {
        FetchExternalResources: ['script'],
      },
      done: function(error, window) {
        if (error) console.log(error);
        window.document.addEventListener('DOMContentLoaded', function() {
          // `map` is the map code
          map = window.map;
          done();
        });
      }
    });
  });

  describe('test', function() {
    it('tests things', function() {
      assert.equal(map.tieColor, '#999');
    });
  });

});

