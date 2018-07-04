var passport = require('passport');
var verifRequete = require('./verifRequete');

var nonConnecte = function(req, res, next) {
  var retour;

  if(!req.isAuthenticated()) {
    return next();
  }

  if(req.user.identifiant === "admin" && req.isAuthenticated() && req.originalUrl.includes("/admin")) {
    res.render('partials/admin/dashboard', {title: 'Administration du site', connecte: res.locals.connecte, admin: true});
  }

  else {
    if(req.user.identifiant === "admin") {
      res.render('partials/admin/dashboard', {title: 'Administration du site', connecte: res.locals.connecte, admin: true});
    }

    else {
      verifRequete;

      retour = {loggedIn: true};
      res.json(retour);
    }
  }
};

module.exports = nonConnecte;
