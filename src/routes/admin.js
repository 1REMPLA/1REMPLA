var express = require('express');
var router = express.Router();
var Admin = require('../models/adminModel');
var Installe = require('../models/installeModel');
var Remplacant = require('../models/remplacantModel');
var Site = require('../models/siteModel');
var ZonesGeo = require('../models/zoneGeoModel')
var TypeSite = require('../models/typeSiteModel');
var Annonce = require('../models/annonceModel');
var Reponse = require('../models/reponseModel');
var Specialite = require('../models/specialiteModel');
var passport = require('passport');
var loggedIn = require('../config/connecteRole');
var notLoggedIn = require('../config/nonConnecteRole');
var statutConnexion = require('../config/statutConnexion');

/* Page ADMIN */
router.get('/', notLoggedIn, statutConnexion, function(req, res) {
  var messages = req.flash('error');

  res.render('partials/admin/connexion', {title: 'Admin - Connexion', admin: true, connecte: res.locals.connecte, messages: messages, hasErrors: messages.length > 0});
});

router.post('/', passport.authenticate('local.admin', {
  successRedirect: '/admin/dashboard',
  failureRedirect: '/admin',
  failureFlash: true
}));

router.get('/dashboard', loggedIn, statutConnexion, function(req, res) {
  res.render('partials/admin/dashboard', {title: 'Administration du site', connecte: res.locals.connecte, admin: true});
});

router.get('/dashboard/membres', loggedIn, statutConnexion, function(req, res) {
  Installe.find({}, function(err1, installes) {
    Remplacant.find({}, function(err2, remplacants) {
      res.render('partials/admin/membres', {title: 'Membres du site', connecte: res.locals.connecte, admin: true, installes: installes, remplacants: remplacants});
    });
  });
});

router.get('/dashboard/membres/id/:id', loggedIn, statutConnexion, function(req, res) {
  Installe.findOne({_id: req.params.id}, function(err1, installe) {
    Remplacant.findOne({_id: req.params.id}, function(err2, remplacant) {
      if(err1 || err2) {
        var err = new Error('Page non trouvée');
        err.status = 404;
        res.status(err.status || 500);

        res.render('partials/error', {title: 'Page non trouvée', error: err});
      }

      if(installe) {
        Specialite.findOne({_id: installe.specialite}, function(err3, specialite) {
          Site.findOne({_id: installe.sites[0]}, function(err4, site1) {
            TypeSite.findOne({_id: site1.typeSite}, function(err5, typeSite1) {
              if(installe.sites.length == 2) {
                Site.findOne({_id: installe.sites[1]}, function(err6, site2) {
                  TypeSite.findOne({_id: site2.typeSite}, function(err7, typeSite2) {
                    res.render('partials/admin/details/membresDetails', {title: 'Membre', connecte: res.locals.connecte, admin: true, membre: installe, specialite: specialite, typeSite1: typeSite1, typeSite2: typeSite2, site1: site1, site2: site2});
                  });
                });
              }

              else if(installe.sites.length == 3) {
                Site.findOne({_id: installe.sites[1]}, function(err6, site2) {
                  TypeSite.findOne({_id: site2.typeSite}, function(err7, typeSite2) {
                    Site.findOne({_id: installe.sites[2]}, function(err8, site3) {
                      TypeSite.findOne({_id: site3.typeSite}, function(err9, typeSite3) {
                        res.render('partials/admin/details/membresDetails', {title: 'Membre', connecte: res.locals.connecte, admin: true, membre: installe, specialite: specialite, typeSite1: typeSite1, typeSite2: typeSite2, typeSite3: typeSite3, site1: site1, site2: site2, site3: site3});
                      });
                    });
                  });
                });
              }

              else {
                res.render('partials/admin/details/membresDetails', {title: 'Membre', connecte: res.locals.connecte, admin: true, membre: installe, specialite: specialite, typeSite1: typeSite1, site1: site1});
              }
            });
          });
        });
      }

      else if(remplacant) {
        Specialite.findOne({_id: remplacant.specialite}, function(err3, specialite) {
          res.render('partials/admin/details/membresDetails', {title: 'Membres du site', connecte: res.locals.connecte, admin: true, membre: remplacant, specialite: specialite});
        });
      }

      else {
        var err = new Error('Page non trouvée');
        err.status = 404;
        res.status(err.status || 500);

        res.render('partials/error', {title: 'Page non trouvée', error: err});
      }
    });
  });
});

router.get('/dashboard/sites', loggedIn, statutConnexion, function(req, res) {
  Site.find({}, function(err, sites) {
    res.render('partials/admin/sites', {title: 'Lieux d\'exercice du site', connecte: res.locals.connecte, admin: true, sites: sites});
  });
});

