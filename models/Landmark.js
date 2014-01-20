var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LandmarkSchema = new Schema({
    venueType : { type: String, enum: ["restaurant", "park", "bar"]},
    latitude : Number,
    longitude : Number
});

module.exports = mongoose.model('Landmark', LandmarkSchema);