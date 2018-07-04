var express = require('express');
var router = express.Router();
var passport = require('passport');
var Annonce = require('../models/annonceModel');
var Evenement = require('../models/evenementModel');
var TypeSite = require('../models/typeSiteModel');
var Specialite = require('../models/specialiteModel');
var verifRequete = require('../config/verifRequete');
var statutConnexion = require('../config/statutConnexion');
var Installe = require('../models/installeModel');
var Remplacant = require('../models/remplacantModel');
var Admin = require('../models/adminModel');
var Site = require('../models/siteModel');
var ZoneGeo = require('../models/zoneGeoModel');
var Reponse = require('../models/reponseModel');
var AllReponse = require('../models/allReponseModel');
var envoiMail = require('../config/envoiMail');

/* Page Annonce */

//Recherche
router.get('/recherche', verifRequete, statutConnexion, function(req, res) {
  var retour;

  if(req.isAuthenticated()) {
    Admin.findOne({_id: req.user._id}, function(err1, admin) {
      Installe.findOne({adresseMail: req.user.adresseMail}, function(err2, installe) {
        Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err3, remplacant) {
          if(admin) {
            retour = {title: 'Recherche d\'Annonces', statutConnexion: res.locals.connecte, admin: true, installe: false};
            res.json(retour);
          }

          if(installe) {
            retour = {title: 'Recherche d\'Annonces', statutConnexion: res.locals.connecte, admin: false, installe: true, membre: {sites: installe.sites}};
            res.json(retour);
          }

          if(remplacant) {
            retour = {title: 'Recherche d\'Annonces', statutConnexion: res.locals.connecte, admin: false, installe: false};
            res.json(retour);
          }
        });
      });
    });
  }

  else {
    retour = {title : 'Recherche d\'Annonces', statutConnexion: res.locals.connecte};
    res.json(retour);
  }
});

