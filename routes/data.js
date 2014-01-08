var yelp = require('yelp').createClient({
	consumer_key: '433m34eZbqADW0sW9DqBuQ', 
  	consumer_secret: 'sG_Xp_MqAT_Vd80Q3GcNSRBLKa4',
  	token: 'BsD2ahtYtSfz9HKeS1sSSfJkZ-uNbllY',
  	token_secret: 'Peh9EWc8c6c_2TQMsOMJ7AbU4us'
});


exports.getRestaurants = function (req, res) {
	yelp.search({/*term: "food", */ radius_filter: 3000, category_filter: "food,bars,parks", sort: 1, ll: req.param('lat') + ',' + req.param('long')}, function(error, data) {
	  console.log(error);
	  console.log(data);
	  res.send(data);
	});
}