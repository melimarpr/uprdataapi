function onMapGenerate(){
		uni = $( "#recinto option:selected" ).text();
		console.log(uni);

		$("#map").html();
		var map = L.map('map').setView([18.185678, -66.270575], 9);

		L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="https://github.com/miguelrios/atlaspr">AtlasPR</a>, ' +
				'UPR Admissions Data &copy; <a href="http://data.pr.gov">data.pr.gov</a>',
			id: 'examples.map-20v6611k'
		}).addTo(map);


		// control that shows state info on hover
		var info = L.control();

		info.onAdd = function (map) {
			this._div = L.DomUtil.create('div', 'info');
			this.update();
			return this._div;
		};

		info.update = function (props) {
                        if (props) {
                            name = props.NAME;
                            name = replaceSpecialChars(name.toUpperCase());
                            avgIGS = (!moreData[name]) ? "N/A" : moreData[name]["AVG"];
                        }
                        
			this._div.innerHTML = '<h4>Average IGS per Municipality</h4>' +  (props ?
				'<b>' + props.NAME + '</b><br />Average IGS: ' + avgIGS
				: 'Hover over a municipality');
		};

		info.addTo(map);


		// get color depending on population density value
		function getColor(d) {
			return d >= 350 ? '#800026' :
			       d >= 300 ? '#BD0026' :
			       d >= 250 ? '#E31A1C' :
			       d >= 200 ? '#FC4E2A' :
			       d >= 150 ? '#FD8D3C' :
			       d >= 100 ? '#FEB24C' :
			       d >  50  ? '#FED976' :
			                  '#FFEDA0';
		}

		function style(feature) {
                        name = feature.properties.NAME;
                        name = replaceSpecialChars(name.toUpperCase());
                        color = (!moreData[name]) ? getColor(0) : getColor(moreData[name]["AVG"]);
                        
                        //console.log("NAME="+name+", C="+color);
			return {
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7,
				fillColor: color
			};
		}

		function highlightFeature(e) {
			var layer = e.target;

			layer.setStyle({
				weight: 5,
				color: '#666',
				dashArray: '',
				fillOpacity: 0.7
			});

			if (!L.Browser.ie && !L.Browser.opera) {
				layer.bringToFront();
			}

			info.update(layer.feature.properties);
		}

		var geojson;

		function resetHighlight(e) {
			geojson.resetStyle(e.target);
			info.update();
		}

		function zoomToFeature(e) {
			map.fitBounds(e.target.getBounds());
		}

		function onEachFeature(feature, layer) {
			layer.on({
				mouseover: highlightFeature,
				mouseout: resetHighlight,
				click: zoomToFeature
			});
		}

                var moreData;
                http = "http://localhost/uprdataapi/api.php?uni="+uni;
                console.log(http);
                $.getJSON(http, function(data) {
                	//console.log(data);
                    //console.log(data["UTUADO"]["AVG"]);
                    moreData = data;
                    geojson = L.geoJson(municipalitiesData, {
                    style: style,
                    onEachFeature: onEachFeature
                }).addTo(map);
                });
                
		var legend = L.control({position: 'bottomright'});

		legend.onAdd = function (map) {

			var div = L.DomUtil.create('div', 'info legend'),
				grades = [0, 50, 100, 150, 200, 250, 300, 350],
				labels = [],
				from, to;

			for (var i = 0; i < grades.length; i++) {
				from = grades[i];
				to = grades[i + 1];

				labels.push(
					'<i style="background:' + getColor(from + 1) + '"></i> ' +
					from + (to ? '&ndash;' + to : '+'));
			}

			div.innerHTML = labels.join('<br>');
			return div;
		};

		legend.addTo(map);

                function replaceSpecialChars(str) {
                    var dict = {"Á":"A", "É":"E", "Í":"I", "Ó":"O", "Ú":"U", "Ñ":"N", "Ü":"U"};

                    return str.replace(/[^\w ]/g, function(char) {
                      return dict[char] || char;
                    });
                }
}