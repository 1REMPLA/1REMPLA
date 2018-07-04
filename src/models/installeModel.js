var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var installeSchema = new Schema({
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
  collaborateur: Boolean,
  successeur: Boolean,
  biographie: String,
  specialite: {
    type: Schema.Types.ObjectId,
    ref: 'specialite'
  },
  sites:[{
    type: Schema.Types.ObjectId,
    ref: 'site'
  }],
  annonces:[{
    type: Schema.Types.ObjectId,
    ref: 'annonce'
  }],
  active: Boolean,
  tokenValidation: String,
  expirationValidation: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {versionKey: false});

installeSchema.methods.encryptPassword = function(motDePasse) {
  return bcrypt.hashSync(motDePasse, bcrypt.genSaltSync(5), null);
}

installeSchema.methods.verifPassword = function(motDePasse) {
  return bcrypt.compareSync(motDePasse, this.motDePasse);
}

var installe = module.exports = mongoose.model('installe', installeSchema);
