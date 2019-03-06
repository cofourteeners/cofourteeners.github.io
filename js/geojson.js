//// Map & Tilelayers
function createMap() {
  // Define map
  var map = L.map("map", {
      center: [39, -106],
      zoom: 7
  });

  // Add OSM base tilelayer 
  var osmTileLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}").addTo(map);
//  https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}

  // Call data on map
  getDataSC(map);
  //getDataFilter(map);
  
  // Add legend to map
  //legend.addTo(map);
};

// Custom markers
var peakIcon = L.icon({
  iconUrl: "images/mountain-15.svg",
  iconSize:     [20, 20],
  iconAnchor:   [10, 10],
  popupAnchor:  [0, -220]
});
var trailheadIcon = L.icon({
  iconUrl: "images/parking-15.svg",
  iconSize:     [10, 10],
  iconAnchor:   [5, 5],
  popupAnchor:  [0, -180]
});

// Calculate proportional symbol radius
function calcPropRadius(propValue) {
  var scaleFactor = 35;
  var area = propValue * scaleFactor;
  var radius = Math.sqrt(area/Math.PI);
  return radius;
}

// Popup & Panel
function pointToLayer(feature, latlng, attrs){
  // Define "peak" attributes
  var attr = attrs[0];
  var peakElevation = feature.properties["Elevation"];
  var peakName = feature.properties["Name"];
  var peakRoutes = feature.properties["Routes"];
  var peakDifficulty = feature.properties["Difficulty"];
  var peakIsolation = feature.properties["Isolation"];
  var peakLabel = feature.properties["Label"];
  var peakPopularity = feature.properties["Popularity"];
  var peakProminence = feature.properties["Prominence"];
  var peakRange = feature.properties["Range"];
  var peakRank = feature.properties["Rank"];
  // Define "trailhead" attributes
  var trailheadName = feature.properties["Name"];
  // Define "route" attributes
  var routeName = feature.properties["Name"];
  var routeClass = feature.properties["Class"];
  var routeClass2 = feature.properties["Qualifier"];
  var routeLabel = feature.properties["Label"];
  var routeElevGain = feature.properties["ElevGain"];
  var routeDistRT = feature.properties["DistRT"];
  var routeExposure = feature.properties["Exposure"];
  var routePeaks = feature.properties["Peaks"];
  
  // Define radius attribute 
  /*var propValue = Number(peakRank);*/
  // Define symbology
  /*var options = {
    weight: 1.5,
    opacity: 1,
    color: "#FFF",
    dashArray: "2",
    fillOpacity: 0.5
  };*/
//  options.radius = calcPropRadius(propValue);
//  options.fillColor = getColor(propValue);
  
  var layer = L.marker(latlng, options);
  
  var popupContent = 
    // Peak Label
    "<p><b>" + peakRange + "</b><br>" +
    "<b>" + peakRank + ".</b> " + peakLabel + "</p>" +
    "<p><b>Average difficulty:</b> " + peakDifficulty + " out of 5<br>" +
    "<b># of routes:</b> " + peakRoutes + "<br>" +
    "<b>Elevation:</b> " + peakElevation + "' <br>" +
    "<b>Visitors:</b> " + peakPopularity + " per year <br>" +
    "<b>Isolation:</b> " + peakIsolation + " miles <br>" +
    "<b>Prominence:</b> " + peakProminence + "'</p>"
    // Route Label
    /*"<p><b>" + routeName + "</b><br>" +
    "<b>" + "Class" + ":</b> " + routeClass + routeClass2 + "</p>" +
    "<p><b>Elevation Gain:</b> " + routeElevGain + "'<br>" +
    "<b>Distance:</b> " + routeDistRT + " miles<br>" +
    "<b>Exposure:</b> " + routeExposure + "<br>" +
    "<b>Peaks:</b> " + routePeaks + "</p>"*/
  ;

  var panelContent = 
    // Rank Label
    "<p><b>" + peakRank + ". </b>" +
    // Peak Label
    "<b>" + peakName + "</b></p>" +
    // Elevation Label
    "<p><b>Elevation: </b>" + peakElevation + "'</p>" + 
    // Range Label
    "<p><b>Locale: </b>" + peakRange
    "</p><br>"
  ;
  
  // Event listeners 
  layer.on({
    mouseover: function() {
      this.openPopup();
    },
    mouseout: function() {
      this.closePopup();
    },
    click: function() {
      $("#panel").html(panelContent);
    }
  });
  layer.bindPopup(popupContent, {
    offset: new L.Point(0, -options.radius),
    closeButton: false
  });
  return layer;
};

