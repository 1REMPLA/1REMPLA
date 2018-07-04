var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var adminSchema = new Schema({
  identifiant: String,
  motDePasse: String
}, {versionKey: false});

adminSchema.methods.verifPassword = function(motDePasse) {
  return bcrypt.compareSync(motDePasse, this.motDePasse);
}

var Admin = module.exports = mongoose.model('admin', adminSchema);
