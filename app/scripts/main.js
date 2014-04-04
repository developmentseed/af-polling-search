var App = App || {};

App = {

	home : {}

};


(function (){

	'use strict';

	// Initalizes a map of Afghanistan, adds home
	// and other icons
	App.Map = {

                siteLang: 'dari',

		init: function(){

			var that = this;

                        if ($('body').hasClass('en')) {
                            App.Map.siteLang = 'en';
                        }

			// display map
			var baseMap = App.Map.siteLang === 'dari' ?
                            'afghan-open.311hsemi,afghan-open.0kmiy66r':
                            'afghan-open.311hsemi,afghan-open.p1z41jor';


			this.map = L.mapbox.map('map', baseMap,{
    				tileLayer: {format: 'jpg80'}
				}).setView([34.361370, 66.363099], 6);
			this.layers = [];
			this.view = 'home';
                        this.fillSelect();

			function home() {
				$('#control').fadeIn(100);
				$('#title').fadeIn(100);
				//$('#title').html('Afghanistan <br> Polling Stations <em>2014</em>')
				$('#narrative').html('');
				$('.select-style').fadeOut(100);
				$('#back-button').fadeOut(100);
				$('#cross-hair').addClass('hide');
				clear();
				that.view = 'home';

			}

			function clear() {

				// that.map.off('moveend');
				that.map.off('dragend');
				that.layers.forEach(function (layer) {
					that.map.removeLayer(layer);
				});
				if (that.homeMarker !== undefined) {
					var temp = that.homeMarker;
					that.map.removeLayer(temp);
					that.homeMarker = null;
				}
				if (that.distanceMarker !== undefined){
					var temp = that.distanceMarker;
					that.map.removeLayer(temp);
					that.distanceMarker = null;
				}
			}

			// listen to control input
			function manualMap() {
				clear();
				$('#title').html('');
				that.initUserLocationEntry();
				$('#control').fadeOut(100);
				$('#title').fadeOut(100);
				$('.select-style').fadeIn(100);
				$('#back-button').fadeIn(100);
				$('#cross-hair').removeClass('hide');
				$('#callout').fadeOut(100);
				that._addDrag();
				that.view = 'manual';
			};

			$('#auto-map').on('click', function() {
				if (that.view !== 'home') {
					autoMap();
				}
			});

			function autoMap() {
			// $('#auto-map').on('click', function(){
				clear();
				that.view = 'auto';
				$('#title').html('');
				that.getUserGeoLocation();
				$('#title').fadeOut(100);
				$('#cross-hair').removeClass('hide');
				$('#callout').fadeOut(100);
                                //$('.select-style').fadeOut(100);
				that._addDrag();
			};

			function viewMap() {
			// $('#view-map').on('click', function(){
				$('#title').html('');

				$('#title').fadeOut(100);
				$('#control').fadeOut(100);
				// var locations = omnivore.geojson('data/locations.geojson')
				// .on('ready', function(layer) {
				// 	this.eachLayer(function(marker) {
				// 		marker.setIcon(L.divIcon({className: 'div-icon'}));
				// 	});
				// }).addTo(that.map);
				var locations = L.mapbox.tileLayer('afghan-open.0kmiy66r').addTo(that.map);
				// var gridLayer = L.mapbox.gridLayer('nate.x3ymbo6r').addTo(that.map);
				// var myGridControl = L.mapbox.gridControl(gridLayer).addTo(that.map);
				// console.log(gridLayer);
				that.layers.push(locations);
				// that.layers.push(gridLayer);
				//that.layers.push(myGridControl);

				$('#back-button').fadeIn(100);
				that.view = 'all';
			};

			var routes = {
				'/': home,
				'/manual-map': manualMap,
				'/auto-map': autoMap,
				'view-map': viewMap
			};

			var router = Router(routes);
			router.init();
		},

		addHome: function(point){
			L.marker([point.lat, point.lon]).addTo(this.map);
		},

		_addDrag: function () {
			var that = this;
			this.map.on('dragstart', function(e) {
				that.view = 'manual';
			})
			this.map.on('dragend', function(e) {
				App.home = {
					lat: that.map.getCenter().lat,
					lon: that.map.getCenter().lng,
				};
				that._renderHome(App.home);
				that.getClosestPollingStation();
			});
		},

		addPoint: function(point){
			L.marker([point.lat, point.lon]).addTo(this.map);
		},

		addPath:function(point1, point2){
			var polyline = L.polyline( [[point1.lat,point1.lon],[point2.lat,point2.lon]], {color: 'red'}).addTo(this.map);
			this.map.fitBounds(polyline.getBounds());
		},

		_renderHome : function(point){
			if (!this.homeMarker) {
				var locationIcon = L.divIcon({
                        className: "current-location",
						iconSize: [20, 20],
						iconAnchor: [8,12]
                });
				this.homeMarker = L.marker([point.lat, point.lon], {icon:locationIcon}).addTo(this.map);
			} else {
				this.homeMarker.setLatLng([point.lat, point.lon]).update();
			}
			// $('#narrative').html('You are here.');
		},

		_renderDestination: function(point, address){
			if (!this.distanceMarker) {
				 var targetIcon = L.divIcon({
						className: "dest-location",
						iconSize: [30, 30],
						iconAnchor: [15,17]
                    });
				this.distanceMarker = L.marker([point.lat, point.lon], {icon:targetIcon}).addTo(this.map);
			} else {
				// console.log(this.distanceMarker);
				this.distanceMarker.setLatLng([point.lat, point.lon]).update();
				// console.log(this.distanceMarker);
			}

			// from : http://www.geodatasource.com/developers/javascript
			var distance = function (lat1, lon1, lat2, lon2, unit) {
				var radlat1 = Math.PI * lat1/180;
				var radlat2 = Math.PI * lat2/180;
				var radlon1 = Math.PI * lon1/180;
				var radlon2 = Math.PI * lon2/180;
				var theta = lon1-lon2;
				var radtheta = Math.PI * theta/180;
				var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
				dist = Math.acos(dist);
				dist = dist * 180/Math.PI;
				dist = dist * 60 * 1.1515;
				if (unit=="K") { dist = dist * 1.609344 }
					if (unit=="N") { dist = dist * 0.8684 }
						return dist;
				};

				var dist = (distance(App.home.lat, App.home.lon, point.lat, point.lon, 'K')).toFixed(2);

				// $('#narrative').html('The closest polling station is here, at: '+address.name + ' , ' +address.location +
				// 	'. You are: '+dist + ' km away.' );
				var dari1 = "نزدیک ترین مرکز رای دهی در";
				var dari2 = "کیلو متری قرار دارد";
				$('#narrative').html(' ' + dari1 + ' '+ address.location + ' ،' + address.name + ' ' + dist + ' ' + dari2 + '.');

			return new L.featureGroup([L.marker([App.home.lat,App.home.lon]), L.marker([point.lat,point.lon])]);

		},

		getUserGeoLocation : function(){

			var that = this;
			if (navigator.geolocation) {
				// console.log(navigator.geolocation.getCurrentPosition())
				navigator.geolocation.getCurrentPosition(function(position){
					App.home = {
						lat : position.coords.latitude,
						lon :  position.coords.longitude
					};
					// console.log('getting getClosesPollingStation');
					that._renderHome(App.home);
					that.getClosestPollingStation();
				});
				return true;
			} else {
				// console.log('none');
				return false;
			}
		},

		getClosestPollingStation : function(){

			var that = this;
			var processData = function(strData) {

				var strDelimiter = ',';
				var objPattern = new RegExp(
					(
						// Delimiters.
						"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
						// Quoted fields.
						"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
						// Standard fields.
						"([^\"\\" + strDelimiter + "\\r\\n]*))"
					),
					"gi"
					);

				var arrData = [[]];
				var arrMatches = null;
				while (arrMatches = objPattern.exec( strData )){
					var strMatchedDelimiter = arrMatches[ 1 ];
					if (
						strMatchedDelimiter.length &&
						(strMatchedDelimiter != strDelimiter)
						){
						arrData.push( [] );
				}
				if (arrMatches[ 2 ]){
					var strMatchedValue = arrMatches[ 2 ].replace(
						new RegExp( "\"\"", "g" ),
						"\""
						);

				} else {
					var strMatchedValue = arrMatches[ 3 ];
				}
				arrData[ arrData.length - 1 ].push( strMatchedValue );
			}
			App.pollingStations= arrData;
			// console.log( arrData.length );
			that.getNearestNeighbor();
		}

                var csv_url = this.siteLang === 'dari' ?
                    'data/data_dr.csv' :
                    '../data/data_en.csv';
		$.ajax({
			type: "GET",
			url: csv_url,
			dataType: "text",
			success: function(data) {processData(data);}
		});
	},

	getNearestNeighbor : function(){

		var min = Infinity,
		minIndex = 0;

		var lineDistance = function ( point1, point2 ) {
			var xs = 0,
			ys = 0;
			xs = point2.x - point1.x;
			xs = xs * xs;
			ys = point2.y - point1.y;
			ys = ys * ys;
			return Math.sqrt( xs + ys );
		};
		for (var i = 1; i<App.pollingStations.length;i++){
			var p1 = {'x':App.home.lat, 'y':App.home.lon};
			var p2 = {'x':App.pollingStations[i][0], 'y':App.pollingStations[i][1]};
			var len = lineDistance(p1,p2);
			if (len < min){
				min = len;
				minIndex = i;
			}
		}
		var nearestPC = {'lon':App.pollingStations[minIndex][1], 'lat':App.pollingStations[minIndex][0]};
		// console.log('NEAREST PC');
		// console.log(nearestPC);
		var group = this._renderDestination(nearestPC, {
			'name' : App.pollingStations[minIndex][4] , 'location' : App.pollingStations[minIndex][3]
		});
		if (this.view == 'auto') {
			this.map.fitBounds(group.getBounds());
		}
		return minIndex;
	},

        districts: {
            json: false,
            urlDari: 'data/districts-dari.json',
            urlEn: '../data/districts-en.json',
            get: function(fn) {

                var url = this.siteLang === 'dari' ? this.districts.urlDari : this.districts.urlEn,
                    that = this,
                    topojson = this.districts.json;

                if (topojson) {
                    return topojson;
                }

                else {
                    topojson = omnivore.topojson(url).on('ready', function() {
                        that.districts.json = topojson;
                        if (fn) {
                            fn(topojson);
                        }
                    });
                }
            }
        },

        fillSelect: function() {
            var get = $.proxy(this.districts.get, this),
                that = this,
                default_text = this.siteLang === 'dari' ? 'ولسوالی تان را انتخاب کنید' : 'Choose your district',
                prop = this.siteLang === 'dari' ? 'dari_dist' : 'dist_name';

            get(function(topojson) {

                var distNames = {},
                    distOptions = $('#districts');

                for (var key in topojson._layers) {
                    distNames[topojson._layers[key].feature.properties[prop]] = topojson._layers[key];
                };

                distOptions.append($('<option />')
                                   .text(default_text)
                                   .val('default')
                                   .attr('selected', 'selected'));

                $.each(distNames, function(name) {
                    distOptions.append($('<option />').val(name).text(name));
                });

                distOptions.change(function() {
                    var district = $('select option:selected').val();
                    if (district === 'default') return;
                    that.map.fitBounds(distNames[district]);
                    setTimeout(function() {
                        App.home = {
                            lat: that.map.getCenter().lat,
                            lon: that.map.getCenter().lng,
                        };
                        that._renderHome(App.home);
                        that.getClosestPollingStation();
                    }, 1000);

                    window.location.hash = '/manual-map';
                    manualMap();
                });
            });
        },

	initUserLocationEntry : function() {
            var get = $.proxy(this.districts.get, this),
                that = this;

            get(function(topojson) {
                topojson.addTo(that.map);
                that.layers.push(topojson);
            });

            return;
        },
};

//App.Map.init();
window.App = App;

})();

$(document).ready(function() {
    App.Map.init();
});
