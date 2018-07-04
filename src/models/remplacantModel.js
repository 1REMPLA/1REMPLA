var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var remplacantSchema = new Schema({
  //_numeroAdeli: String,
  genre: String,
  nom: String,
  prenom: String,
  adresseMail: String,
  motDePasse: String,
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
  annonces: [{
    type: Schema.Types.ObjectId,
    ref: 'annonce'
  }],
  reponses:[{
    type: Schema.Types.ObjectId,
    ref: 'reponse'
  }],
  zonesGeo: {
    type: Schema.Types.ObjectId,
    ref: 'zoneGeo'
  },
  active: Boolean,
  tokenValidation: String,
  expirationValidation: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {versionKey: false});

remplacantSchema.methods.encryptPassword = function(motDePasse) {
  return bcrypt.hashSync(motDePasse, bcrypt.genSaltSync(5), null);
}

remplacantSchema.methods.verifPassword = function(motDePasse) {
  return bcrypt.compareSync(motDePasse, this.motDePasse);
}

var Remplacant = module.exports = mongoose.model('remplacant', remplacantSchema);
