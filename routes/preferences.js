var venues = require('../util/venue.js');
var Preferences = require('../models/Preferences');

exports.getPreferences = function(req, res){
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
	Preferences.findOne({owner : req.user._id}, function(err, doc){
		if(err){
			return res.send(err);
		}


		var merge = mergeArrays(doc.preferences, req.body);
		console.log(merge);
		doc.preferences = merge;
		console.log(doc);
		doc.save(function(err){
			if(err){
				return res.send(err);
			}
			else{
				return res.send(merge);
			}
		});

	});
}

function mergeArrays(original, overwrite){ 
	for(var i = 0; i < original.length; i++){
		if(!hasTaggedEntry(overwrite, original[i].subcategory)){
			overwrite.push(original[i]);
		}
	}
	return overwrite;
}
function hasTaggedEntry(array, tag){
	for(var j = 0; j < array.length; j++){
		if(array[j].subcategory == tag){
			return true;
		}
	}
	return false;
}


exports.getVenues = function(req, res){
	return res.send({metacategories: venues.venueTypes, subcategories : venues.subcategories});
}