router.get('/dashboard/sites/id/:id', loggedIn, statutConnexion, function(req, res) {
  Site.findOne({_id: req.params.id}, function(err1, site) {
    if(err1) {
      var err = new Error('Page non trouvée');
      err.status = 404;
      res.status(err.status || 500);

      res.render('partials/error', {title: 'Page non trouvée', error: err});
    }

    if(site) {
      TypeSite.findOne({_id: site.typeSite}, function(err2, typeSite) {
        res.render('partials/admin/details/sitesDetails', {title: 'Lieu d\'exercice', connecte: res.locals.connecte, admin: true, site: site, typeSite: typeSite});
      });
    }

    else {
      var err = new Error('Page non trouvée');
      err.status = 404;
      res.status(err.status || 500);

      res.render('partials/error', {title: 'Page non trouvée', error: err});
    }
  });
});

router.get('/dashboard/annonces', loggedIn, statutConnexion, function(req, res) {
  var retour = [];
  var i = 0;

  Annonce.find({}, function(err1, annonces) {
    annonces.forEach(function(annonce) {
      Installe.findOne({_id: annonce.idInstalle}, function(err2, installe) {
        Remplacant.findOne({_id: annonce.idRemplacant}, function(err3, remplacant) {
          if(installe) {
            Site.findOne({_id: annonce.idSite}, function(err4, site) {
              retour.push({annonce: annonce, membre: installe, site: site});

              if(i == annonces.length-1) {
                res.render('partials/admin/annonces', {title: 'Annonces du site', connecte: res.locals.connecte, admin: true, annonces: retour});
              }

              else {
                i++;
              }
            });
          }

          else if(remplacant) {
            retour.push({annonce: annonce, membre: remplacant});

            if(i == annonces.length-1) {
              res.render('partials/admin/annonces', {title: 'Annonces du site', connecte: res.locals.connecte, admin: true, annonces: retour});
            }

            else {
              i++;
            }
          }
        });
      });
    });
  });
});

router.get('/dashboard/annonces/id/:id', loggedIn, statutConnexion, function(req, res) {
  Annonce.findOne({_id: req.params.id}, function(err1, annonce) {
    if(err1) {
      var err = new Error('Page non trouvée');
      err.status = 404;
      res.status(err.status || 500);

      res.render('partials/error', {title: 'Page non trouvée'});
    }

    if(annonce) {
      Installe.findOne({_id: annonce.idInstalle}, function(err2, installe) {
        Remplacant.findOne({_id: annonce.idRemplacant}, function(err3, remplacant) {
          if(installe) {
            Site.findOne({_id: annonce.idSite}, function(err4, site) {
              res.render('partials/admin/details/annoncesDetails', {title: 'Annonce', connecte: res.locals.connecte, admin: true, annonce: annonce, membre: installe, site: site});
            });
          }

          else if(remplacant) {
            res.render('partials/admin/details/annoncesDetails', {title: 'Annonce', connecte: res.locals.connecte, admin: true, annonce: annonce, membre: remplacant});
          }
        });
      });
    }

    else {
      var err = new Error('Not Found');
      err.status = 404;
      res.status(err.status || 500);

      res.render('partials/error', {title: 'Page non trouvée'});
    }
  });
});

router.get('/dashboard/reponses', loggedIn, statutConnexion, function(req, res) {
  var retour = [];
  var i = 0;

  Reponse.find({}, function(err1, reponses) {
    reponses.forEach(function(reponse) {
      Remplacant.findOne({_id: reponse.idRemplacant}, function(err2, remplacant) {
        Annonce.findOne({_id: reponse.idAnnonce}, function(err3, annonce) {
          Site.findOne({_id: annonce.idSite}, function(err4, site) {
            retour.push({reponse: reponse, membre: remplacant, site: site});

            if(i == reponses.length-1) {
              res.render('partials/admin/reponses', {title: 'Réponses aux annonces', connecte: res.locals.connecte, admin: true, reponses: retour});
            }

            else {
              i++;
            }
          });
        });
      });
    });
  });
});

router.get('/dashboard/reponses/id/:id', loggedIn, statutConnexion, function(req, res) {
  Reponse.findOne({_id: req.params.id}, function(err1, reponse) {
    if(err1) {
      var err = new Error('Page non trouvée');
      err.status = 404;
      res.status(err.status || 500);

      res.render('partials/error', {title: 'Page non trouvée', error: err});
    }

    if(reponse) {
      Remplacant.findOne({_id: reponse.idRemplacant}, function(err2, remplacant) {
        Annonce.findOne({_id: reponse.idAnnonce}, function(err3, annonce) {
          Site.findOne({_id: annonce.idSite}, function(err4, site) {
            res.render('partials/admin/details/reponsesDetails', {title: 'Réponse', connecte: res.locals.connecte, admin: true, reponse: reponse, remplacant: remplacant, site: site});
          });
        });
      });
    }

    else {
      var err = new Error('Page non trouvée');
      err.status = 404;
      res.status(err.status || 500);

      res.render('partials/error', {title: 'Page non trouvée', error: err});
    }
  });
});

router.get('/deconnexion', function(req, res) {
  req.logout();
  res.redirect('/');
})

module.exports = router;
