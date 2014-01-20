var venues = require('../util/venue.js');

exports.getPreferences = function(){

}

exports.setPreferences = function(){

}

exports.getVenues = function(req, res){
	res.send({metacategories: venues.venueTypes, subcategories : venues.subcategories});
}