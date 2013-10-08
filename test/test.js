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

  describe('stylePrecinct()', function() {
  });

  describe('formatPercent()', function() {
    it('Multiplies by 100 and rounds to two decimal places', function() {
      assert.equal(map.formatPercent(1), 100);
    });
    it('Multiplies by 100 and rounds to two decimal places', function() {
      assert.equal(map.formatPercent(0), 0);
    });
    it('Multiplies by 100 and rounds to two decimal places', function() {
      assert.equal(map.formatPercent(0.001), 0);
    });
    it('Multiplies by 100 and rounds to two decimal places', function() {
      assert.equal(map.formatPercent(0.005), 1);
    });
    it('Multiplies by 100 and rounds to two decimal places', function() {
      assert.equal(map.formatPercent(0.01), 1);
    });
    it('Multiplies by 100 and rounds to two decimal places', function() {
      assert.equal(map.formatPercent(0.9949), 99);
    });
    it('Multiplies by 100 and rounds to two decimal places', function() {
      assert.equal(map.formatPercent(0.995), 100);
    });
  })

});

