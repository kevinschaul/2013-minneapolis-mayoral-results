var map = {
  width: 500,
  height: 500,

  init: function() {
    var self = this;

    self.projection = d3.geo.albers()
      .scale(60000)
      .center([2.53, 45.015])
      .translate([self.width / 2, self.height / 2])

    self.path = d3.geo.path()
      .projection(self.projection)

    self.svg = d3.select('#map-target').append('svg')
      .attr('width', self.width)
      .attr('height', self.height)

    d3.json('precincts-hennepin.json', function(error, data) {
      console.log(data);

      self.svg.append('g')
        .attr('class', 'precincts')
        .selectAll('path')
          .data(topojson.feature(data, data.objects.hennepin).features)
        .enter().append('path')
          .attr('d', self.path);
    })
  }
}

m = map.init();

