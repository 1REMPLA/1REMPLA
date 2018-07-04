var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var specialiteSchema = new Schema({
  typeSpecialite: String
}, {versionKey: false});

var Specialite = module.exports = mongoose.model('specialite', specialiteSchema);
