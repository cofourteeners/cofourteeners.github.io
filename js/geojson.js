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
  popupAnchor:  [0, -210]
});
var trailheadIcon = L.icon({
  iconUrl: "images/parking-15.svg",
  iconSize:     [10, 10],
  iconAnchor:   [5, 5],
  popupAnchor:  [0, -150]
});
var routeIcon = L.icon({
  popupAnchor:  [0, -150]
});


function pointToLayer(feature, latlng, attrs){
  // Peak Variables
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

  var layer = L.marker(latlng, options);
  
  // Peak Label
  var popupContent = 
    "<p><b>" + peakRange + "</b><br>" +
    "<b>" + peakRank + ".</b> " + peakLabel + "</p>" +
    "<p><b>Average difficulty:</b> " + peakDifficulty + " out of 5<br>" +
    "<b># of routes:</b> " + peakRoutes + "<br>" +
    "<b>Elevation:</b> " + peakElevation.toLocaleString() + "' <br>" +
    "<b>Visitors:</b> " + peakPopularity/*.toLocaleString()*/ + " per year <br>" +
    "<b>Isolation:</b> " + peakIsolation/*.toFixed(2)*/ + " miles <br>" +
    "<b>Prominence:</b> " + peakProminence/*.toLocaleString()*/ + "'</p>"
  ;
  
  // Event listeners 
  layer.on({
    mouseclick: function() {
      this.openPopup();
    },
    mouseclick: function() {
      this.closePopup();
    }
  });
  layer.bindPopup(popupContent, {
    offset: new L.Point(0),
    closeButton: false
  });
  return layer;
};


// Create peak symbols
function createPeakSymbols(data, map, attrs) {
  L.geoJSON(data, {
    pointToLayer: function(feature, latlng) {
      options = {icon: peakIcon};
      return pointToLayer(feature, latlng, attrs);
    }
  }).addTo(map);
};
// Create trailhead symbol
function createTrailheadSymbols(data, map, attrs) {
  L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
      options = {icon: trailheadIcon};
      return pointToLayer(feature, latlng, attrs);
    },
    onEachFeature: function(feature, layer) {
      // Trailhead Variables
      var trailheadName = feature.properties["Name"];
      var trailheadElev = feature.properties["Elevation"];
      var trailheadLabel = feature.properties["Label"];
      var trailheadRange = feature.properties["Range"];
      var trailheadDiff = feature.properties["Difficulty"];
      var trailheadPeaks = feature.properties["Peaks"];
      
      // Trailhead Label
      var popupContent = 
        "<p><b>" + trailheadLabel + "</b><br>" +
        "<b>" + "Road Difficulty" + ":</b> " + trailheadDiff + " out of 6</p>" +
//        "<p><b>Elevation</b> " + trailheadElev + "'<br>" +
        "<b>Range:</b> " + trailheadRange + "<br>" +
        "<b>Peak(s):</b> " + trailheadPeaks + "</p>"
      ; 
        
      layer.bindPopup(popupContent);
    }
  }).addTo(map);
}
// Create route symbol
function createLineSymbols(data, map, attrs) {
  route = L.geoJSON(data, {
    style: {
      color: "#2166AC",
      opacity: 0.5,
      weight: 5
    },
    
    onEachFeature: function(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
      })
      
      // Route Variables
      var routeName = feature.properties["Name"];
      var routeClass = feature.properties["Class"];
      var routeClass2 = feature.properties["Qualifier"];
      var routeLabel = feature.properties["Label"];
      var routeElevGain = feature.properties["ElevGain"];
      var routeDistRT = feature.properties["DistRT"];
      var routeExposure = feature.properties["Exposure"];
      var routePeaks = feature.properties["Peaks"];
      
      // Route Label
      var popupContent = 
        "<p><b>" + routeLabel + "</b><br>" +
        "<b>" + "Class" + ":</b> " + routeClass + routeClass2 + "</p>" +
        "<p><b>Elevation Gain:</b> " + routeElevGain + "'<br>" +
        "<b>Distance:</b> " + routeDistRT + " miles RT<br>" +
        "<b>Exposure:</b> " + routeExposure + "<br>" +
        "<b>Peak(s):</b> " + routePeaks + "</p>"
      ;
      layer.bindPopup(popupContent);
      
    }
  }).addTo(map);
}

// Process data
function processData(data) {
  var attrs = [];
  var properties = data.features[0].properties;
//  console.log(properties);
  for (var attr in properties){
    if (attr.indexOf("rank") > -1){
      attrs.push(attr);
    };
  };

//  console.log(attrs);
  return attrs;
};
// Call GeoJSON data w/ functions
function getDataSC(map){
  $.ajax("data/peaks.geojson", {
    dataType: "JSON",
    success: function(response){
      // Create array 
      var attrs = processData(response);
      
      createPeakSymbols(response, map, attrs);
      filterRange(map, attrs);
    }
  });
  $.ajax("data/trailheads.geojson", {
    dataType: "JSON",
    success: function(response){
      // Create array 
      var attrs = processData(response);
      
      createTrailheadSymbols(response, map, attrs);
      filterRange(map, attrs);
    }
  });
  $.ajax("data/routes.geojson", {
    dataType: "JSON",
    success: function(response){
      // Create array 
      var attrs = processData(response);
      
      createLineSymbols(response, map, attrs);
      filterRange(map, attrs);
    }
  });
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

function highlightFeature(e) {
  var layer = e.target;
  
  layer.setStyle({
    weight: 15,
    color: "#B2182B",
    fillOpacity: 0.5
  });
}
function resetHighlight(e) {
  var layer = e.target;
  
  route.resetStyle(layer);
}

$(document).ready(createMap);
