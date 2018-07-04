var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var siteSchema = new Schema({
  nomSite: String,
  adresseSite: String,
  villeSite: String,
  codePostalSite: String,
  coordonneesSite: [
    String
  ],
  telSite: String,
  horaires: String,
  typeSite: String,
  descSite: String,
  photos: [{
    type: String
  }]
}, {versionKey: false});

var Site = module.exports = mongoose.model('site', siteSchema);
