
// landmark : {mapData : googleMapResponseObject, yelpData : yelpBusinessObject}

// this object holds applicable landmark data for each of the different categories
var landmarks = { 
	restaurants : [], 
	bars : [],
	parks : [] };
var targetCounts = {restaurants : 0, bars : 0, parks : 0};
// holds a list of landmarks that constitutes an itinerary
var itinerary = [];

// holds a gmap LatLng object representing the user's starting location
var origin;


// the map object
var map;

var directionsService = new google.maps.DirectionsService();

var directionsDisplay;

function initialize() {
	navigator.geolocation.getCurrentPosition(function (position) {
		origin = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		var mapOptions = {
			center: origin,
			zoom: 17
		};
		directionsDisplay = new google.maps.DirectionsRenderer();
		map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
		directionsDisplay.setMap(map);

		$('#directions_panel').text('loading...');
		retrieveLandmarkData("bars", function(){
			retrieveLandmarkData("parks", function(){
				retrieveLandmarkData("restaurants", errythingLoaded);
			});
		});
	});		
}


google.maps.event.addDomListener(window, 'load', initialize);

function errythingLoaded(){
	console.log(landmarks);
	$('#directions_panel').text('done!');
	for(cat in landmarks){
		for(landmark in landmarks[cat]){
			addMapPin(landmarks[cat][landmark]);
		}
	}

	generateItinerary();
	getDirections();
}



/*
 * asynchronously sets the landmark objects for a given category
 * example: retrieveLandmarkData("bars");
 */
function retrieveLandmarkData(category, callback) {
	$.ajax({
		url: "/data/" + category + "?lat=" + origin.b + "&long=" + origin.d,
		cache: false
	}).done(function(yelpData){
		targetCounts[category] = yelpData.businesses.length;
		for(var i in yelpData.businesses){
			var biz = yelpData.businesses[i];
			biz.metacategory = category;
			retrieveLandmarkMapDatum(category, biz, callback);
		}
	});
}

/*
 * asynchonrously grabs a gmap datum for a given yelp datum and sets appropriately.
 */
function retrieveLandmarkMapDatum(category, yelpDatum, callback) {
	var display_address = createAddressFromYelpLocation(yelpDatum.location);

	$.ajax({
		url: "http://maps.googleapis.com/maps/api/geocode/json?address=" + display_address + "&sensor=true",
		cache: false
	}).done(function(gmapData){
		if(gmapData.results.length > 0){
			landmarks[category].push({mapData : gmapData.results[0], yelpData : yelpDatum});
			
			if(checkCounts()){
				callback();
			}
		}
		else{
			setTimeout(function(){retrieveLandmarkMapDatum(category, yelpDatum, callback);}, 1000);
		}
	});
}

function createAddressFromYelpLocation(loc){
	return loc.address[0] + ", " + loc.city + ", " + loc.state_code;
}

/*
 * sorta hacky function that checks whether all data has been loaded.
 */
function checkCounts(){
	for(cat in landmarks){
		if(landmarks[cat].length != targetCounts[cat]){
			return false;
		}
	}
	return true;
}

/*
 * given a landmark, add a pin to the map with appropriate information.
 */
function addMapPin(landmark) {
	var point = landmark.mapData.geometry.location;
	var markerPos = new google.maps.LatLng(point.lat, point.lng);
	marker = new google.maps.Marker({
		map:map,
		animation: google.maps.Animation.DROP,
		position: markerPos,
		title: landmark.yelpData.name,
		icon: getMarkerImage(landmark.yelpData) 
	});
}

/*
 * given yelp data, return a string with the appropriate marker icon
 */
function getMarkerImage(datum){
	// determine the appropriate marker
	/*var categories = flattenNestedArrays(datum.categories);
	if(categories.indexOf("bars") != -1){
		return "/images/map-icons/bar.png"
	}
	else if(categories.indexOf("parks") != -1){
		return "/images/map-icons/park.png"
	}
	else {
		return "/images/map-icons/food.png"
	}*/

	if(datum.metacategory == "bars"){
		return "/images/map-icons/bar.png"
	}
	else if(datum.metacategory == "parks"){
		return "/images/map-icons/park.png"
	}
	else{
		return "/images/map-icons/food.png"
	}
}

/*
 * populates the itinerary object with an array of landmarks that constitute an itinerary.
 */
function generateItinerary() {
	itinerary = [landmarks.restaurants[0], landmarks.parks[0], landmarks.bars[0]];
}

/*
 * given an index for an itinerary part, replace the stateful itinerary part with another option
 * from the same category
 */ 
function replaceItineraryPart(index){

}


/*
 * given an itinerary, populate the directions
 */

function getDirections(){
	var waypts = [];
	for(landmark in itinerary){
		var point = itinerary[landmark].mapData.geometry.location
		var loc = new google.maps.LatLng(point.lat, point.lng);
		waypts.push({location: loc, stopover: true});
		console.log(itinerary[landmark].yelpData);
	}

	var request = {
		origin: origin,
		destination: waypts[waypts.length - 1].location,
		waypoints: waypts.slice(0, waypts.length - 1),
		travelMode: google.maps.TravelMode.WALKING
	};

	directionsService.route(request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(response);
			var route = response.routes[0];
			var summaryPanel = document.getElementById("directions_panel");
			summaryPanel.innerHTML = "";
			// For each route, display summary information.
			for (var i = 0; i < route.legs.length; i++) {
				var routeSegment = i+1;
				summaryPanel.innerHTML += "<b>Route Segment: " + routeSegment + "</b><br />";
				summaryPanel.innerHTML += route.legs[i].start_address + " to ";
				summaryPanel.innerHTML += route.legs[i].end_address + "<br />";
				summaryPanel.innerHTML += route.legs[i].distance.text + "<br /><br />";
			}
		}
	});
}



/*
 * little util
 */ 
function flattenNestedArrays(array){
	var newArray = [];
	for(subarray in array){
		newArray = newArray.concat(array[subarray]);
	}
	return newArray;
}
