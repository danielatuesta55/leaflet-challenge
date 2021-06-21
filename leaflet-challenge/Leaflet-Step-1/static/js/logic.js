// I created the following code with the help from my TA ERin Willis, Tutor Trent Littel and student John Strode.
function popUpMsg(feature, layer) {
    layer.bindPopup(
        "<h3>" +
        feature.properties.place +
        "</h3><hr><p>" +
        new Date(feature.properties.time) +
        "</p>"
    );
}

// Define streetmap layer
var streetmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "streets-v11",
        accessToken: API_KEY,
    }
);

// Define darkmap layer
var darkmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY,
    }
);

// Define outdoorsmap layer
let outdoorsmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "outdoors-v11",
        accessToken: API_KEY,
    }
);

// Define satellitemap layer
let satellitemap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "satellite-v9",
        accessToken: API_KEY,
    }
);

// Define a baseMaps object to hold our base layers
let baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    Outdoors: outdoorsmap,
    "Satellite Map": satellitemap,
};

// Create our map, giving it the streetmap and earthquakes layers to display on load
var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [streetmap], //default selected layer
});

// Add streetmap tile to map
streetmap.addTo(myMap);

// create earthquakes & faultlines layers;  attach data later on
var earthquakes = new L.LayerGroup();
let faultlines = new L.LayerGroup();

// Create overlay object to hold our overlay layer
let overlayMaps = {
    Earthquakes: earthquakes,
    "Fault Lines": faultlines,
};

// Create a layer control
// Pass in our baseMaps and overlayMaps
// Set collapsed to false to show options in layer control
L.control
    .layers(baseMaps, overlayMaps, {
        collapsed: false,
    })
    .addTo(myMap);

var queryUrl =
    "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
    "2014-01-02";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    L.geoJSON(data, {
        onEachFeature: popUpMsg,
        pointToLayer: function(feature, latlng) {
            return new L.CircleMarker(latlng, {
                color: circleColor(feature.geometry.coordinates[2]),
                radius: feature.properties.mag * 7,
                fillOpacity: 0.5,
            });
        },
    }).addTo(earthquakes);

    earthquakes.addTo(myMap);
});

var faultUrl =
    "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(faultUrl, function(data) {
    // Create a GeoJSON layer containing the faultlines object
    L.geoJSON(data, {
        style: function() {
            return {
                color: "red",
                weight: "1.5",
                opacity: 0.8,
            };
        },
    }).addTo(faultlines);

    faultlines.addTo(myMap);
});

// Legend Control
var legend = L.control({ position: "bottomright" }); // Help form TA Erin and Tutor Littel
legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend');
    var depth = [0,6.25,12.5,25];
    var labels = ['<strong>Depth of earthquake</strong>'];
    
    var colors = ["#b32d2e","#bd8600","#f2d675","#1ed14b"];

    for (var i = 0; i < depth.length; i++) {
        console.log(colors[i]);
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }
    //div.innerHTML = lables.join('<br>');
    return div;
};
legend.addTo(myMap);

// Conditionally color the circle markers
// Changin depth for
function circleColor(depth) { 
    if (depth > 25) {
        color = "#b32d2e";
    } else if (depth > 12.5) {
        color = "#bd8600";
    } else if (depth > 6.25) {
        color = "#f2d675";
    } else {
        color = "#1ed14b";
    }
    return color;
}