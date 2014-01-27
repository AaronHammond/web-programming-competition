Itinerary = require("../models/Itinerary");


exports.viewMap = function(req, res) {
	if(!req.user){
		return res.redirect('/user/login');
	}

	res.render('map');
}

exports.saveItinerary = function(req, res){
	if(!req.user){
		return res.redirect('/user/login');
	}

	console.log(req.body);
	var itinerary = new Itinerary({owner : req.user._id, landmarks : req.body.landmarks, origin : req.body.origin, itinerary : req.body.itinerary});
	console.log(itinerary);
	itinerary.save(function(err){
		if(err){
			console.log(err);
			return res.send(err);
		}
		else{
			return res.send(itinerary);
		}
	});
}

exports.getSavedItineraries = function(req, res){

	if(!req.user){
		return res.redirect('/user/login');
	}
	else{
		Itinerary.find({owner : req.user._id}, function(err, results){
			if(err){
				return res.send(err);
			}
			else{
				return res.send(results);
			}
		})
	}
}
exports.getSavedItinerary = function(req, res){
	if(!req.user){
		return res.redirect('/user/login');
	}
	console.log(req.query.id);
	Itinerary.findOne({_id : req.query.id}, function(err, doc){
		if(err){
			return res.send(err);
		}
		else{
			return res.send(doc);
		}
	})
}