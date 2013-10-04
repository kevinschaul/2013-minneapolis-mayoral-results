var TIE_COLOR = '#999';

var map = {
  $addressForm: $('form#address-form'),
  $addressInput: $('input#address'),
  $addressButton: $('#address-button'),
  $locateButton: $('#locate-button'),
  $feedback: $('#feedback'),
  $results: $('.col.col1'),
  $resultsTarget: $('#results-target'),

  colorScheme: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],

  precinctLookup: {},

  init: function() {
    var self = this;

    self.getResults();
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

  getPrecinctShapes: function() {
    var self = this;

    $.getJSON('precincts-hennepin.json', function(data) {
      self.geoJson = data;
      self.addPrecinctLayer(self.geoJson);

      _.each(self.geoJson.features, function(d) {
        self.precinctLookup[d.properties.VTD] = {
          'precinctId': d.properties.VTD,
          'feature': d,
        };
      });
    });
  },

  getResults: function() {
    var self = this;

    $.getJSON('test-results.json', function(data) {
      self.results = data;
      self.initTable();
      self.initMap();
      self.getPrecinctShapes();
    });
  },

  addPrecinctLayer: function(geoJson) {
    var self = this;

   self.precinctLayer = new L.geoJson(geoJson, {
      'style': function(d) { return self.stylePrecinct(d, self); },
      'onEachFeature': function(d, layer) {
        layer.on({
          click: function(d) {
            var properties = layer.feature.properties;
            self.activatePrecinct(properties.VTD);
          }
        })
      }
    });

    self.map.addLayer(self.precinctLayer);
  },

  stylePrecinct: function(d, self) {
    var self = self;

    var precinct = self.results.precincts[d.properties.VTD];

    var max_votes = 0;
    var max_candidate_id = -1;
    var tie = false;
    _.each(precinct.candidates, function(d) {
      if (d.first_choice === max_votes) {
        tie = true;
        max_candidate_id = -1;
      }
      if (d.first_choice > max_votes) {
        tie = false;
        max_votes = d.first_choice;
        max_candidate_id = d.id;
      };
    });

    var fillColor = TIE_COLOR;
    if (max_candidate_id >= 0 ) {
      fillColor = self.colorScheme[max_candidate_id];
    }

    return {
      fillColor: fillColor,
      fillOpacity: 0.7,
      weight: 1,
      color: '#fff'
    };
  },

  formatPercent: function(s) {
    return Math.round(s * 100, 2);
  },

  initTable: function() {
    var self  = this;

    self.tableTemplate = _.template($('script#table-template').html());

    _.each(self.results.total.candidates, function(c, i) {
      self.results.total.candidates[i]['first_choice_percent'] =
          self.formatPercent(c.first_choice / self.results.total.total_votes_first);
      self.results.total.candidates[i]['second_choice_percent'] =
          self.formatPercent(c.second_choice / self.results.total.total_votes_second);
      self.results.total.candidates[i]['third_choice_percent'] =
          self.formatPercent(c.third_choice / self.results.total.total_votes_third);
    });

    _.each(self.results.precincts, function(p) {
      _.each(p.candidates, function(c, i) {
        p.candidates[i]['first_choice_percent'] =
            self.formatPercent(c.first_choice / p.total_votes_first);
        p.candidates[i]['second_choice_percent'] =
            self.formatPercent(c.second_choice / p.total_votes_second);
        p.candidates[i]['third_choice_percent'] =
            self.formatPercent(c.third_choice / p.total_votes_third);
      });
    });

    self.$resultsTarget.append(self.tableTemplate({
      total: self.results.total,
      precincts: self.results.precincts
    }));

    $('.show-on-map').click(function() {
      var $this = $(this);
      var $precinct = $this.parents('.precinct');
      var precinctId = $precinct.attr('data-id');
      self.activatePrecinct(precinctId);
    });

    $('.show-all').click(function() {
      var $this = $(this);
      var candidates = $this.parent('.candidates').children('.hide');
      candidates.removeClass('hide');
      $this.addClass('hide');
    });
  },

  initAddressLookup: function() {
    var self = this;

    self.$addressForm.submit(function() {
      return false;
    });

    self.$addressInput.keydown(function() {
      self.clearGeocodeError();
    });

    self.$addressButton.click(function() {
      if (!self.isWaiting) {
        self.searchAddress(self.$addressInput.val());
        self.indicateWaiting(this);
      }
    });

    if (navigator && navigator.geolocation) {
      self.$locateButton.show();

      self.$locateButton.click(function() {
      if (!self.isWaiting) {
        self.indicateWaiting(this);
        navigator.geolocation.getCurrentPosition(
          function(position) {
            // Success
            self.searchPrecinct(
              position.coords.latitude,
              position.coords.longitude
            );
          }, function() {
            // Error
            self.displayGeocodeError("We are having trouble locating you.");
          });
        }
      });
    }
  },

  formatAddress: function(address) {
    var self = this;

    if (address && typeof(address === "string")) {
        var pattern = /^\d{5}$|minneapolis\s*/i;
        var match = address.match(pattern);
        if (!match) {
            address = address + " Minneapolis, MN";
        }

        self.$addressInput.val(address);
        return address;
    }
  },

  searchAddress: function(address) {
    var self = this;

    address = self.formatAddress(address);

    // http://stackoverflow.com/questions/309953/how-do-i-catch-jquery-getjson-or-ajax-with-datatype-set-to-jsonp-error-w
    var errorTimeout = setTimeout(function() {
      self.displayGeocodeError("We are having trouble locating your precinct.");
    }, 2000);

    var url = 'http://www.mapquestapi.com/geocoding/v1/address?key=Fmjtd%7Cluub2h0tng%2Crx%3Do5-9utggu&inFormat=kvp&outFormat=json';
    // TODO
    // url += '&boundingBox=44.87290,-93.42911,45.06722,-93.10089';
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
        self.indicateWaitingFinished();
      } else {
        self.displayGeocodeError("We are having trouble locating your precinct.");
      }
    });
  },

  activatePrecinct: function(precinctId) {
    var self = this;

    self.deactivateAllPrecincts();
    var $precinct = $('.precinct-id-' + precinctId);

    if ($precinct && $precinct.length > 0) {
      $precinct.addClass('active');

      // Find offset relative to $resultsTarget
      var top = $precinct.position().top -  self.$resultsTarget.position().top;

      self.$results.animate({
        'scrollTop': top
      });

      var feature = self.precinctLookup[precinctId].feature;
      var bounds = feature.bbox;
      var boundsForLeaflet = [
        [bounds[1], bounds[0]],
        [bounds[3], bounds[2]]
      ];
      self.map.fitBounds(boundsForLeaflet);
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
    self.indicateWaitingFinished();
  },

  indicateWaitingFinished: function() {
    var self = this;

    if (self.waiting) {
      window.clearInterval(self.waiting);
    }
    self.$addressButton.html('Find precinct');
    self.$addressButton.removeClass('loading');
    self.$locateButton.html('Locate me');
    self.$locateButton.removeClass('loading');
    self.isWaiting = false;
  },

  indicateWaiting: function(button) {
    var self = this;

    var i = 0;

    self.isWaiting = true;
    self.$addressButton.addClass('loading');
    self.$locateButton.addClass('loading');
    self._indicateWaiting(button, i++);
    self.waiting = window.setInterval(function() {
      self._indicateWaiting(button, i++);
    }, 250);
  },

  _indicateWaiting: function(button, i) {
    var self = this;

    switch (i % 4) {
      case 0:
        $(button).html('Loading&nbsp;&nbsp;&nbsp;&nbsp;');
        break;
      case 1:
        $(button).html('Loading&nbsp;.&nbsp;&nbsp;');
        break;
      case 2:
        $(button).html('Loading&nbsp;..&nbsp;');
        break;
      case 3:
        $(button).html('Loading&nbsp;...');
        break;
    }
  }
}

m = map.init();

