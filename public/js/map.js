
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

var originMarker; 
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

		originMarker = new google.maps.Marker({
			map:map,
			animation: google.maps.Animation.DROP,
			position: origin,
			title: "Your itinerary will start here.", 
		});

		$('#startBtn').click(function(){
			$('#initialPane').text('loading...');
			retrieveLandmarkData("bars", function(){
					retrieveLandmarkData("parks", function(){
						retrieveLandmarkData("restaurants", errythingLoaded);
					});
			});	
		});

		$('#somewhereElseBtn').click(function(){
			originMarker.setMap(null);
			$('#startBtn').fadeOut('slow');
			$('#somewhereElseBtn').fadeOut('slow', function(){
				$('#somewhereElsePane').fadeIn('slow');
			});
			$('#startHereBtn').click(startSomewhereElse);
			
		})
		
		
	});		
}

function startSomewhereElse(){
	var newAddress = $('#somewhereElseAddress').val();

	$.ajax({
		url: "http://maps.googleapis.com/maps/api/geocode/json?address=" + newAddress + "&sensor=true",
		cache: false
	}).done(function(gmapData){


		if(gmapData.results.length > 0){
			var landmark = gmapData.results[0];
			var point = landmark.geometry.location;
			origin = new google.maps.LatLng(point.lat, point.lng);
			originMarker = new google.maps.Marker({
				map:map,
				animation: google.maps.Animation.DROP,
				position: origin,
				title: "Your itinerary will start here." 
			});
			map.setCenter(origin);
			$('#somewhereElsePane').fadeOut('slow', function(){
				$('#startBtn').fadeIn('slow');
				$('#somewhereElseBtn').fadeIn('slow');
			});
		}
		else{
			$('#somewhereElseLabel').text("Sorry, we couldn't find that address. Try again!");
		}
		
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

	$('#initialPane').fadeOut('slow', function () {
		$('#itinerary').css('display', 'inline-block');
		$('#itinerary').fadeIn('slow');
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
	populateItinerary();

	for(var i in itinerary){
		var landmark = itinerary[i];

		var infowindow = new google.maps.InfoWindow({
			content : getMarkerHTML(landmark)
		})

		infowindow.open(map, landmark.marker);
	}
}

function populateItinerary(){
	itinerary = [];
	itinerary.push(landmarks.restaurants[Math.floor((Math.random()*landmarks.restaurants.length))]);
	itinerary.push(landmarks.parks[Math.floor((Math.random()*landmarks.parks.length))]);
	itinerary.push(landmarks.bars[Math.floor((Math.random()*landmarks.bars.length))]);
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

function getMarkerHTML(landmark){
	var markup = "";
	markup += '<img src="' + landmark.yelpData.image_url + '" style="width: 50px" />';
	markup += '<h5 style="margin-bottom: 0px;"><a target="_blank" href="' + landmark.yelpData.url + '">' + landmark.yelpData.name+'</a></h5>';
	markup += createAddressFromYelpLocation(landmark.yelpData.location);
	markup += '<br />';
	markup += '<img src="' + landmark.yelpData.rating_img_url_small + '" />';

	return markup;
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
			renderDirections(route);
		}
	});
}


function renderDirections(route){
	
	$('#directions_panel').html('');

	var markup = '<div class="panel-group" id="directionsAccordionn">';

	for(var i = 0; i < route.legs.length; i++){
		markup += '<div class="panel panel-default">';
		markup += '		<div class="panel-heading">';
		markup += '			 <h4 class="panel-title">';
		markup += '				<a data-toggle="collapse" data-parent="#directionsAccordion" href="#collapse' + i + '">';
		markup += '					' + (i+1) + ". " + getFlavorText(itinerary[i]);
		markup += '				</a>';
		markup += ' 			<span class="btn btn-danger" style="float: right; font-size: 12px; vertical-align: middle; margin-top: -7px;"> No! </span>';
		markup += '			 </h4>';
		markup += '		</div>';
		markup += '		<div id="collapse' + i + '" class="panel-collapse collapse">';
		markup += '			<div class="panel-body">';
		markup += renderLeg(route.legs[i]);
		markup += '			</div>';
		markup += '		</div>';
		markup += '</div>';
	}

	markup += "</div>";

	$('#directions_panel').html(markup);
	
}

function renderLeg(leg){
	var innerHTML = "";
	for(var j = 0; j < (leg.steps.length); j++){
			innerHTML += extractLastGoogleMapStep(leg.steps[j]);
	}
	return innerHTML;
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
		//stepHtml += step.instructions.substring(ind);
		//stepHtml += "<br />";

		return stepHtml;
	}
	else{
		return (step.instructions + " for " + step.duration.text + " (" + step.distance.text + ") <br />");
	}
}
