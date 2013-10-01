var map = {
  $addressInput: $('input#address'),
  $addressButton: $('#address-button'),
  $feedback: $('#feedback'),
  $results: $('.col.col1'),
  $resultsTarget: $('#results-target'),

  colorScheme: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],

  precinctLookup: {},

  init: function() {
    var self = this;

    self.initTable();
    self.initMap();
    self.getData();
    self.initAddressLookup();
  },

  initMap: function() {
    var self = this;

    self.map = L.map('map-target', {
      minZoom: 11,
      maxZoom: 16,
      scrollWheelZoom: false
    })
    self.map.setView([44.97, -93.265], 11);
    self.map.setMaxBounds(self.map.getBounds());
    self.addTonerLayer();
    self.addPrecinctLayer();
  },

  addTonerLayer: function() {
    var self = this;

    self.tonerLayer = new L.TileLayer(
      'http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png',
      {
        'opacity': 0.3,
        'subdomains': ['a', 'b', 'c', 'd'],
        'attribution': 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>.<br />Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
      }
    );

    self.map.addLayer(self.tonerLayer);
  },

  getData: function() {
    var self = this;

    // TODO remove d3 dependency
    d3.json('precincts-hennepin.json', function(error, data) {
      console.log(data);
      var geoJson = topojson.feature(data, data.objects.hennepin).features;
      console.log(geoJson);

      _.each(geoJson, function(d) {
        self.precinctLookup[d.properties.id] = {
          'precinctId': d.properties.id,
          'pctcode': d.properties.pctcode
        };
      });

      self.tableTemplate = _.template($('script#table-template').html());

      self.$resultsTarget.append(self.tableTemplate({
        precincts: self.precinctLookup
      }));

      self.addPrecinctLayer(geoJson);
    });
  },

  addPrecinctLayer: function(geoJson) {
    var self = this;

   self.precinctLayer = new L.geoJson(geoJson, {
      'style': function(d) { return self.stylePrecinct(d, self); },
      'onEachFeature': function(d, layer) {
        layer.on({
          click: function(d) {
            console.log(layer);
            console.log(d);
            console.log(layer.feature.properties);
          }
        })
      }
    });

    self.map.addLayer(self.precinctLayer);
  },

  stylePrecinct: function(d, self) {
    var self = self;

    var values = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 4, 5, 6];

    var rand = Math.floor(Math.random() * values.length);
    return {
      fillColor: self.colorScheme[values[rand]],
      fillOpacity: 0.7,
      weight: 1,
      color: '#fff'
    };
  },

  initTable: function() {
    var self  = this;

    // TODO
  },

  initAddressLookup: function() {
    var self = this;

    self.$addressInput.keydown(function() {
      self.clearGeocodeError();
    });

    self.$addressButton.click(function() {
      self.searchAddress(self.$addressInput.val());
    });
  },

  searchAddress: function(address) {
    var self = this;

    console.log(address);

    // http://stackoverflow.com/questions/309953/how-do-i-catch-jquery-getjson-or-ajax-with-datatype-set-to-jsonp-error-w
    var errorTimeout = setTimeout(function() {
      self.displayGeocodeError("We are having trouble locating your precinct.");
    }, 2000);

    var url = 'http://www.mapquestapi.com/geocoding/v1/address?key=Fmjtd%7Cluub2h0tng%2Crx%3Do5-9utggu&inFormat=kvp&outFormat=json';
    url += '&location=' + address;
    url += '&callback=?';
    $.getJSON(url, function(data) {
      clearTimeout(errorTimeout);
      console.log(data);

      // Ensure result was sent
      if (data
          && data.results
          && data.results.length > 0
          && data.results[0].locations
          && data.results[0].locations.length > 0) {
        var location = data.results[0].locations[0];
        // Ensure location is in Minneapolis, MN
        if (location.adminArea3 === "MN"
            && location.adminArea5 === "Minneapolis") {
          var lat = location.latLng.lat;
          var lng = location.latLng.lng;
          self.searchPrecinct(lat, lng);
        } else {
          self.displayGeocodeError("That location appears to be outside of Minneapolis.");
        }
      } else {
        self.displayGeocodeError("We are having trouble locating your precinct.");
      }
    });
  },

  searchPrecinct: function(lat, lng) {
    var self = this;

    console.log(lat, lng);

    // http://stackoverflow.com/questions/309953/how-do-i-catch-jquery-getjson-or-ajax-with-datatype-set-to-jsonp-error-w
    var errorTimeout = setTimeout(function() {
        self.displayGeocodeError("We are having trouble locating your precinct.");
    }, 2000);

    var url = 'http://boundaries.minnpost.com/1.0/boundary/?sets=voting-precincts-2012';
    url += '&contains=' + lat + ',' + lng;
    url += '&callback=?'
    $.getJSON(url, function(data) {
      clearTimeout(errorTimeout);
      console.log(data);

      if (data
          && data.objects
          && data.objects.length > 0
          && data.objects[0].external_id) {
        var precinctId = data.objects[0].external_id;
        self.activatePrecinct(precinctId);
      } else {
        self.displayGeocodeError("We are having trouble locating your precinct.");
      }
    });
  },

  activatePrecinct: function(precinctId) {
    var self = this;

    console.log(precinctId);

    self.deactivateAllPrecincts();
    var $precinct = $('.precinct-id-' + precinctId);

    if ($precinct) {
      $precinct.addClass('active');

      // Find offset relative to $resultsTarget
      var top = $precinct.position().top -  self.$resultsTarget.position().top;

      self.$results.animate({
        'scrollTop': top
      });
    } else {
      self.displayGeocodeError("That location appears to be outside of Minneapolis.");
    }
  },

  deactivateAllPrecincts: function() {
    var self = this;

    $('.wrapper.active').removeClass('active');
  },

  clearGeocodeError: function() {
    var self = this;

    self.$feedback.text('');
  },

  displayGeocodeError: function(error) {
    var self = this;

    self.$feedback.text(error);
  }
}

m = map.init();

