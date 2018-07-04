var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var typeSiteSchema = new Schema({
  typeSite: String
}, {versionKey: false});

var TypeSite = module.exports = mongoose.model('typeSite', typeSiteSchema);
