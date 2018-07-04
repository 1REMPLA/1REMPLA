var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var annonceSchema = new Schema({
  idInstalle: {
    type: Schema.Types.ObjectId,
    ref: 'installe'
  },
  idRemplacant: {
    type: Schema.Types.ObjectId,
    ref: 'remplacant'
  },
  idSite: {
    type: Schema.Types.ObjectId,
    ref: 'site'
  },
  idZonesGeo: {
    type: Schema.Types.ObjectId,
    ref: 'zoneGeo'
  },
  periodes: [{
    dateDebut: Date,
    dateFin: Date
  }]
}, {versionKey: false});

var Annonce = module.exports = mongoose.model('annonce', annonceSchema);
