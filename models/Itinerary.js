var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ItinerarySchema = new Schema({
	origin: Schema.Types.Mixed,
	landmarks: {restaurants : [Schema.Types.Mixed], 
				bars : [Schema.Types.Mixed],
				parks : [Schema.Types.Mixed] }, 
    itinerary: [Schema.Types.Mixed],
    owner: Schema.Types.ObjectId,
    updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Itinerary', ItinerarySchema);