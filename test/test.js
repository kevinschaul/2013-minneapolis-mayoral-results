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
          // `window.map` is the map code
          map = window.map;
          done();
        });
      }
    });
  });

  describe('_findFillColorPrecinct()', function() {
    it('Returns the tie color if there are no candidates', function() {
      var candidates = [];

      assert.equal(map._findFillColorPrecinct(candidates), map.tieColor);
    });

    it('Returns the no data color if all votes are 0', function() {
      var candidates = [
        {
          'first_choice': 0,
          'id': 1
        }, {
          'first_choice': 0,
          'id': 9031
        }
      ];

      assert.equal(map._findFillColorPrecinct(candidates), map.noDataColor);
    });

    it('Returns the candidate\'s color if there is only one', function() {
      var candidates = [
        {
          'first_choice': 2,
          'id': 9031
        }
      ];

      assert.equal(
        map._findFillColorPrecinct(candidates),
        map.colorScheme['9031']
      );
    });

    it('Returns the winning candidate\'s color', function() {
      var candidates = [
        {
          'first_choice': 1,
          'id': 1
        }, {
          'first_choice': 2,
          'id': 9031
        }
      ];

      assert.equal(
        map._findFillColorPrecinct(candidates),
        map.colorScheme['9031']
      );
    });

    it('Returns the winning candidate\'s color', function() {
      var candidates = [
        {
          'first_choice': 2,
          'id': 1
        }, {
          'first_choice': 1,
          'id': 2
        }
      ];

      assert.equal(
        map._findFillColorPrecinct(candidates),
        map.otherColor
      );
    });

    it('Returns the tie color in a tie', function() {
      var candidates = [
        {
          'first_choice': 2,
          'id': 1
        }, {
          'first_choice': 2,
          'id': 2
        }
      ];

      assert.equal(
        map._findFillColorPrecinct(candidates),
        map.tieColor
      );
    });

    it('Returns the winning candidate\'s color', function() {
      var candidates = [
        {
          'first_choice': 2,
          'id': 1
        }, {
          'first_choice': 2,
          'id': 2
        }, {
          'first_choice': 3,
          'id': 9031
        }
      ];

      assert.equal(
        map._findFillColorPrecinct(candidates),
        map.colorScheme['9031']
      );
    });

    it('Returns the winning candidate\'s color', function() {
      var candidates = [
        {
          'first_choice': 2,
          'id': 1
        }, {
          'first_choice': 2,
          'id': 2
        }, {
          'first_choice': 1,
          'id': 3
        }
      ];

      assert.equal(
        map._findFillColorPrecinct(candidates),
        map.tieColor
      );
    });

  });

  describe('formatPercent()', function() {

    it('Multiplies by 100 and rounds to two decimal places', function() {
      assert.equal(map.formatPercent(1), 100.0);
    });

    it('Multiplies by 100 and rounds to two decimal places', function() {
      assert.equal(map.formatPercent(0), 0.0);
    });

    it('Multiplies by 100 and rounds to two decimal places', function() {
      assert.equal(map.formatPercent(0.004), 0.4);
    });

    it('Multiplies by 100 and rounds to two decimal places', function() {
      assert.equal(map.formatPercent(0.0044), 0.4);
    });

    it('Multiplies by 100 and rounds to two decimal places', function() {
      assert.equal(map.formatPercent(0.0045), 0.5);
    });

    it('Multiplies by 100 and rounds to two decimal places', function() {
      assert.equal(map.formatPercent(0.005), 0.5);
    });

    it('Multiplies by 100 and rounds to two decimal places', function() {
      assert.equal(map.formatPercent(0.001), 0.1);
    });

    it('Multiplies by 100 and rounds to two decimal places', function() {
      assert.equal(map.formatPercent(0.9944), 99.4);
    });

    it('Multiplies by 100 and rounds to two decimal places', function() {
      assert.equal(map.formatPercent(0.9945), 99.5);
    });

    it('Multiplies by 100 and rounds to two decimal places', function() {
      assert.equal(map.formatPercent(0.9995), 100);
    });

  });

  describe('formatAddress()', function() {

    it('Leaves addresses with `Minneapolis` in them alone', function() {
      assert.equal(
        map.formatAddress('111 Hennepin Ave, Minneapolis'),
        '111 Hennepin Ave, Minneapolis'
      );
    });

    it('Leaves addresses with `Minneapolis` in them alone', function() {
      assert.equal(
        map.formatAddress('111 Hennepin Ave, minneapolis'),
        '111 Hennepin Ave, minneapolis'
      );
    });

    it('Appends `Minneapolis, MN` to addresses without `Minneapolis` already in them', function() {
      assert.equal(
        map.formatAddress('111 Hennepin Ave'),
        '111 Hennepin Ave Minneapolis, MN'
      );
    });

    it('Leave zip codes alone', function() {
      assert.equal(
        map.formatAddress('55455'),
        '55455'
      );
    });

    it('Leave zip codes alone', function() {
      assert.equal(
        map.formatAddress('55455 Hennepin Ave'),
        '55455 Hennepin Ave Minneapolis, MN'
      );
    });

  });

  describe('pctcodeToVtd()', function() {

    it('Prepends the Mineapolis state/county code', function() {
      assert.equal(
        map.pctcodeToVtd('1360'),
        '270531360'
      );
    });

    it('Prepends the Mineapolis state/county code', function() {
      assert.equal(
        map.pctcodeToVtd(1360),
        '270531360'
      );
    });

  });

  describe('vtdToPctcode()', function() {

    it('Removes the Mineapolis state/county code', function() {
      assert.equal(
        map.vtdToPctcode('270531360'),
        '1360'
      );
    });

    it('Does not accept integers', function() {
      assert.throws(
        function() { map.vtdToPctcode(270531360); }
      );
    });

  });

  describe('sortCandidates()', function() {

    var c1 = {
        last_name: 'Zebra',
        first_choice: 0
    }
    var c2 = {
        last_name: 'Aardvark',
        first_choice: 0
    }
    var c3 = {
        last_name: 'Panda',
        first_choice: 10
    }
    var c4 = {
        last_name: 'Giraffe',
        first_choice: 10
    }
    var c5 = {
        last_name: 'Sloth',
        first_choice: 10,
        rank: 1
    }
    var c6 = {
        last_name: 'Write-in',
        rank: -1
    }

    it('Sorts first by first_choice', function() {
      var candidates = [
        c3,
        c2
      ];

      var sorted = map.sortCandidates(candidates);
      assert.equal(
        sorted[0],
        c3
      );

      var candidates = [
        c2,
        c3
      ];

      var sorted = map.sortCandidates(candidates);
      assert.equal(
        sorted[0],
        c3
      );
    });

    it('Sorts second by rank', function() {
      var candidates = [
        c4,
        c5
      ];

      var sorted = map.sortCandidates(candidates);
      assert.equal(
        sorted[0],
        c5
      );

      var candidates = [
        c5,
        c4
      ];

      var sorted = map.sortCandidates(candidates);
      assert.equal(
        sorted[0],
        c5
      );

    });

    it('Sorts third by last_name', function() {
      var candidates = [
        c1,
        c2
      ];

      var sorted = map.sortCandidates(candidates);
      assert.equal(
        sorted[0],
        c2
      );

      var candidates = [
        c2,
        c1
      ];

      var sorted = map.sortCandidates(candidates);
      assert.equal(
        sorted[0],
        c2
      );
    });

    it('Sorts first by first_choice and third by last_name', function() {
      var candidates = [
        c1,
        c2,
        c3,
        c4
      ];

      var sorted = map.sortCandidates(candidates);
      assert.equal(
        sorted[0],
        c4
      );
      assert.equal(
        sorted[1],
        c3
      );
    });

  });

  describe('_getPrecinctsReporting()', function() {

    it('Returns 0.0% if total is zero', function() {
      assert.equal(
        map._getPrecinctsReporting(0, 0),
        '0.0%'
      );
    });

    it('Returns Unknown if total is less than zero', function() {
      assert.equal(
        map._getPrecinctsReporting(1, -1),
        'Unknown'
      );
    });

    it('Returns 0.0% if reporting is zero', function() {
      assert.equal(
        map._getPrecinctsReporting(0, 1),
        '0.0%'
      );
    });

    it('Ruturns Unknown if reporting is less than zero', function() {
      assert.equal(
        map._getPrecinctsReporting(-1, 1),
        'Unknown'
      );
    });

    it('Returns correct percentage value', function() {
      assert.equal(
        map._getPrecinctsReporting(5, 10000),
        '0.1%'
      );
    });

    it('Returns correct percentage value', function() {
      assert.equal(
        map._getPrecinctsReporting(10, 10000),
        '0.1%'
      );
    });

    it('Returns correct percentage value', function() {
      assert.equal(
        map._getPrecinctsReporting(14, 10000),
        '0.1%'
      );
    });

    it('Returns correct percentage value', function() {
      assert.equal(
        map._getPrecinctsReporting(15, 10000),
        '0.2%'
      );
    });

    it('Returns correct percentage value', function() {
      assert.equal(
        map._getPrecinctsReporting(20, 10000),
        '0.2%'
      );
    });

    it('Returns correct percentage value', function() {
      assert.equal(
        map._getPrecinctsReporting(9994, 10000),
        '99.9%'
      );
    });

    it('Returns correct percentage value', function() {
      assert.equal(
        map._getPrecinctsReporting(9995, 10000),
        '99.9%'
      );
    });

    it('Returns 99% until all precincts have reported', function() {
      assert.equal(
        map._getPrecinctsReporting(9999, 10000),
        '99.9%'
      );
    });

    it('Returns 100% when all precincts have reported', function() {
      assert.equal(
        map._getPrecinctsReporting(10000, 10000),
        '100.0%'
      );
    });

    it('Returns Unknown if reporting is greater than total', function() {
      assert.equal(
        map._getPrecinctsReporting(10001, 10000),
        'Unknown'
      );
    });

  });

});

