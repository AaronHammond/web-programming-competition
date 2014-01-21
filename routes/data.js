Preferences = require("../models/Preferences");


var yelp = require('yelp').createClient({
	consumer_key: '433m34eZbqADW0sW9DqBuQ', 
  	consumer_secret: 'sG_Xp_MqAT_Vd80Q3GcNSRBLKa4',
  	token: 'BsD2ahtYtSfz9HKeS1sSSfJkZ-uNbllY',
  	token_secret: 'Peh9EWc8c6c_2TQMsOMJ7AbU4us'
});


exports.getRestaurants = function (req, res) {
	yelp.search({radius_filter: 1500, category_filter: "restaurants", sort: "0", ll: req.param('lat') + ',' + req.param('long')}, function(error, data) {
		cullAndPassThru(data, req, res);
	});
}

exports.getParks = function (req, res) {
	yelp.search({radius_filter: 1500, category_filter: "parks,landmarks,galleries,museums", sort: "0", ll: req.param('lat') + ',' + req.param('long')}, function(error, data) {
		cullAndPassThru(data, req, res);
	});
}

exports.getBars = function (req, res) {
	yelp.search({radius_filter: 1500, category_filter: "bars", sort: "0", ll: req.param('lat') + ',' + req.param('long')}, function(error, data) {
		cullAndPassThru(data, req, res);
	});
}

function cullAndPassThru(data, req, res){
	if(!req.user){
		return res.redirect('/user/login');
	}

	Preferences.findOne({owner: req.user._id}, function(err, doc){
		var mesh = doc.preferences
		var revisedDataset = [];
		for(var i = 0; i < data.businesses.length; i++){
			var biz = data.businesses[i];
			if(shouldPushOut(mesh, biz.categories)){
				revisedDataset.push(biz);
			}
		}
		res.send({businesses : revisedDataset});
	});
}

function shouldPushOut(mesh, categories){
	for(var j = 0; j < categories.length; j++){
		var pair = categories[j];
		for(var k = 0; k < mesh.length; k++){
			if(pair[1] == mesh[k].subcategory){
				console.log(mesh[k]);
				return (mesh[k].preference != "no");
			}
		}
	}
	return true;
}