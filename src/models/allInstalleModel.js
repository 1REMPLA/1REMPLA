var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var allInstalleSchema = new Schema({
    genre: String,
    nom: String,
    prenom: String,
    adresseMembre: String,
    villeMembre: String,
    codePostalMembre: String,
    telMembre: String,
    photoMembre: String,
    collaborateur: Boolean,
    successeur: Boolean,
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

var AllInstalle = module.exports = mongoose.model('allInstalle', allInstalleSchema);