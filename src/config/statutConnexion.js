var passport = require('passport');

var statutConnexion = function(req, res, next) {
  if(req.isAuthenticated()) {
    res.locals.connecte = true;
  }

  else {
    res.locals.connecte = false;
  }

  return next();
}

module.exports = statutConnexion;
