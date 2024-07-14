let westUSACoords = [36.8904, -123.1565];
let mapZoomLevel = 5;

let myMap = L.map("map", {
  center: westUSACoords,
  zoom: mapZoomLevel
});

let baseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Satellite layer using Esri
let satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

let baseMaps = {
  "Base Map": baseMap,
  "Satellite": satelliteMap
};

let eqMaps = L.layerGroup();
let pbBoundaries = L.layerGroup();

let overlayMaps = {
  "Earthquakes": eqMaps,
  "Tectonic Plates": pbBoundaries
};

// Add the layer control to the map with collapsed set to false
L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);

function getColor(depth) {
  return depth > 90 ? '#d73027' :
         depth > 70 ? '#fc8d59' :
         depth > 50 ? '#fee08b' :
         depth > 30 ? '#d9ef8b' :
         depth > 10 ? '#91cf60' :
                      '#1a9850'; // This covers depths ≤ 10
}

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

// Fetch earthquake data and add to eqMaps layer
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson').then(function(response) {
  let quakes = response.features;
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

    eqMaps.addLayer(marker);
  });

  eqMaps.addTo(myMap); // Add to map initially if desired
});

// Fetch PB2002_boundaries.json data from GitHub and add to pbBoundaries layer
d3.json('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json').then(function(data) {
  // Assuming the data is GeoJSON
  L.geoJSON(data, {
    style: function (feature) {
      return { color: 'orange' }; // Use a different color for better visibility
    }
  }).addTo(pbBoundaries);

  pbBoundaries.addTo(myMap); // Add to map initially if desired
});

