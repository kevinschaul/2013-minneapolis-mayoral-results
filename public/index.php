<?php readfile('http://www.startribune.com/templates/vh?vid=229128501&sosp=/politics'); ?>

<link rel="stylesheet" href="lib/leaflet.css" />
<!--[if lte IE 8]>
     <link rel="stylesheet" href="lib/leaflet.ie.css" />
 <![endif]-->

<link rel="stylesheet" href="css/fonts.css" />
<link rel="stylesheet" href="css/base.css" />

<!-- <h1>2013-9-26-election-results</h1>-->

<div class="graphic">
  <div class="results">
    <div class="col col1">
      <div id="results-target"></div>      
      <div id="precinct-target"></div>
    </div>
    <div class="col col2">
      <div class="results-header">
        <form action="" id="address-form">
          <input class="input" id="address" placeholder="Enter your home address" />
          <button type="submit" class="formButton large" id="address-button">Find precinct</button>
        </form>
        <div class="clear"></div>
      </div>
      <div class="map-wrapper">
        <div id="map-key">
            <div class="candidate">
              <div class="color" style="background-color: #aaaaaa;"></div>
              <span class="name">Other candidates</span>
            </div> 
            <div class="clear"></div>
            <div class="candidate">
              <div class="color" style="background-color: #d0d0d0;"></div>
              <span class="name">Tie</span>
            </div>
        </div>
        <div id="map-tooltip-target"></div>
        <div id="map-target"></div>
      </div>
    </div>
    <div class="clear"></div>
    <div class="results-footer">
      <span class="sources">Source: <a href="www.sos.state.mn.us" target="_blank">Minnesota Secretary of State</a>. Geocoding provided by <a target="_blank" href="http://developer.mapquest.com/web/products/open/geocoding-service">MapQuest</a>. Map tiles by <a target="_blank" href="http://stamen.com">Stamen Design</a>, under <a target="_blank" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_blank" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_blank" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.</span>
      <div class="clear"></div>
    </div>
  </div>

</div>

<script type="text/template" id="total-template">
<div class="wrapper">
  <div class="header">
    <span class="precinct-title">Citywide total</span>
    <span class="last-updated">Last updated <%= lastUpdated %></span>
    <span class="reporting"><%= precinctsReporting %> reporting</span>
    <span class="percents-headers">
      <span class="percent-header">1st choice</span>
      <span class="percent-header">2nd choice</span>
      <span class="percent-header">3rd choice</span>
    </span>
    <div class="clear"></div>
  </div>

  <div class="candidates">
    <% _.each(totalCandidates, function(c, i, l) { %>
        <div class="candidate candidate-<%= c.id %>">
          <div class="color"></div>
          <span class="name"><%= c.first_name %> <%= c.last_name %> <%= c.suffix %></span>
          <span class="percents">
            <span class="percent percent-1"><%= c.first_choice_percent.toFixed(1) %>%</span>
            <span class="percent percent-2"><%= c.second_choice_percent.toFixed(1) %>%</span>
            <span class="percent percent-3"><%= c.third_choice_percent.toFixed(1) %>%</span>
          </span>
          <div class="clear"></div>
        </div>
    <% }); %>
  </div>
</div>
</script>

<script type="text/template" id="precinct-template">
<div class="wrapper precinct precinct-id-<%= precinctCandidates.id %>" data-id="<%= precinctCandidates.id %>">
  <div class="header">
    <span class="precinct-title">Precinct <%= precinctCandidates.id %></span>
    <span class="last-updated">Last updated <%= lastUpdated %></span>
    <span class="return-total">Return to citywide results</span>
    <span class="percents-headers">
      <span class="percent-header">1st choice</span>
      <span class="percent-header">2nd choice</span>
      <span class="percent-header">3rd choice</span>
    </span>
    <div class="clear"></div>
  </div>

  <div class="candidates">
    <% _.each(precinctCandidates.candidates, function(c, i) { %>
        <div class="candidate candidate-<%= c.id %>">
          <div class="color"></div>
          <span class="name"><%= c.first_name %> <%= c.last_name %> <%= c.suffix %></span>
          <span class="percents">
            <span class="percent percent-1"><%= c.first_choice_percent.toFixed(1) %>%</span>
            <span class="percent percent-2"><%= c.second_choice_percent.toFixed(1) %>%</span>
            <span class="percent percent-3"><%= c.third_choice_percent.toFixed(1) %>%</span>
          </span>
          <div class="clear"></div>
        </div>
    <% }); %>
  </div>
</div>
</script>

<script type="text/template" id="map-tooltip-template">
<div class="wrapper precinct precinct-id-<%= precinctCandidates.id %>" data-id="<%= precinctCandidates.id %>">
  <div class="header">
    <span class="precinct-title" id="tooltip-precinct-title">Precinct <%= precinctCandidates.id %></span>
    <span class="percents-headers">
      <span class="percent-header">1st choice</span>
      <span class="percent-header">2nd choice</span>
      <span class="percent-header">3rd choice</span>
    </span>
    <div class="clear"></div>
  </div>

  <div class="candidates">
    <% _.each(precinctCandidates.candidates, function(c, i) { %>
        <% if (i < 6) { %>
          <div class="candidate candidate-<%= c.id %>">
            <div class="color"></div>
            <span class="name"><%= c.first_name %> <%= c.last_name %> <%= c.suffix %></span>
            <span class="percents">
              <span class="percent percent-1"><%= c.first_choice_percent.toFixed(1) %>%</span>
              <span class="percent percent-2"><%= c.second_choice_percent.toFixed(1) %>%</span>
              <span class="percent percent-3"><%= c.third_choice_percent.toFixed(1) %>%</span>
            </span>
            <div class="clear"></div>
          </div>
        <% } %>
    <% }); %>
  </div>
</div>
</script>

<script src="lib/jquery-1.10.2.min.js" type="text/javascript" charset="utf-8"></script>
<script src="lib/underscore-min.js" type="text/javascript" charset="utf-8"></script>
<script src="lib/leaflet.js" type="text/javascript" charset="utf-8"></script>
<script src="lib/moment.min.js" type="text/javascript" charset="utf-8"></script>
<script src="base.js" type="text/javascript" charset="utf-8"></script>

<?php readfile('http://www.startribune.com/templates/vf?vid=229128501&sosp=/politics'); ?>

