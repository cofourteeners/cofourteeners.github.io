//// Map & Tilelayers
function createMap() {
  // Add tile layers
  var basemap = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      attribution: "ESRI"
  });
  var terrain = L.tileLayer(
    "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}{r}.{ext}", {
      ext: "png",
      attribution: "Stamen Design"
  });
  var imagery = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "ESRI"
  });
  var weather = L.tileLayer.wms(
    "http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {
      layers: "nexrad-n0r-900913",
      format: "image/png",
      transparent: true,
      opacity: 0.7,
      attribution: "IEM Nexrad"
  });
  
  // Add group layers
  layers = L.layerGroup();
  
  // Define map
  var map = L.map("map", {
    center: [39, -106], //[39, -96],
    zoomDelta: 0.25,
    zoomSnap: 0.25,
    zoom: 7, //5,
    layers: [basemap, weather]
  });
  
  // Set up controls
  var baseMaps = {
    "Basemap": basemap,
    "Terrain": terrain,
    "Imagery": imagery
  };
  var overlayMaps = {
    "Weather": weather
  };
  L.control.layers(baseMaps, overlayMaps).addTo(map);
  
  // Marker cluster
  markerClusters = L.markerClusterGroup({
    disableClusteringAtZoom: 10,
    maxClusterRadius: 70,
    removeOutsideVisibleBounds: true,
    spiderfyOnMaxZoom: false
  });
  markerClusters2 = L.markerClusterGroup({
    disableClusteringAtZoom: 10,
    maxClusterRadius: 70,
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: false,
    zoomToBoundsOnClick: false
  });
  
//  markerSubGroup = L.featureGroup.subGroup(markerClusters, layers);
  
  map.addLayer(markerClusters);
//  map.addLayer(markerSubGroup); 

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
  peaks = L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
      options = {icon: peakIcon};
      return pointToLayer(feature, latlng, attrs);
    },
    onEachFeature: function(feature, layer) {
      // Peak Variables
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
      
      // Peak Label
      var popupContent = 
        "<p><b>" + peakRank + ".</b> " + peakLabel + "<br>" +
        "<b>" + peakRange + "</b><br></p>" +
        "<p><b>Average difficulty:</b> " + peakDifficulty + " out of 5<br>" +
        "<b># of Routes:</b> " + peakRoutes + "<br>" +
        "<b>Elevation:</b> " + peakElevation.toLocaleString() + "' <br>" +
        "<b>Visitors:</b> " + peakPopularity.toLocaleString() + " per year <br>" +
        "<b>Isolation:</b> " + peakIsolation.toFixed(2) + " miles <br>" +
        "<b>Prominence:</b> " + peakProminence.toLocaleString() + "'</p>"
      ;
      var label = "<p><b>" + peakName + "</b>"
        
      layer.bindPopup(popupContent);
      
      map.on("zoomend", function() {
        if (map.getZoom() < 10) {
          layer.bindTooltip(label);
        }
        else {
          layer.unbindTooltip(label);
        }
      });
      
    }
  })/*.addTo(map)*/;
  
  markerClusters.addLayer(peaks);
}
// Create trailhead symbol
function createTrailheadSymbols(data, map, attrs) {
  trailheads = L.geoJSON(data, {
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
        "<b>Range:</b> " + trailheadRange + "<br>" +
        "<b>Peak(s):</b> " + trailheadPeaks + "</p>"
      ; 
        
      layer.bindPopup(popupContent);
    }
  })/*.addTo(map)*/;
  
  map.on("zoomend", function() {
    if (map.getZoom() < 10) {
      markerClusters.removeLayer(trailheads);
    }
    else {
      markerClusters.addLayer(trailheads);
    }
  });
}
// Create route symbol
function createLineSymbols(data, map, attrs) {
  routes = L.geoJSON(data, {
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
      
      layer.bindTooltip(popupContent, {sticky: "false", opacity: "0.8"});
    }
  })/*.addTo(map)*/;
  
  map.on("zoomend", function() {
    if (map.getZoom() < 10) {
      markerClusters.removeLayer(routes);
    }
    else {
      markerClusters.addLayer(routes);
    }
  });
}
function createLineSymbols2(data, map, attrs) {
  var line = turf.lineString(data.toGeoJSON);
  var curved = turf.bezierSpline(line);
  curved.addTo(map);
}
// Create range symbol
function createPolySymbols(data, map, attrs) {
  ranges = L.geoJSON(data, {
    style: {
      color: "#2166AC",
      opacity: 0.5,
      weight: 5
    },
    
    onEachFeature: function(feature, layer) {      
      // Range Variables
      var rangeName = feature.properties["FolderPath"];
      
      // Range Label
      var popupContent = 
        "<p><b>" + rangeName + "</b><p>"
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
// Call GeoJSON data with functions
function getDataSC(map){
  $.ajax("data/peaks.geojson", {
    dataType: "JSON",
    success: function(response){
      // Create array 
      var attrs = processData(response);
      
      createPeakSymbols(response, map, attrs);
    }
  });
  $.ajax("data/trailheads.geojson", {
    dataType: "JSON",
    success: function(response){
      // Create array 
      var attrs = processData(response);
      
      createTrailheadSymbols(response, map, attrs);
    }
  });
  $.ajax("data/routes.geojson", {
    dataType: "JSON",
    success: function(response){
      // Create array 
      var attrs = processData(response);
      
      createLineSymbols(response, map, attrs);
    }
  });
};


// Highlight functions
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
  
  routes.resetStyle(layer);
}

function highlightFeatures(e) {
  var layer = e.target;
  var point = e.latlng;
  
  map.eachLayer(function(layer) {
    var bounds = layer.getBounds();
    if(bounds.contains(point)) {
       highlite(layer);
    }
  })
}

$(document).ready(createMap);
