var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var reponseSchema = new Schema({
  idRemplacant: {
    type: Schema.Types.ObjectId,
    ref: 'remplacant'
  },
  idAnnonce: {
    type: Schema.Types.ObjectId,
    ref: 'annonce'
  },
  site: String,
  dates: [{
    annee: Number,
    jour: Number,
    mois: String,
    time: Number
  }],
  message: String,
  positive: Boolean,
  negative: Boolean
}, {versionKey: false});

var Reponse = module.exports = mongoose.model('reponse', reponseSchema);
