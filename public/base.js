var map = {
  $addressForm: $('form#address-form'),
  $addressInput: $('input#address'),
  $addressButton: $('#address-button'),
  $results: $('.col.col1'),
  $resultsTarget: $('#results-target'),
  $precinctTarget: $('#precinct-target'),
  $mapTooltipTarget: $('#map-tooltip-target'),

  boundariesTimeout: 6000,
  mapquestTimeout: 2000,

  colorScheme: {
    '9031': '#1b9e77',
    '9021': '#d95f02',
    '9010': '#7570b3',
    '9014': '#e7298a',
    '9013': '#66a61e',
    '9032': '#e6ab02'
  },
  otherColor: '#999',
  tieColor: '#ccc',

  precinctLookup: {},

  init: function() {
    var self = this;

    self.getResults();
    self.initAddressLookup();
  },

  initMap: function() {
    var self = this;

    self.mapTooltipTemplate = _.template($('script#map-tooltip-template').html());

    self.map = L.map('map-target', {
      minZoom: 12,
      maxZoom: 16,
      scrollWheelZoom: false
    })
    self.map.setView([44.97, -93.265], 12);

    // The map's initial bounds are smaller than setMaxBounds allows, probably
    // because of floating point arithmetic. We'll increase the initial bounds
    // by a fudge factor to approximate the correct bounds.
    var bounds = self.map.getBounds();
    var fudgeFactor = 0.0001;
    var maxBounds = [
      [bounds._northEast.lat + fudgeFactor, bounds._northEast.lng + fudgeFactor],
      [bounds._southWest.lat - fudgeFactor, bounds._southWest.lng - fudgeFactor],
    ];
    self.map.setMaxBounds(maxBounds);

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
        self.precinctLookup[d.properties.PCTCODE] = {
          'precinctId': d.properties.PCTCODE,
          'feature': d
        };
      });
    });
  },

  getResults: function() {
    var self = this;

    $.getJSON('https://s3.amazonaws.com/startribune/2013/results.json', function(data) {
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
            self.activatePrecinct(properties.PCTCODE);
          },
          mousemove: function(d) {
            self.$mapTooltipTarget.css({
              top: d.containerPoint.y + 30,
              left: d.containerPoint.x - 180 // width of tooltip / 2
            })
          },
          mouseover: function(d) {
            self.$mapTooltipTarget.show();

            var properties = layer.feature.properties;
            self.activatePrecinctTooltip(properties.PCTCODE);

            layer.setStyle({
              weight: 3,
              color: '#333',
              opacity: 1
            });

            if (!L.Browser.ie && !L.Browser.opera) {
              layer.bringToFront();
            }
          },
          mouseout: function() {
            self.$mapTooltipTarget.hide();

            layer.setStyle({
              weight: 1,
              color: '#fff',
              opacity: 0.7
            });
          }
        })
      }
    });

    self.map.addLayer(self.precinctLayer);
  },

  stylePrecinct: function(d, self) {
    var self = self;

    var precinct = self.results.precincts[d.properties.PCTCODE];
    return {
      fillColor: self._findFillColorPrecinct(precinct.candidates),
      fillOpacity: 0.7,
      opacity: 0.7,
      weight: 1,
      color: '#fff'
    };
  },

  _findFillColorPrecinct: function(candidates) {
    var self = this;

    var max_votes = 0;
    var max_candidate_id = -1;
    var tie = false;

    _.each(candidates, function(d) {
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

    var fillColor = self.tieColor;
    if (max_candidate_id >= 0 ) {
      fillColor = self.colorScheme[max_candidate_id];
      if (!fillColor) {
        fillColor = self.otherColor;
      }
    }

    return fillColor;
  },

  formatPercent: function(s) {
    return Math.round(s * 1000, 3) / 10;
  },

  sortCandidates: function(_candidates) {
    var candidates = _candidates;
    candidates = _.sortBy(candidates, function(d) { return d.last_name; });
    candidates = _.sortBy(candidates, function(d) {
      if (d.rank)
        return -d.rank;
      return 0
    });
    candidates = _.sortBy(candidates, function(d) { return -d.first_choice; });

    return candidates;
  },

  pctcodeToVtd: function(pctcode) {
    // VTD is just PCTCODE with state and county codes prepended to it.
    // `27` is the code for Minneapolis
    // `053` is the code for Hennepin County

    return '27053' + pctcode;
  },

  vtdToPctcode: function(vtd) {
    // VTD is just PCTCODE with state and county codes prepended to it.
    // `27` is the code for Minneapolis
    // `053` is the code for Hennepin County

    if (!typeof(vtd) === 'string')
      throw new Error('vtdToPctcode(): `vtd` must be a string');

    return vtd.slice('27053'.length);
  },

  initTable: function() {
    var self  = this;

    self.totalTemplate = _.template($('script#total-template').html());
    self.precinctTemplate = _.template($('script#precinct-template').html());

    _.each(self.results.total.candidates, function(c, i) {
      if (self.results.total.total_votes_first > 0) {
        self.results.total.candidates[i]['first_choice_percent'] =
            self.formatPercent(c.first_choice / self.results.total.total_votes_first);
      } else {
        self.results.total.candidates[i]['first_choice_percent'] = self.formatPercent(0);
      }

      if (self.results.total.total_votes_second > 0) {
        self.results.total.candidates[i]['second_choice_percent'] =
            self.formatPercent(c.second_choice / self.results.total.total_votes_second);
      } else {
        self.results.total.candidates[i]['second_choice_percent'] = self.formatPercent(0);
      }

      if (self.results.total.total_votes_third > 0) {
        self.results.total.candidates[i]['third_choice_percent'] =
            self.formatPercent(c.third_choice / self.results.total.total_votes_third);
      } else {
        self.results.total.candidates[i]['third_choice_percent'] = self.formatPercent(0);
      }
    });

    _.each(self.results.precincts, function(p) {
      _.each(p.candidates, function(c, i) {
        if (p.total_votes_first > 0) {
          p.candidates[i]['first_choice_percent'] =
              self.formatPercent(c.first_choice / p.total_votes_first);
        } else {
          p.candidates[i]['first_choice_percent'] = 0
        }

        if (p.total_votes_second > 0) {
          p.candidates[i]['second_choice_percent'] =
              self.formatPercent(c.second_choice / p.total_votes_second);
        } else {
          p.candidates[i]['second_choice_percent'] = 0
        }

        if (p.total_votes_third > 0) {
          p.candidates[i]['third_choice_percent'] =
              self.formatPercent(c.third_choice / p.total_votes_third);
        } else {
          p.candidates[i]['third_choice_percent'] = 0
        }
      });
    });

    var precinctsReporting = self.getPrecinctsReporting();
    var totalCandidates = self.sortCandidates(self.results.total.candidates);

    self.$resultsTarget.append(self.totalTemplate({
      precinctsReporting: precinctsReporting,
      totalCandidates: totalCandidates
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

    self.$addressButton.click(function() {
      if (!self.isWaiting) {
        if (self.$addressInput.val()) {
          self.searchAddress(self.$addressInput.val());
          self.indicateWaiting(this);
        } else {
          self.displayGeocodeError('Please enter your address.');
        }
      }
    });
  },

  getPrecinctsReporting: function() {
    var self = this;

    return self._getPrecinctsReporting(
      self.results.total.precincts_reporting,
      self.results.total.precincts_total
    );
  },

  _getPrecinctsReporting: function(reporting, total) {
    var self = this;

    if (total === 0) {
      return '0.0%';
    }
    if (total < 0 || reporting > total || reporting < 0) {
      return 'Unknown';
    }

    var percentage = reporting / total;

    if (percentage >= 0.9995 && percentage < 1.0000) {
      return '99.9%';
    }

    // toFixed(1) rounds incorrectly, so we round ourselves before the
    // call to toFixed(1) is made.
    return (Math.round(percentage * 1000, 3) / 10).toFixed(1) + '%';
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
    }, self.mapquestTimeout);

    var url = 'http://www.mapquestapi.com/geocoding/v1/address?key=Fmjtd%7Cluub2h0tng%2Crx%3Do5-9utggu&inFormat=kvp&outFormat=json';
    url += '&location=' + address;
    url += '&callback=?';
    $.getJSON(url, function(data) {
      clearTimeout(errorTimeout);

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

    // http://stackoverflow.com/questions/309953/how-do-i-catch-jquery-getjson-or-ajax-with-datatype-set-to-jsonp-error-w
    var errorTimeout = setTimeout(function() {
        self.displayGeocodeError("We are having trouble locating your precinct.");
    }, self.boundariesTimeout);

    var url = 'http://ec2-54-200-220-1.us-west-2.compute.amazonaws.com/1.0/boundary/?sets=voting-precincts-2012';
    url += '&contains=' + lat + ',' + lng;
    url += '&callback=?'
    $.getJSON(url, function(data) {
      clearTimeout(errorTimeout);

      if (data
          && data.objects
          && data.objects.length > 0
          && data.objects[0].external_id) {
        var vtd = data.objects[0].external_id;
        var precinctId = self.vtdToPctcode(vtd);
        self.activatePrecinct(precinctId);
        self.indicateWaitingFinished();
        self.addMapPin(lat, lng);
      } else {
        self.displayGeocodeError("We are having trouble locating your precinct.");
      }
    });
  },

  addMapPin: function(lat, lng) {
    var self = this;

    L.marker([lat, lng]).addTo(self.map);
  },

  activatePrecinctTooltip: function(precinctId) {
    var self = this;

    var precinctCandidates = {
      candidates: self.sortCandidates(self.results.precincts[precinctId].candidates),
      id: precinctId
    };

    self.$mapTooltipTarget.html(self.mapTooltipTemplate({
      precinctCandidates: precinctCandidates
    }));
  },

  activatePrecinct: function(precinctId) {
    var self = this;

    self.deactivateAllPrecincts();

    var precinctCandidates = {
      candidates: self.sortCandidates(self.results.precincts[precinctId].candidates),
      id: precinctId
    };

    self.$precinctTarget.html(self.precinctTemplate({
      precinctCandidates: precinctCandidates
    }));

    var $precinct = $('.precinct-id-' + precinctId);

    if ($precinct && $precinct.length > 0) {
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

  displayGeocodeError: function(error) {
    var self = this;

    self.indicateWaitingFinished();
    alert(error);
  },

  indicateWaitingFinished: function() {
    var self = this;

    if (self.waiting) {
      window.clearInterval(self.waiting);
    }
    self.$addressButton.html('Find precinct');
    self.$addressButton.removeClass('loading');
    self.isWaiting = false;
  },

  indicateWaiting: function(button) {
    var self = this;

    var i = 0;

    self.isWaiting = true;
    self.$addressButton.addClass('loading');
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
};

var m = map.init();