//Annonce
router.get('/:id', verifRequete, statutConnexion, function(req, res) {
  var retour;

  Annonce.findOne({_id : req.params.id}, function(err1, annonce) {
    if(err1) {
      retour = {title : 'Recherche d\'Annonces', statutConnexion: true, notFound: true};
      res.json(retour);
    }

    else if(annonce) {
      if(annonce.idRemplacant) {
        ZoneGeo.findOne({_id: annonce.idZonesGeo}, function(err2, zoneGeo) {
          Evenement.findOne({idRemplacant: annonce.idRemplacant}, function(err3, events) {
            Remplacant.findOne({_id: annonce.idRemplacant}, function(err4, remplacantAnnonce) {
              Specialite.findOne({_id: remplacantAnnonce.specialite}, function(err5, specialite) {
                if(req.isAuthenticated()) {
                  Admin.findOne({_id: req.user._id}, function(err6, admin) {
                    Installe.findOne({_id: req.user._id}, function(err7, installeCurr) {
                      Remplacant.findOne({_id: req.user._id}, function(err8, remplacantCurr) {
                        if(admin && annonce) {
                            var membreRetour = {
                                _id: remplacantAnnonce._id,
                                nom: remplacantAnnonce.nom,
                                prenom: remplacantAnnonce.prenom,
                                photoMembre: remplacantAnnonce.photoMembre
                            };

                            retour = {title: 'Recherche de Remplaçants', statutConnexion: res.locals.connecte, admin: true, installe: false, annonce: annonce, annonceInstalle: false, specialite: specialite, membre: membreRetour, notFound: false};
                            res.json(retour);
                        }

                        if(installeCurr && annonce) {
                            var membreRetour = {
                                _id: remplacantAnnonce._id,
                                nom: remplacantAnnonce.nom,
                                prenom: remplacantAnnonce.prenom,
                                adresseMail: remplacantAnnonce.adresseMail,
                                telMembre: remplacantAnnonce.telMembre,
                                photoMembre: remplacantAnnonce.photoMembre
                            };

                            retour = {title: 'Recherche de Remplaçants', statutConnexion: res.locals.connecte, admin: false, installe: true, annonce: annonce, annonceInstalle: false, zonesGeo: zoneGeo, specialite: specialite, events: events.evenements, membre: membreRetour, sites: installeCurr.sites, notFound: false};
                            res.json(retour);
                        }

                        if(remplacantCurr && annonce) {
                            var membreRetour = {
                                _id: remplacantAnnonce._id,
                                nom: remplacantAnnonce.nom,
                                prenom: remplacantAnnonce.prenom,
                                adresseMail: remplacantAnnonce.adresseMail,
                                telMembre: remplacantAnnonce.telMembre,
                                photoMembre: remplacantAnnonce.photoMembre
                            };

                            retour = {title: 'Recherche de Remplaçants', statutConnexion: res.locals.connecte, admin: false, installe: false, annonce: annonce, annonceInstalle: false, zonesGeo: zoneGeo, specialite: specialite, events: events.evenements, membre: membreRetour, notFound: false};
                            res.json(retour);
                        }
                      });
                    });
                  });
                }

                else {
                    var membreRetour = {
                        _id: remplacantAnnonce._id,
                        nom: remplacantAnnonce.nom,
                        prenom: remplacantAnnonce.prenom,
                        photoMembre: remplacantAnnonce.photoMembre
                    };

                    retour = {title : 'Recherche de Remplaçants', statutConnexion: res.locals.connecte, annonce: annonce, annonceInstalle: false, specialite: specialite, membre: membreRetour, notFound: false};
                    res.json(retour);
                }
              });
            });
          });
        });
      }

      else if(annonce.idInstalle) {
        Site.findOne({_id: annonce.idSite}, function(err2, site) {
          TypeSite.findOne({_id: site.typeSite}, function(err3, typeSite) {
            Evenement.findOne({idSite: annonce.idSite}, function(err4, events) {
              Installe.findOne({sites: site._id}, function(err5, installeAnnonce) {
                Specialite.findOne({_id: installeAnnonce.specialite}, function(err6, specialite) {
                  if(req.isAuthenticated()) {
                    Admin.findOne({_id: req.user._id}, function(err7, admin) {
                      Installe.findOne({_id: req.user._id}, function(err8, installeCurr) {
                        Remplacant.findOne({_id: req.user._id}, function(err9, remplacantCurr) {
                          if(admin && annonce) {
                            var membreRetour = {
                                _id: installeAnnonce._id,
                                nom: installeAnnonce.nom,
                                prenom: installeAnnonce.prenom,
                                photoMembre: installeAnnonce.photoMembre
                            };

                            var siteRetour = {
                                _id: site._id,
                                nomSite: site.nomSite,
                                horaires: site.horaires,
                                photos: site.photos
                            };

                            retour = {title: 'Recherche d\'Annonces', statutConnexion: res.locals.connecte, admin: true, installe: false, annonce: annonce, annonceInstalle: true, site: siteRetour, typeSite: typeSite, specialite: specialite, membre: membreRetour, notFound: false};
                            res.json(retour);
                          }

                          if(installeCurr && annonce) {
                            var membreRetour = {
                                _id: installeAnnonce._id,
                                nom: installeAnnonce.nom,
                                prenom: installeAnnonce.prenom,
                                adresseMail: installeAnnonce.adresseMail,
                                telMembre: installeAnnonce.telMembre,
                                photoMembre: installeAnnonce.photoMembre
                            };

                            var siteRetour = {
                                _id: site._id,
                                nomSite: site.nomSite,
                                adresseSite: site.adresseSite,
                                villeSite: site.villeSite,
                                codePostalSite: site.codePostalSite,
                                telSite: site.telSite,
                                horaires: site.horaires,
                                coordonneesSite: site.coordonneesSite,
                                photos: site.photos
                            };

                            retour = {title: 'Recherche d\'Annonces', statutConnexion: res.locals.connecte, admin: false, installe: true, annonce: annonce, annonceInstalle: true, site: siteRetour, typeSite: typeSite, specialite: specialite, events: events.evenements, membre: membreRetour, sites: installeCurr.sites, notFound: false};
                            res.json(retour);
                          }

                          if(remplacantCurr && annonce) {
                            var membreRetour = {
                              _id: installeAnnonce._id,
                              nom: installeAnnonce.nom,
                              prenom: installeAnnonce.prenom,
                              adresseMail: installeAnnonce.adresseMail,
                              telMembre: installeAnnonce.telMembre,
                              photoMembre: installeAnnonce.photoMembre
                            };

                            var siteRetour = {
                                _id: site._id,
                                nomSite: site.nomSite,
                                adresseSite: site.adresseSite,
                                villeSite: site.villeSite,
                                codePostalSite: site.codePostalSite,
                                telSite: site.telSite,
                                horaires: site.horaires,
                                coordonneesSite: site.coordonneesSite,
                                photos: site.photos
                            };

                            retour = {title: 'Recherche d\'Annonces', statutConnexion: res.locals.connecte, admin: false, installe: false, annonce: annonce, annonceInstalle: true, site: siteRetour, typeSite: typeSite, specialite: specialite, events: events.evenements, membre: membreRetour, notFound: false};
                            res.json(retour);
                          }
                        });
                      });
                    });
                  }

                  else {
                    var membreRetour = {
                        _id: installeAnnonce._id,
                        nom: installeAnnonce.nom,
                        prenom: installeAnnonce.prenom,
                        photoMembre: installeAnnonce.photoMembre
                    };

                    var siteRetour = {
                        _id: site._id,
                        nomSite: site.nomSite,
                        horaires: site.horaires,
                        photos: site.photos
                    };

                    retour = {title : 'Recherche d\'Annonces', statutConnexion: res.locals.connecte, annonce: annonce, annonceInstalle: true, site: siteRetour, typeSite: typeSite, specialite: specialite, membre: membreRetour, notFound: false};
                    res.json(retour);
                  }
                });
              });
            });
          });
        });
      }
    }

    else {
        if(req.isAuthenticated()) {
            Admin.findOne({_id: req.user._id}, function(err2, admin) {
                Installe.findOne({_id: req.user._id}, function (err3, installe) {
                    Remplacant.findOne({_id: req.user._id}, function (err4, remplacant) {
                        if(admin) {
                            retour = {title : 'Recherche d\'Annonces', statutConnexion: res.locals.connecte, admin: true, installe: false, notFound: true};
                            res.json(retour);
                        }

                        else if(installe) {
                            retour = {title : 'Recherche d\'Annonces', statutConnexion: res.locals.connecte, admin: false, installe: true, sites: installe.sites, notFound: true};
                            res.json(retour);
                        }

                        else if(remplacant) {
                            retour = {title : 'Recherche d\'Annonces', statutConnexion: res.locals.connecte, admin: false, installe: false, notFound: true};
                            res.json(retour);
                        }
                    });
                });
            });
        }

        else {
            retour = {title : 'Recherche d\'Annonces', statutConnexion: res.locals.connecte, notFound: true};
            res.json(retour);
        }
    }
  });
});

