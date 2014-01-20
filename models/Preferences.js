var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PreferencesSchema = new Schema({
    preferences: [Object],
    owner: Schema.Types.ObjectId
});

module.exports = mongoose.model('Preferences', PreferencesSchema);