let westUSACoords = [36.8904, -123.1565];
let mapZoomLevel = 5;

let myMap = L.map("map", {
  center: westUSACoords,
  zoom: mapZoomLevel
});

let baseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

let baseMaps = {
  "Base Map": baseMap
};

let eqMaps = L.layerGroup();

let overlayMaps = {
  "EQ Map": eqMaps
};

// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps).addTo(myMap);

function getColor(depth) {
  return depth > 90 ? '#d73027' :
         depth > 70 ? '#fc8d59' :
         depth > 50 ? '#fee08b' :
         depth > 30 ? '#d9ef8b' :
         depth > 10 ? '#91cf60' :
                      '#1a9850'; // This covers depths ≤ 10
}

d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson').then(function(response) {
  // Access the features array inside the response object
  let quakes = response.features;
  
  // Add earthquake markers to the eqMaps layer group
  quakes.forEach(function(quake) {
    let coords = quake.geometry.coordinates;
    let place = quake.properties.place;
    let magnitude = quake.properties.mag;
    let depth = quake.geometry.coordinates[2];
    let time = new Date(quake.properties.time).toLocaleString();

    let marker = L.circleMarker([coords[1], coords[0]], {
      radius: magnitude * 5,
      color: 'green',
      fillColor: getColor(depth),
      fillOpacity: 0.8
    }).bindPopup(`<strong>${place}</strong><br>Time: ${time}`);

    // Add the marker to the eqMaps layer group
    eqMaps.addLayer(marker);
  });

  // Add the eqMaps layer group to the map
  eqMaps.addTo(myMap);

  // Create the legend content
  createLegend();
});

// Create the legend content
function createLegend() {
  var legend = document.getElementById('legend');
  var grades = [-10, 10, 30, 50, 70, 90];
  var labels = [];
  var from, to;

  for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    to = grades[i + 1];

    labels.push(
      '<div class="legend-item"><i style="background-color:' + getColor(from + 1) + '"></i> ' +
      from + (to ? '&ndash;' + to : '+') + '</div>');
  }

  legend.innerHTML = labels.join('');
}

// Ensure the legend is always visible
createLegend();
