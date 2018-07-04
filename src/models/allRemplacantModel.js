var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var allRemplacantSchema = new Schema({
    genre: String,
    nom: String,
    prenom: String,
    adresseMembre: String,
    villeMembre: String,
    codePostalMembre: String,
    telMembre: String,
    photoMembre: String,
    biographie: String,
    specialite: {
        type: Schema.Types.ObjectId,
        ref: 'specialite'
    },
    active: Boolean,
    raison: String,
    recommandation: String,
    amelioration: String
}, {versionKey: false});

var AllRemplacant = module.exports = mongoose.model('allRemplacant', allRemplacantSchema);