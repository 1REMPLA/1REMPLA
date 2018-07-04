var passport = require('passport');

var connecte = function(req, res, next) {
  var retour;

  if(req.isAuthenticated()) {
    if(req.originalUrl.includes("/admin")) {
      if(req.user.identifiant == "admin") {
        return next();
      }

      else {
        var error = new Error('Accès refusé');
        error.status = 401;

        throw error;
      }
    }

    else {
      return next();
    }
  }

  if(req.path == '/dashboard' && !req.isAuthenticated()) {
    var messages = req.flash('error');
    
    res.render('partials/admin/connexion', {title: 'Admin - Connexion', admin: true, connecte: res.locals.connecte, messages: messages, hasErrors: messages.length > 0});
  }

  else {
    retour = {notLoggedIn: true};
    res.json(retour);
  }
}

module.exports = connecte;
