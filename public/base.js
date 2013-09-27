var map = {
  colorScheme: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],

  init: function() {
    var self = this;

    self.map = L.map('map-target', {
      scrollWheelZoom: false
    })
    self.map.setView([44.97, -93.265], 12);
    self.addTonerLayer();
    self.addPrecinctLayer();
  },

  addTonerLayer: function() {
    var self = this;

    self.tonerLayer = new L.TileLayer(
      'http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png',
      {
        'opacity': 0.7,
        'subdomains': ['a', 'b', 'c', 'd'],
        'attribution': 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>.<br />Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
      }
    );

    self.map.addLayer(self.tonerLayer);
  },

  addPrecinctLayer: function() {
    var self = this;

    // TODO remove d3 dependency
    d3.json('precincts-hennepin.json', function(error, data) {
      console.log(data);
      var geoJson = topojson.feature(data, data.objects.hennepin).features;
      console.log(geoJson);

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
    });
  },

  stylePrecinct: function(d, self) {
    var self = self;

    var rand = Math.floor(Math.random() * 7);
    return {
      fillColor: self.colorScheme[rand],
      fillOpacity: 0.7,
      weight: 0.5,
      color: '#fff'
    };
  }
}

m = map.init();

