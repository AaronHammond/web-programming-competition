
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
			zoom: 17,
			noClear: true
		};
		directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
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

	$('#loading-pane').fadeOut('slow', function () {
		$('#main-content').animate({opacity: "1.0"}, 1000);
	});
	
}



/*
 * asynchronously sets the landmark objects for a given category
 * example: retrieveLandmarkData("bars");
 */
function retrieveLandmarkData(category, callback) {
	$.ajax({
		url: "/data/" + category + "?lat=" + origin.d + "&long=" + origin.e,
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

	var marker = new google.maps.Marker({
		map:map,
		animation: google.maps.Animation.DROP,
		position: markerPos,
		title: landmark.yelpData.name,
		icon: getMarkerImage(landmark.yelpData) 
	});

	landmark.marker = marker;
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

	for(var i in itinerary){
		var landmark = itinerary[i];

		var infowindow = new google.maps.InfoWindow({
			content : getFlavorText(landmark)
		})

		infowindow.open(map, landmark.marker);
	}
}

function getFlavorText(landmark) {
	var cat = landmark.yelpData.metacategory;
	var flavorText;
	if(cat == "restaurants"){
		flavorText = "Enjoy a nice meal at ";
	}
	if(cat == "parks"){
		flavorText = "Take a stroll through ";
	}
	if(cat == "bars"){
		flavorText = "Order a brew (or two!) at ";
	}

	flavorText = flavorText.concat(landmark.yelpData.name);
	return flavorText;
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

			$('#directions_panel').html('');

			var innerHTML = "<b>1.</b> Leave your goddamn house. <br />";

			var locCtr = 1;

			// For each route, display summary information.
			for (var i = 0; i < route.legs.length; i++) {
				locCtr++;

				for(var j = 0; j < (route.legs[i].steps.length); j++){
					innerHTML += extractLastGoogleMapStep(route.legs[i].steps[j]);
					//innerHTML += (route.legs[i].steps[j].instructions + " for " + route.legs[i].steps[j].duration.text + " (" + route.legs[i].steps[j].distance.text + ")");
					//innerHTML += "<br />";
				}
				



				innerHTML += (locCtr + ". " + getFlavorText(itinerary[i]));
				innerHTML += "<br />";
				if(i+1 != route.legs.length){
					innerHTML += "Onto the next stop! <br />";
				}
			}
			innerHTML += "Congratulations! Your life was less meaningless today.";
			$('#directions_panel').html(innerHTML);
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

function extractLastGoogleMapStep(step){
	var ind = step.instructions.indexOf('<div style="font-size:0.9em">');
	if(ind != -1){
		
		var stepHtml = "";
		stepHtml += step.instructions.substring(0, ind);
		stepHtml += (" for " + step.duration.text + " (" + step.distance.text + ")");
		stepHtml += "<br />";
		stepHtml += step.instructions.substring(ind);
		stepHtml += "<br />";

		return stepHtml;
	}
	else{
		return (step.instructions + " for " + step.duration.text + " (" + step.distance.text + ") <br />");
	}
}
