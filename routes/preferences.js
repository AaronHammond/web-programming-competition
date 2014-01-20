var venues = require('../util/venue.js');
var Preferences = require('../models/Preferences');

exports.getPreferences = function(req, res){
	console.log(req.user._id);
	Preferences.findOne({owner : req.user._id}).lean().exec(function(err, doc){
		if(err){
			return res.send(err);
		}
		else{
			return res.send(doc.preferences);
		}
	});
}

exports.setPreferences = function(req, res){

}

exports.getVenues = function(req, res){
	return res.send({metacategories: venues.venueTypes, subcategories : venues.subcategories});
}