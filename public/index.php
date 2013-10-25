<?php readfile('http://www.startribune.com/templates/vh?vid=229128501&sosp=/politics'); ?>

<link rel="stylesheet" href="lib/leaflet.css" />
  <link rel="stylesheet" href="css/fonts.css" />
<link rel="stylesheet" href="css/base.css" />

<!-- <h1>2013-9-26-election-results</h1>-->

<div class="graphic">
  <div class="results">
    <div class="col col1">
      <div id="results-target"></div>
    </div>
    <div class="col col2">
    <div class="results-header">
      <form action="" id="address-form">
        <input class="input" id="address" placeholder="Your address" />
        <button type="submit" class="formButton large" id="address-button">Find precinct</button>
        <button class="formButton large" id="locate-button">Locate me</button>
      </form>
      <span id="feedback"></span>
      <div class="clear"></div>
    </div>
      <div id="map-target"></div>
    </div>
    <div class="clear"></div>
    <div class="results-footer">
      <span class="sources">Source: <a href="www.sos.state.mn.us" target="_blank">Minnesota Secretary of State</a>. Geocoding provided by <a target="_blank" href="http://developer.mapquest.com/web/products/open/geocoding-service">MapQuest</a>. Map tiles by <a target="_blank" href="http://stamen.com">Stamen Design</a>, under <a target="_blank" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_blank" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_blank" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.</span>
      <div class="clear"></div>
    </div>
  </div>

</div>

<script type="text/template" id="table-template">
<div class="wrapper">
  <div class="header">
    <span class="precinct-title">Total</span>
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
      <% if (i === 6) { %>
        <div class="show-all">Show all</div>
      <% } %>
        <div class="candidate candidate-<%= c.id %> <% if (i >= 6) { %>hide<% } %>">
          <div class="color"></div>
          <span class="name"><%= c.first_name %> <%= c.last_name %></span>
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

<% _.each(precinctsCandidates, function(d) { %>
  <div class="wrapper precinct precinct-id-<%= d.id %>" data-id="<%= d.id %>">
    <div class="header">
      <span class="precinct-title">Precinct <%= d.id %></span>
      <span class="show-on-map">Show on map</span>
      <span class="percents-headers">
        <span class="percent-header">1st choice</span>
        <span class="percent-header">2nd choice</span>
        <span class="percent-header">3rd choice</span>
      </span>
      <div class="clear"></div>
    </div>

    <div class="candidates">
      <% _.each(d.candidates, function(c, i) { %>
        <% if (i === 6) { %>
          <div class="show-all">Show all</div>
        <% } %>
          <div class="candidate candidate-<%= c.id %> <% if (i >= 6) { %>hide<% } %>">
            <div class="color"></div>
            <span class="name"><%= c.first_name %> <%= c.last_name %></span>
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
<% }); %>
</script>

<script src="lib/jquery-1.10.2.min.js" type="text/javascript" charset="utf-8"></script>
<script src="lib/underscore-min.js" type="text/javascript" charset="utf-8"></script>
<script src="lib/leaflet.js" type="text/javascript" charset="utf-8"></script>
<script src="base.js" type="text/javascript" charset="utf-8"></script>

<?php readfile('http://www.startribune.com/templates/vf?vid=229128501&sosp=/politics'); ?>

