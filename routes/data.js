var yelp = require('yelp').createClient({
	consumer_key: '433m34eZbqADW0sW9DqBuQ', 
  	consumer_secret: 'sG_Xp_MqAT_Vd80Q3GcNSRBLKa4',
  	token: 'BsD2ahtYtSfz9HKeS1sSSfJkZ-uNbllY',
  	token_secret: 'Peh9EWc8c6c_2TQMsOMJ7AbU4us'
});


exports.getRestaurants = function (req, res) {
	yelp.search({radius_filter: 1500, category_filter: "food", sort: "0", ll: req.param('lat') + ',' + req.param('long')}, function(error, data) {
	  res.send(data);
	});
}

exports.getParks = function (req, res) {
	yelp.search({radius_filter: 1500, category_filter: "parks", sort: "0", ll: req.param('lat') + ',' + req.param('long')}, function(error, data) {
	  res.send(data);
	});
}

exports.getBars = function (req, res) {
	yelp.search({radius_filter: 1500, category_filter: "bars", sort: "0", ll: req.param('lat') + ',' + req.param('long')}, function(error, data) {
	  res.send(data);
	});
}