// Create proportional symbols
function createPropSymbols(data, map, attrs) {
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      options = {icon: peakIcon};
      return pointToLayer(feature, latlng, attrs);
    }
  }).addTo(map);
};
// Create standard symbol
function createStandardSymbols(data, map, attrs) {
  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      options = {icon: trailheadIcon};
      return L.marker(latlng, options);
      //return pointToLayer(feature, latlng, attrs);
    }
  }).addTo(map);
}
// Create line symbol
function createLineSymbols(data, map) {
  L.geoJSON(data, {
    style: function(feature) {
      switch (feature.properties.class) {
        case 1:   return {color: "#2166AC"};
        case 2:   return {color: "#67A9CF"};
        case 3:   return {color: "#EF8A62"};
        case 4:   return {color: "#B2182B"};
      }
    }
  }).addTo(map);
}

// Process data
function processData(data) {
  var attrs = [];
  var properties = data.features[0].properties;
  //console.log(properties);
  for (var attr in properties){
    if (attr.indexOf("rank") > -1){
      attrs.push(attr);
    };
  };

  console.log(attrs);
  return attrs;
};
// Call GeoJSON data w/ functions
function getDataSC(map){
  $.ajax("data/peaks.geojson", {
    dataType: "json",
    success: function(response){
      // Create array 
      var attrs = processData(response);
      
      createPropSymbols(response, map, attrs);
      createSequenceControls(map, attrs);
      filterRange(map, attrs);
    }
  });
  $.ajax("data/trailheads.geojson", {
    dataType: "json",
    success: function(response){
      // Create array 
      var attrs = processData(response);
      
      createStandardSymbols(response, map, attrs);
      filterRange(map, attrs);
    }
  });
  $.ajax("data/routes.geojson", {
    dataType: "json",
    success: function(response){
      // Create array 
      var attrs = processData(response);
      
      createLineSymbols(response, map, attrs);
      filterRange(map, attrs);
    }
  });
};



// Choropleth
function getColor(val) {
  return  val > 55 ? "#B2182B":
          val > 50 ? "#EF8A62":
          val > 40 ? "#FDDBC7":
          val > 30 ? "#D1E5F0":
          val > 20 ? "#67A9CF":
          val > 10 ? "#2166AC":
                     "#F7F7F7";
};

// Mountain Range Filter
function filterRange(map, attr) {
  $(".filter-UI a").on("click", function() {
    // Get filter attribute values
    var filter = $(this).data("filter");
    $(this).addClass("active").siblings().removeClass("active");
    markers.setFilter(function(f) {
      return (filter === "all") ? true: f.properties[filter] === true;
    });
    return false;
  });
}

//// Filter
// Filter by range
// Create Group Layers & Filter Function
/*var groupLayers = [];
L.geoJSON(data, {onEachFeatLayer: onEachFeatLayer}).addTo(map);
function onEachFeatLayer(feat, featLayer) {
  var rangeGL = groupLayers[feat.properties["range"]];
  if (rangeGL === undefined) {
    rangeGL = new L.layerGroup();
    rangeGL.addTo(map);
    groupLayers[feat.properties["range"]] = rangeGL;
  }
  rangeGL.addLayer(featLayer);
}
showLayer("Front Range");
function showLayer(id) {
  var rangeGL = groupLayers[id];
  map.addLayer(rangeGL);   
}
function hideLayer(id) {
  var rangeGL = groupLayers[id];
  map.removeLayer(rangeGL);   
}
*/
/*
// Create Filter
function createFilter(data, map) {
  // Define range attribute
  var attr = "forecast";
  // 
  L.geoJSON(data, {
    filter: function(feature, layer) {
      return feature.properties[attr];
    }
  }).addTo(map);
};
// Call Filter
function getDataFilter(map){
  $.ajax("data/peaks_weather.geojson", {
    dataType: "json",
    success: function(response){
      createFilter(response, map);
    }
  });
};
*/

//// Legend
/*
function createLegend(feature, map) {
  var temps = [10, 20, 30, 40, 50, 55];
  for (var i = 0; i < temps.length; i++) {
    $("#panel").append(
      "<p><b>Peak:</b> " + feature.properties["name"] + "</p>";
      //"<p>" + getColor(temps[i] + 1) + feature.properties["rank"] + "</p>";
    );
  }
};
*/

$(document).ready(createMap);
