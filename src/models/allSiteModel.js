var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var allSiteSchema = new Schema({
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
    descSite: String
}, {versionKey: false});

var AllSite = module.exports = mongoose.model('allSite', allSiteSchema);