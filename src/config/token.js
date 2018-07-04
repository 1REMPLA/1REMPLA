var crypto = require('crypto');

var generationToken = {};

// Fonction initialisation
generationToken.initialisation = function() {
  var token = crypto.randomBytes(20);
  return token.toString('hex');
}

// Fonction misEnPlaceTokens
generationToken.miseEnPlaceTokens = function(token, user) {
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  user.save();
}

// Fonction retireToken
generationToken.retireToken = function(user) {
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.save();
}

module.exports = generationToken;