router.post('/:id', verifRequete, function(req, res) {
  var retour;

  var annonce = req.body.annonce;
  var message = req.body.message;
  var dates = req.body.dates;

  var messages = [];

  req.checkBody({
      'message' : {
        matches: {
            options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù.,;?!:@_()/'"\n ]{0,750}$/,
            errorMessage: "Le message contient des caractères non supportés (entre 0 et 750 caractères)"
        }
      }
  });

  var errors = req.validationErrors();

  if(errors) {
    errors.forEach(function(error) {
        messages.push(error.msg);
    });

    retour = {succes: false, errors: messages};
    res.json(retour);
  }

  else {
    if(req.isAuthenticated()) {
        Installe.findOne({_id: req.user._id}, function(err1, installe) {
            Remplacant.findOne({_id: req.user._id}, function(err2, remplacant) {
                if(err1 || err2) {
                    var err = err1 + err2;

                    messages.push(err);

                    retour = {succes: false, errors: messages};
                    res.json(retour);
                }

                if(installe) {
                    Remplacant.findOne({_id: annonce.idRemplacant}, function(err3, remplacantAnnonce) {
                        envoiMail.envoiMailPriseDeContact(message, dates[0], dates[1], remplacantAnnonce, installe);
                        envoiMail.envoiMailConfirmationPriseDeContact(message, dates[0], dates[1], installe, remplacantAnnonce);
                    });

                    retour = {succes: true, succesMsg: "Un mail a bien été transmis au remplaçant. Un mail de confirmation de prise de contact vous a également été envoyé."};
                    res.json(retour);
                }

                else if(remplacant) {
                    Site.findOne({_id: annonce.idSite}, function(err3, site) {
                        var newReponse = new Reponse({
                            idRemplacant: remplacant._id,
                            idAnnonce: annonce._id,
                            site: site.nomSite,
                            message: message,
                            dates : dates,
                            positive: false,
                            negative: false
                        });

                        newReponse.save(function(resultat) {
                            var newAllReponse = new AllReponse({
                                _id: newReponse._id,
                                idRemplacant: remplacant._id,
                                idAnnonce: annonce._id,
                                site: site.nomSite,
                                message: message,
                                dates : dates,
                                positive: false,
                                negative: false
                            });

                            newAllReponse.save(function(resultat2) {
                                remplacant.update({$push: {reponses: newReponse._id}}).exec();

                                Installe.findOne({_id: annonce.idInstalle}, function(err4, installeAnnonce) {
                                    envoiMail.envoiMailReponseAnnonceInstalle(installeAnnonce);
                                    envoiMail.envoiMailReponseAnnonceRemplacant(remplacant, installeAnnonce);
                                });

                                retour = {succes: true, succesMsg: "Votre réponse a été transmise et envoyée par mail à l'installé. Vous serez prévenus dès que celui-ci prendra sa décision."};
                                res.json(retour);
                            });
                        });
                    });
                }

                else {
                    messages.push("Vous n'avez pas le droit de postuler à cette annonce.");

                    retour = {succes: false, errors: messages};
                    res.json(retour);
                }
            });
        });
    }

    else {
        messages.push("Vous n'avez pas le droit de postuler à cette annonce. Vous n'êtes pas connecté.");

        retour = {succes: false, errors: messages};
        res.json(retour);
    }
  }
});

module.exports = router;
