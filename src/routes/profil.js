var express = require('express');
var router = express.Router();
var passport = require('passport');
var verifRequete = require('../config/verifRequete');
var statutConnexion = require('../config/statutConnexion');
var loggedIn = require('../config/connecteRole');
var Installe = require('../models/installeModel');
var AllInstalle = require('../models/allInstalleModel');
var Remplacant = require('../models/remplacantModel');
var AllRemplacant = require('../models/allRemplacantModel');
var Admin = require('../models/adminModel');
var Reponse = require('../models/reponseModel');
var AllReponse = require('../models/allReponseModel');
var Specialite = require('../models/specialiteModel');
var ZoneGeo = require('../models/zoneGeoModel');
var AllZoneGeo = require('../models/allZoneGeoModel');
var Site = require('../models/siteModel');
var AllSite = require('../models/allSiteModel');
var TypeSite = require('../models/typeSiteModel');
var Annonce = require('../models/annonceModel');
var AllAnnonce = require('../models/allAnnonceModel');
var Evenement = require('../models/evenementModel');
var AllEvenement = require('../models/allEvenementModel');
var envoiMail = require('../config/envoiMail');
var fs = require('fs');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

//Fonction qui enlève les dates des autres réponses qui contenait les dates acceptées
var refusApresValidation = function(reponse) {
  Reponse.findOne({_id: reponse.id}, function(err1, reponseAModifier) {
    var tabIndex = [];
    var newDates = [];
    var estInclus2 = false;

    for(var r = 0 ; r < reponseAModifier.dates.length ; r++) {
      for(var s = 0 ; s < reponse.dates.length ; s++) {
        if(reponseAModifier.dates[r].time === reponse.dates[s].time) {
          estInclus2 = true;
          break;
        }
      }

      if(!estInclus2) {
        tabIndex.push(r);
      }

      else {
        estInclus2 = false;
      }
    }

    for(var t = 0 ; t < tabIndex.length ; t++) {
      newDates.push(reponseAModifier.dates[tabIndex[t]]);
    }

    AllReponse.findOne({_id: reponseAModifier._id}, function(err2, allReponseAModifier) {
        reponseAModifier.update({$set: {dates: newDates}}).exec();
        allReponseAModifier.update({$set: {dates: newDates}}).exec();

        var newReponseRefusee = new Reponse({
          idRemplacant: reponseAModifier.idRemplacant,
          idAnnonce: reponseAModifier.idAnnonce,
          site: reponseAModifier.site,
          dates: reponse.dates,
          message: reponseAModifier.message,
          positive: false,
          negative: true
        });

        newReponseRefusee.save(function(err3, resultat) {
            var newAllReponseRefusee = new AllReponse({
                _id: newReponseRefusee._id,
                idRemplacant: reponseAModifier.idRemplacant,
                idAnnonce: reponseAModifier.idAnnonce,
                site: reponseAModifier.site,
                dates: reponse.dates,
                message: reponseAModifier.message,
                positive: false,
                negative: true
            });

            newAllReponseRefusee.save(function(err4, resultat2) {
                Remplacant.findOne({_id: reponseAModifier.idRemplacant}, function(err3, remplacant) {
                    remplacant.update({$push: {reponses: newReponseRefusee._id}}).exec();
                });
            });
        });
    });
  });
};

/* Page profil public GET */
router.get('/public', verifRequete, statutConnexion, loggedIn, function(req, res) {
  var retour;

  Admin.findOne({_id: req.user._id}, function(err, admin) {
    Installe.findOne({adresseMail: req.user.adresseMail}, function(err1, installe) {
      Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err2, remplacant) {
        Specialite.findOne({_id: req.user.specialite}, function(err3, specialite) {
          if(installe) {
            if(installe.sites.length == 1) {
              Site.findOne({_id: installe.sites[0]}, function(err4, site) {
                TypeSite.findOne({_id: site.typeSite}, function(err5, typeSite) {
                  var tabSites = [];
                  var tabTypeSites = [];
                  var membreRetour = {
                      nom: installe.nom,
                      prenom: installe.prenom,
                      adresseMail: installe.adresseMail,
                      adresseMembre: installe.adresseMembre,
                      villeMembre: installe.villeMembre,
                      codePostalMembre: installe.codePostalMembre,
                      telMembre: installe.telMembre,
                      photoMembre: installe.photoMembre,
                      successeur: installe.successeur,
                      collaborateur: installe.collaborateur,
                      biographie: installe.biographie
                  };

                  tabSites.push({
                      _id: site._id,
                      nomSite: site.nomSite,
                      adresseSite: site.adresseSite,
                      villeSite: site.villeSite,
                      codePostalSite: site.codePostalSite,
                      telSite: site.telSite,
                      horaires: site.horaires
                  });

                  tabTypeSites.push(typeSite);

                  retour = {title: 'Profil - Public', statutConnexion: res.locals.connecte, admin: false, installe: true, membre: membreRetour, specialite: specialite, sites: tabSites, typeSites: tabTypeSites};
                  res.json(retour);
                });
              });
            }

            else if(installe.sites.length == 2) {
              Site.findOne({_id: installe.sites[0]}, function(err4, site1) {
                TypeSite.findOne({_id: site1.typeSite}, function(err5, typeSite1) {
                  Site.findOne({_id: installe.sites[1]}, function(err6, site2) {
                    TypeSite.findOne({_id: site2.typeSite}, function(err7, typeSite2) {
                      var tabSites = [];
                      var tabTypeSites = [];

                      var membreRetour = {
                          nom: installe.nom,
                          prenom: installe.prenom,
                          adresseMail: installe.adresseMail,
                          adresseMembre: installe.adresseMembre,
                          villeMembre: installe.villeMembre,
                          codePostalMembre: installe.codePostalMembre,
                          telMembre: installe.telMembre,
                          photoMembre: installe.photoMembre,
                          successeur: installe.successeur,
                          collaborateur: installe.collaborateur,
                          biographie: installe.biographie
                      };

                      tabSites.push({
                          _id: site1._id,
                          nomSite: site1.nomSite,
                          adresseSite: site1.adresseSite,
                          villeSite: site1.villeSite,
                          codePostalSite: site1.codePostalSite,
                          telSite: site1.telSite,
                          horaires: site1.horaires
                      });

                      tabTypeSites.push(typeSite1);

                      tabSites.push({
                          _id: site2._id,
                          nomSite: site2.nomSite,
                          adresseSite: site2.adresseSite,
                          villeSite: site2.villeSite,
                          codePostalSite: site2.codePostalSite,
                          telSite: site2.telSite,
                          horaires: site2.horaires
                      });

                      tabTypeSites.push(typeSite2);

                      retour = {title: 'Profil - Public', statutConnexion: res.locals.connecte, admin: false, installe: true, membre: membreRetour, specialite: specialite, sites: tabSites, typeSites: tabTypeSites};
                      res.json(retour);
                    });
                  });
                });
              });
            }

            else if(installe.sites.length == 3) {
              Site.findOne({_id: installe.sites[0]}, function(err4, site1) {
                TypeSite.findOne({_id: site1.typeSite}, function(err5, typeSite1) {
                  Site.findOne({_id: installe.sites[1]}, function(err6, site2) {
                    TypeSite.findOne({_id: site2.typeSite}, function(err7, typeSite2) {
                      Site.findOne({_id: installe.sites[2]}, function(err8, site3) {
                        TypeSite.findOne({_id: site3.typeSite}, function(err9, typeSite3) {
                          var tabSites = [];
                          var tabTypeSites = [];

                          var membreRetour = {
                              nom: installe.nom,
                              prenom: installe.prenom,
                              adresseMail: installe.adresseMail,
                              adresseMembre: installe.adresseMembre,
                              villeMembre: installe.villeMembre,
                              codePostalMembre: installe.codePostalMembre,
                              telMembre: installe.telMembre,
                              photoMembre: installe.photoMembre,
                              successeur: installe.successeur,
                              collaborateur: installe.collaborateur,
                              biographie: installe.biographie
                          };

                          tabSites.push({
                              _id: site1._id,
                              nomSite: site1.nomSite,
                              adresseSite: site1.adresseSite,
                              villeSite: site1.villeSite,
                              codePostalSite: site1.codePostalSite,
                              telSite: site1.telSite,
                              horaires: site1.horaires
                          });

                          tabTypeSites.push(typeSite1);

                          tabSites.push({
                              _id: site2._id,
                              nomSite: site2.nomSite,
                              adresseSite: site2.adresseSite,
                              villeSite: site2.villeSite,
                              codePostalSite: site2.codePostalSite,
                              telSite: site2.telSite,
                              horaires: site2.horaires
                          });

                          tabTypeSites.push(typeSite2);

                          tabSites.push({
                              _id: site3._id,
                              nomSite: site3.nomSite,
                              adresseSite: site3.adresseSite,
                              villeSite: site3.villeSite,
                              codePostalSite: site3.codePostalSite,
                              telSite: site3.telSite,
                              horaires: site3.horaires
                          });

                          tabTypeSites.push(typeSite3);

                          retour = {title: 'Profil - Public', statutConnexion: res.locals.connecte, admin: false, installe: true, membre: membreRetour, specialite: specialite, sites: tabSites, typeSites: tabTypeSites};
                          res.json(retour);
                        });
                      });
                    });
                  });
                });
              });
            }
          }

          else if(remplacant) {
            var membreRetour = {
                _id: remplacant._id,
                nom: remplacant.nom,
                prenom: remplacant.prenom,
                adresseMail: remplacant.adresseMail,
                adresseMembre: remplacant.adresseMembre,
                villeMembre: remplacant.villeMembre,
                codePostalMembre: remplacant.codePostalMembre,
                telMembre: remplacant.telMembre,
                photoMembre: remplacant.photoMembre,
                biographie: remplacant.biographie
            };

            retour = {title: 'Profil - Public', statutConnexion: res.locals.connecte, admin: false, installe: false, specialite: specialite, membre: membreRetour};
            res.json(retour);
          }

          else if(admin) {
            retour = {title: 'Profil - Public', statutConnexion: res.locals.connecte, admin: true, installe: false};
            res.json(retour);
          }
        });
      });
    });
  });
});

/* Page profil général GET */
router.get('/general', verifRequete, statutConnexion, loggedIn, function(req, res) {
  var retour;
  var specialitesTab = [];

  Admin.findOne({_id: req.user._id}, function(err, admin) {
    Installe.findOne({adresseMail: req.user.adresseMail}, function(err1, installe) {
      Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err2, remplacant) {
        if(installe || remplacant) {
          Specialite.find(function(err3, specialites) {
            specialitesTab = specialites;

            Specialite.findOne({_id: req.user.specialite}, function(err4, specialite) {
              if(installe) {
                var retourMembre = {
                    nom: installe.nom,
                    prenom: installe.prenom,
                    adresseMail: installe.adresseMail,
                    telMembre: installe.telMembre,
                    adresseMembre: installe.adresseMembre,
                    villeMembre: installe.villeMembre,
                    codePostalMembre: installe.codePostalMembre,
                    sites: installe.sites,
                    successeur: installe.successeur,
                    collaborateur: installe.collaborateur,
                    biographie: installe.biographie
                };

                retour = {title: 'Profil - Général', statutConnexion: res.locals.connecte, admin: false, installe: true, membre: retourMembre, specialite: specialite, specialiteObj: specialitesTab};
                res.json(retour);
              }

              else if(remplacant) {
                var retourMembre = {
                    nom: remplacant.nom,
                    prenom: remplacant.prenom,
                    adresseMail: remplacant.adresseMail,
                    telMembre: remplacant.telMembre,
                    adresseMembre: remplacant.adresseMembre,
                    villeMembre: remplacant.villeMembre,
                    codePostalMembre: remplacant.codePostalMembre,
                    biographie: remplacant.biographie
                };

                retour = {title: 'Profil - Général', statutConnexion: res.locals.connecte, admin: false, installe: false, membre: retourMembre, specialite: specialite, specialiteObj: specialitesTab};
                res.json(retour);
              }
            });
          });
        }

        else if(admin) {
          retour = {title: 'Profil - Général', statutConnexion: res.locals.connecte, admin: true, installe: false};
          res.json(retour);
        }
      });
    });
  });
});

/* Page profil général POST */
router.post('/general', verifRequete, function(req, res) {
  var retour;

  var nom = req.body.nom;
  var prenom = req.body.prenom;
  var specialite = req.body.specialite;
  var adresseMail = req.body.adresseMail;
  var telMembre = req.body.telMembre;
  var biographie = req.body.biographie;
  var adresseMembre = req.body.adresseMembre;
  var villeMembre = req.body.villeMembre;
  var codePostalMembre = req.body.codePostalMembre;

  req.checkBody({
    'nom': {
      notEmpty: true,
      matches: {
        options: /^[a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
        errorMessage: 'Le nom est invalide'
      },
      errorMessage: 'Le nom est vide'
    },
    'prenom': {
      notEmpty: true,
      matches: {
        options: /^[a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
        errorMessage: 'Le prénom est invalide'
      },
      errorMessage: 'Le prénom est vide'
    },
    'adresseMail': {
      notEmpty: true,
      matches: {
        options: /^[a-z0-9_-]+(.[a-z0-9_-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/,
        errorMessage: "L'adresse mail est invalide"
      },
      errorMessage: 'L\'adresse mail est vide'
    },
    'specialite': {
      notEmpty: true,
      matches: {
        options: /[a-zA-Z -]{1,31}/,
        errorMessage: 'La spécialité est invalide'
      },
      errorMessage: 'La spécialité n\'est pas renseignée'
    },
    'telMembre': {
      notEmpty: true,
      matches: {
        options: /^0[0-9]{9}$/,
        errorMessage: 'Le numéro de téléphone est invalide'
      },
      errorMessage: 'Le numéro de téléphone est vide'
    },
    'adresseMembre': {
      matches: {
        options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{0,100}$/,
        errorMessage: 'L\'adresse est invalide'
      }
    },
    'villeMembre': {
      notEmpty: true,
      matches: {
        options: /^[a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
        errorMessage: 'La ville est invalide'
      },
      errorMessage: 'La ville est vide'
    },
    'codePostalMembre': {
      notEmpty: true,
      matches: {
        options: /^[0-9]{5}$/,
        errorMessage: 'Le code postal est invalide'
      },
      errorMessage: 'Le code postal est vide'
    },
    'biographie': {
      isLength: {
        options: [{ min: 0, max: 750 }],
        errorMessage: 'Votre biographie ne doit pas dépasser 750 caractères'
      }
    }
  });

  var errors = req.validationErrors();
  var messages = [];

  if(errors) {
    errors.forEach(function(error) {
      messages.push(error.msg);
    });

    retour = {succes: false, errors: messages};
    res.json(retour);
  }

  else {
    Installe.findOne({adresseMail: req.user.adresseMail}, function(err1, installe) {
      Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err2, remplacant) {
        if(err1 || err2) {
          messages.push(err1);
          messages.push(err2);

          retour = {succes: false, errors: messages};
          res.json(retour);
        }

        if(installe) {
          var successeur = req.body.successeur;
          var collaborateur = req.body.collaborateur;

          AllInstalle.findOne({_id: installe._id}, function(err3, allInstalle) {
              installe.update({$set:{
                  'nom': nom,
                  'prenom': prenom,
                  'adresseMail': adresseMail,
                  'specialite': specialite,
                  'telMembre': telMembre,
                  'biographie': biographie,
                  'adresseMembre': adresseMembre,
                  'villeMembre': villeMembre,
                  'codePostalMembre': codePostalMembre,
                  'successeur': successeur,
                  'collaborateur': collaborateur,
              }}).exec();

              allInstalle.update({$set:{
                  'nom': nom,
                  'prenom': prenom,
                  'specialite': specialite,
                  'telMembre': telMembre,
                  'biographie': biographie,
                  'adresseMembre': adresseMembre,
                  'villeMembre': villeMembre,
                  'codePostalMembre': codePostalMembre,
                  'successeur': successeur,
                  'collaborateur': collaborateur,
              }}).exec();

              retour = {succes: true, succesMsg: 'Informations modifiées avec succès'};
              res.json(retour);
          });
        }

        if(remplacant) {
            AllRemplacant.findOne({}, function(err4, allRemplacant) {
                remplacant.update({$set:{
                    'nom': nom,
                    'prenom': prenom,
                    'adresseMail': adresseMail,
                    'specialite': specialite,
                    'telMembre': telMembre,
                    'biographie': biographie,
                    'adresseMembre': adresseMembre,
                    'villeMembre': villeMembre,
                    'codePostalMembre': codePostalMembre
                }}).exec();

                allRemplacant.update({$set:{
                    'nom': nom,
                    'prenom': prenom,
                    'specialite': specialite,
                    'telMembre': telMembre,
                    'biographie': biographie,
                    'adresseMembre': adresseMembre,
                    'villeMembre': villeMembre,
                    'codePostalMembre': codePostalMembre
                }}).exec();

                retour = {succes: true, succesMsg: 'Informations modifiées avec succès'};
                res.json(retour);
            });
        }
      });
    });
  }
});

/* Page profil mot de passe GET */
router.get('/motDePasse', verifRequete, statutConnexion, loggedIn, function(req, res) {
  var retour;

  Admin.findOne({_id: req.user._id}, function(err, admin) {
    Installe.findOne({adresseMail: req.user.adresseMail}, function(err1, installe) {
      Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err2, remplacant) {
        if(installe) {
          retour = {title: 'Profil - Changement de mot de passe', statutConnexion: res.locals.connecte, admin: false, installe: true, membre: {sites: installe.sites}};
          res.json(retour);
        }

        else if(remplacant) {
          retour = {title: 'Profil - Changement de mot de passe', statutConnexion: res.locals.connecte, admin: false, installe: false};
          res.json(retour);
        }

        else if(admin) {
          retour = {title: 'Profil - Changement de mot de passe', statutConnexion: res.locals.connecte, admin: true, installe: false};
          res.json(retour);
        }
      });
    });
  });
});

/* Page profil mot de passe POST */
router.post('/motDePasse', verifRequete, function(req, res) {
  var retour;

  var mdpActuel = req.body.mdpActuel;
  var mdpNouveau1 = req.body.mdpNouveau1;
  var mdpNouveau2 = req.body.mdpNouveau2;

  //Vérifications
  req.checkBody({
    'mdpNouveau1': {
      isLength: {
        options: [{ min: 7, max: undefined }],
        errorMessage: 'Vous devez indiquer un nouveau mot de passe qui contient au moins 7 caractères'
      },
      matches: {
        options: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]/,
        errorMessage: 'Vous devez indiquer un nouveau mot de passe contenant au moins une minuscule, une majuscule et un chiffre'
      },
      notEmpty: true,
      errorMessage: "Votre mot de passe est vide"
    },
    'mdpNouveau2': {
      equals: {
        options: req.body.mdpNouveau1,
        errorMessage: 'Vous devez indiquer un nouveau mot de passe à confirmer identique'
      },
      notEmpty: true,
      errorMessage: "Le mot de passe à confirmer est vide"
    }
  });

  var errors = req.validationErrors();
  var messages = [];

  if(errors) {
    errors.forEach(function(error) {
      messages.push(error.msg);
    });

    retour = {succes: false, errors: messages};
    res.json(retour);
  }

  else {
    Installe.findOne({adresseMail: req.user.adresseMail}, function(err1, installe) {
      Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err2, remplacant) {
        if(err1 || err2) {
          messages.push(err1);
          messages.push(err2);

          retour = {succes: false, errors: messages};
          res.json(retour);
        }

        if(installe) {
          if(!installe.verifPassword(mdpActuel)) {
            messages.push('Mot de passe actuel incorrect');

            retour = {succes: false, errors: messages};
            res.json(retour);
          }

              else {
                  installe.update({$set: {motDePasse: installe.encryptPassword(mdpNouveau1)}}).exec();

                  retour = {succes: true, succesMsg: "Mot de passe changé avec succès"};
                  res.json(retour);
              }
        }

        if(remplacant) {
          if(!remplacant.verifPassword(mdpActuel)) {
            messages.push('Mot de passe actuel incorrect');

            retour = {succes: false, errors: messages};
            res.json(retour);
          }

              else {
                  remplacant.update({$set: {motDePasse: remplacant.encryptPassword(mdpNouveau1)}}).exec();

                  retour = {succes: true, succesMsg: "Mot de passe changé avec succès"};
                  res.json(retour);
              }
        }
      });
    });
  }
});

/* Page profil zones geo GET */
router.get('/zonesDisponibilite', verifRequete, statutConnexion, loggedIn, function(req, res) {
  var retour;

  Admin.findOne({_id: req.user._id}, function(err, admin) {
    Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err1, remplacant) {
      if(remplacant) {
        ZoneGeo.find({idRemplacant: remplacant._id}, function(err2, zonesGeo) {
          if(zonesGeo) {
            retour = {title: 'Profil - Zones de disponibilité', statutConnexion: res.locals.connecte, admin: false, installe: false, zonesGeo: zonesGeo};
            res.json(retour);
          }

          else {
            retour = {title: 'Profil - Zones de disponibilité', statutConnexion: res.locals.connecte, admin: false, installe: false};
            res.json(retour);
          }
        });
      }

      else if(admin) {
        retour = {title: 'Profil - Zones de disponibilité', statutConnexion: res.locals.connecte, admin: true, installe: false};
        res.json(retour);
      }
    });
  });
});

/* Page profil zones geo POST */
router.post('/zonesDisponibilite', verifRequete, function(req, res) {
  var messages = [];
  var cercles = req.body;

  cercles.forEach(function(cercle) {
    cercle.mouseEvent = null;
  });

  Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err1, remplacant) {
    if(err1) {
      messages.push(err1);

      retour = {succes: false, errors: messages};
      res.json(retour);
    }

    else if(remplacant) {
      ZoneGeo.findOne({idRemplacant: remplacant._id}, function(err2, zoneGeo) {
        if(err2) {
          messages.push(err2);

          retour = {succes: false, errors: messages};
          res.json(retour);
        }

        else if(zoneGeo) {
          if(cercles.length > 0) {
              AllZoneGeo.findOne({_id: zoneGeo._id}, function(err3, allZoneGeo) {
                  zoneGeo.update({$set: {cercles: cercles}}).exec();
                  allZoneGeo.update({$push : {cercles: cercles}}).exec();

                  retour = {succes: true, succesMsg: "Zones de disponibilité établies avec succès."};
                  res.json(retour);
              });
          }

          else {
            Annonce.find({idRemplacant: remplacant._id}, function(err3, annonces) {
              Evenement.find({idRemplacant: remplacant._id}, function(err4, events) {
                if(annonces) {
                  annonces.forEach(function(annonce) {
                    annonce.remove();
                  });
                }

                if(events) {
                  events.forEach(function(evenement) {
                    evenement.remove();
                  });
                }

                zoneGeo.remove();

                remplacant.zonesGeo = null;

                remplacant.save(function(err5, result) {
                    retour = {succes: true, succesMsg: "Aucune zones de disponibilité n'a été établie."};
                    res.json(retour);
                });
              });
            });
          }
        }

        else {
          if(cercles.length > 0) {
            var newZoneGeo = new ZoneGeo({
              cercles: cercles,
              idRemplacant: remplacant._id
            });

            newZoneGeo.save(function(err3, resultat) {
                var newAllZoneGeo = new AllZoneGeo({
                    _id: newZoneGeo._id,
                    cercles: cercles,
                    idRemplacant: remplacant._id
                });

                newAllZoneGeo.save(function(err4, resultat2) {
                    remplacant.update({$set: {zonesGeo: newZoneGeo._id}}).exec();

                    retour = {succes: true, succesMsg: "Zones de disponibilité établies avec succès."};
                    res.json(retour);
                });
            });
          }

          else {
            retour = {succes: true, succesMsg: "Aucune zones de disponibilité n'a été établie."};
            res.json(retour);
          }
        }
      });
    }

    else {
      retour = {succes: false, errorMsg: "Remplaçant non trouvé"};
      res.json(retour);
    }
  });
});

/* Page profil sites GET */
router.get('/sites', verifRequete, statutConnexion, loggedIn, function(req, res) {
  var retour;

  Admin.findOne({_id: req.user._id}, function(err, admin) {
    Installe.findOne({adresseMail: req.user.adresseMail}, function(err1, installe) {
      if(installe) {
        var siteTab = [];
        var typeSiteTab = [];

        if(installe.sites.length == 1) {
          Site.findOne({_id: installe.sites[0]}, function(err2, site) {
            TypeSite.findOne({_id: site.typeSite}, function(err3, typeSite) {
              siteTab.push({
                  _id: site._id,
                  nomSite: site.nomSite,
                  adresseSite: site.adresseSite,
                  villeSite: site.villeSite,
                  codePostalSite: site.codePostalSite,
                  telSite: site.telSite,
                  horaires: site.horaires,
                  photos: site.photos
              });

              typeSiteTab.push(typeSite);

              retour = {title: 'Profil - Sites', statutConnexion: res.locals.connecte, admin: false, installe: true, sites: siteTab, typeSites: typeSiteTab};
              res.json(retour);
            });
          });
        }

        else if(installe.sites.length == 2) {
          Site.findOne({_id: installe.sites[0]}, function(err2, site1) {
            Site.findOne({_id: installe.sites[1]}, function(err3, site2) {
              TypeSite.findOne({_id: site1.typeSite}, function(err3, typeSite1) {
                TypeSite.findOne({_id: site2.typeSite}, function(err3, typeSite2) {
                  siteTab.push(site1);
                  siteTab.push(site2);
                  typeSiteTab.push(typeSite1);
                  typeSiteTab.push(typeSite2);

                  retour = {title: 'Profil - Sites', statutConnexion: res.locals.connecte, admin: false, installe: true, sites: siteTab, typeSites: typeSiteTab};
                  res.json(retour);
                });
              });
            });
          });
        }

        else if(installe.sites.length == 3) {
          Site.findOne({_id: installe.sites[0]}, function(err2, site1) {
            Site.findOne({_id: installe.sites[1]}, function(err3, site2) {
              Site.findOne({_id: installe.sites[2]}, function(err4, site3) {
                TypeSite.findOne({_id: site1.typeSite}, function(err3, typeSite1) {
                  TypeSite.findOne({_id: site2.typeSite}, function(err3, typeSite2) {
                    TypeSite.findOne({_id: site3.typeSite}, function(err3, typeSite3) {
                      siteTab.push(site1);
                      siteTab.push(site2);
                      siteTab.push(site3);
                      typeSiteTab.push(typeSite1);
                      typeSiteTab.push(typeSite2);
                      typeSiteTab.push(typeSite3);

                      retour = {title: 'Profil - Sites', statutConnexion: res.locals.connecte, admin: false, installe: true, sites: siteTab, typeSites: typeSiteTab};
                      res.json(retour);
                    });
                  });
                });
              });
            });
          });
        }
      }

      else if(admin) {
        retour = {title: 'Profil - Sites', statutConnexion: res.locals.connecte, admin: true, installe: false};
        res.json(retour);
      }

      else {
        retour = {title: 'Profil - Sites', statutConnexion: res.locals.connecte, admin: false, installe: false};
        res.json(retour);
      }
    });
  });
});

/* Page profil sites POST */
router.post('/sites', verifRequete, function(req, res) {
  var retour;

  var idSite = req.body._id;
  var deleteFolderRecursive = function(path) {
    fs.readdirSync(path).forEach(function(file, index) {
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      }

      else {
        fs.unlinkSync(curPath);
      }
    });
  }

  Installe.findOne({adresseMail: req.user.adresseMail}, function(err1, installe) {
    if(err1) {
      var messages = [];

      messages.push(err1);

      retour = {succes: false, errors: messages};
      res.json(retour);
    }

    if(installe) {
      Site.findOne({_id: idSite}, function(err2, site) {
        Annonce.find({idSite: site._id}, function(err3, annonces) {
          Evenement.find({idSite: site._id}, function(err4, events) {
            if(annonces) {
              annonces.forEach(function(annonce) {
                Reponse.find({idAnnonce: annonce._id}, function(err5, reponses) {
                  if(reponses) {
                    reponses.forEach(function(reponse) {
                      reponse.remove();
                    });
                  }

                  annonce.remove();
                });
              });
            }

            if(events) {
              events.forEach(function(evenement) {
                evenement.remove();
              });
            }

            var dirSite = __dirname+"/../public/uploads/"+installe._id+"/sites/"+site._id;
            installe.update({$pull: {sites: idSite}}).exec();

            deleteFolderRecursive(dirSite);

            if(fs.existsSync(dirSite)) {
              fs.rmdirSync(dirSite);
            }

            site.remove();

            retour = {succes: true, succesMsg: 'Site supprimé avec succès'};
            res.json(retour);
          });
        });
      });
    }
  });
});

/* Page profil sites création GET */
router.get('/sites/creation', verifRequete, statutConnexion, loggedIn, function(req, res) {
  var retour;

  Admin.findOne({_id: req.user._id}, function(err, admin) {
    Installe.findOne({adresseMail: req.user.adresseMail}, function(err2, installe) {
      if(installe) {
        TypeSite.find(function(err, typeSites) {
          retour = {title: 'Profil - Sites - Création', statutConnexion: res.locals.connecte, admin: false, installe: true, membre: {sites: installe.sites}, typeSites: typeSites};
          res.json(retour);
        });
      }

      else if(admin) {
        retour = {title: 'Profil - Sites - Création', statutConnexion: res.locals.connecte, admin: true, installe: false};
        res.json(retour);
      }

      else {
        retour = {title: 'Profil - Sites - Création', statutConnexion: res.locals.connecte, admin: false, installe: false};
        res.json(retour);
      }
    });
  });
});

/* Page profil sites création POST */
router.post('/sites/creation', verifRequete, multipartyMiddleware, function(req, res) {
  var retour;

  var nomSite = req.body.site.nomSite;
  var adresseSite = req.body.site.adresseSite;
  var villeSite = req.body.site.villeSite;
  var codePostalSite = req.body.site.codePostalSite;
  var coordonneesSite = req.body.site.coordonneesSite;
  var typeSite = req.body.site.typeSite;
  var telSite = req.body.site.telSite;
  var horairesSite = req.body.site.horairesSite;
  var descSite = req.body.site.descSite;

  if(req.files.file != undefined) {
    var photo1Site = "";
    var photo2Site = "";
    var photo3Site = "";
    var photo4Site = "";
    var photo5Site = "";
    var photo6Site = "";

    for(var i = 0 ; i < req.files.file.length ; i++) {
      if(req.files.file[i].fieldName == "file[0]") {
        var photo1Site = req.files.file[i];
      }

      else if(req.files.file[i].fieldName == "file[1]") {
        var photo2Site = req.files.file[i];
      }

      else if(req.files.file[i].fieldName == "file[2]") {
        var photo3Site = req.files.file[i];
      }

      else if(req.files.file[i].fieldName == "file[3]") {
        var photo4Site = req.files.file[i];
      }

      else if(req.files.file[i].fieldName == "file[4]") {
        var photo5Site = req.files.file[i];
      }

      else if(req.files.file[i].fieldName == "file[5]") {
        var photo6Site = req.files.file[i];
      }
    }
  }

  else {
    var photo1Site = "";
    var photo2Site = "";
    var photo3Site = "";
    var photo4Site = "";
    var photo5Site = "";
    var photo6Site = "";
  }

  req.checkBody({
    'site.nomSite': {
      matches: {
        options: /^[a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,100}$/,
        errorMessage: "Le nom du lieu d'exercice est invalide"
      },
      notEmpty: true,
      errorMessage: "Le nom du lieu d'exercice est vide"
    },
    'site.adresseSite': {
      matches: {
        options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{0,100}$/,
        errorMessage: "L'adresse du lieu d'exercice est invalide"
      }
    },
    'site.villeSite': {
      matches: {
        options: /^[a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
        errorMessage: "La ville du lieu d'exercice est invalide"
      },
      notEmpty: true,
      errorMessage: "Le ville du lieu d'exercice est vide"
    },
    'site.codePostalSite': {
      matches: {
        options: /^[0-9]{5}$/,
        errorMessage: "Le code postal du lieu d'exercice est invalide"
      },
      notEmpty: true,
      errorMessage: "Le code postal du lieu d'exercice est vide"
    },
    'site.telSite': {
      matches: {
        options: /^0[0-9]{9}$/,
        errorMessage: "Le numéro de téléphone du lieu d'exercice est invalide"
      },
      notEmpty: true,
      errorMessage: "Le numéro de téléphone du lieu d'exercice est vide"
    },
    'site.horairesSite': {
      matches: {
        options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù ]{0,48}$/,
        errorMessage: "Les horaires du lieu d'exercice sont invalides"
      }
    },
    'site.typeSite': {
      matches: {
        options: /[a-zA-Z]{1,30}/,
        errorMessage: "Le type de lieu d'exercice est invalide"
      },
      notEmpty: true,
      errorMessage: "Le type de lieu d'exercice est vide"
    },
    'site.descSite': {
      isLength: {
        options: [{ min: 0, max: 750 }],
        errorMessage: "La description du lieu d'exercice ne doit pas dépasser 750 caractères"
      }
    }
  });

  var errors = req.validationErrors();
  var messages = [];

  if(errors) {
    errors.forEach(function(error) {
      messages.push(error.msg);
    });

    retour = {succes: false, errors: messages};
    res.json(retour);
  }

  else {
    Installe.findOne({adresseMail: req.user.adresseMail}, function(err, installe) {
      if(err) {
        messages.push(err);

        retour = {succes: false, errors: messages};
        res.json(retour);
      }

      if(installe) {
        if(installe.sites.length == 3) {
          messages.push('Vous n\'avez pas le droit de créer plus de trois sites');

          retour = {succes: false, errors: messages};
          res.json(retour);
        }

        else {
          var photosSite = [];

          var newSite = new Site({
            nomSite: nomSite,
            adresseSite: adresseSite,
            villeSite: villeSite,
            codePostalSite: codePostalSite,
            coordonneesSite: coordonneesSite,
            telSite: telSite,
            horaires: horairesSite,
            typeSite: typeSite,
            descSite: descSite,
            photos: photosSite
          });

          newSite.save(function(err, resultat) {
            if(err) {
              messages.push(err);

              retour = {succes: false, errors: messages};
              res.json(retour);
            }

            var newPhotosSite = [];
            var dirSite = __dirname+'/../public/uploads/'+installe._id+'/sites/'+newSite._id;
            fs.mkdirSync(dirSite);

            if(photo1Site != "") {
              var tabPathPhoto1Site = photo1Site.path.split("/");

              var pathPhoto1Site = dirSite+'/'+tabPathPhoto1Site[tabPathPhoto1Site.length-1];

              fs.readFile(photo1Site.path, function(err, data) {
                fs.writeFile(pathPhoto1Site, data, 'binary', function (err) {
                  if(fs.existsSync(photo1Site.path)) {
                    fs.unlinkSync(photo1Site.path);
                  }
                });
              });

              newPhotosSite.push('/uploads/'+installe._id+'/sites/'+newSite._id+'/'+tabPathPhoto1Site[tabPathPhoto1Site.length-1]);
            }

            else {
              newPhotosSite.push(photo1Site);
            }

            if(photo2Site != "") {
              var tabPathPhoto2Site = photo2Site.path.split("/");

              var pathPhoto2Site = dirSite+'/'+tabPathPhoto2Site[tabPathPhoto2Site.length-1];

              fs.readFile(photo2Site.path, function(err, data) {
                fs.writeFile(pathPhoto2Site, data, 'binary', function (err) {
                  if(fs.existsSync(photo2Site.path)) {
                    fs.unlinkSync(photo2Site.path);
                  }
                });
              });

              newPhotosSite.push('/uploads/'+installe._id+'/sites/'+newSite._id+'/'+tabPathPhoto2Site[tabPathPhoto2Site.length-1]);
            }

            if(photo3Site != "") {
              var tabPathPhoto3Site = photo3Site.path.split("/");

              var pathPhoto3Site = dirSite+'/'+tabPathPhoto3Site[tabPathPhoto3Site.length-1];

              fs.readFile(photo3Site.path, function(err, data) {
                fs.writeFile(pathPhoto3Site, data, 'binary', function (err) {
                  if(fs.existsSync(photo3Site.path)) {
                    fs.unlinkSync(photo3Site.path);
                  }
                });
              });

              newPhotosSite.push('/uploads/'+installe._id+'/sites/'+newSite._id+'/'+tabPathPhoto3Site[tabPathPhoto3Site.length-1]);
            }

            if(photo4Site != "") {
              var tabPathPhoto4Site = photo4Site.path.split("/");

              var pathPhoto4Site = dirSite+'/'+tabPathPhoto4Site[tabPathPhoto4Site.length-1];

              fs.readFile(photo4Site.path, function(err, data) {
                fs.writeFile(pathPhoto4Site, data, 'binary', function (err) {
                  if(fs.existsSync(photo4Site.path)) {
                    fs.unlinkSync(photo4Site.path);
                  }
                });
              });

              newPhotosSite.push('/uploads/'+installe._id+'/sites/'+newSite._id+'/'+tabPathPhoto4Site[tabPathPhoto4Site.length-1]);
            }

            if(photo5Site != "") {
              var tabPathPhoto5Site = photo5Site.path.split("/");

              var pathPhoto5Site = dirSite+'/'+tabPathPhoto5Site[tabPathPhoto5Site.length-1];

              fs.readFile(photo5Site.path, function(err, data) {
                fs.writeFile(pathPhoto5Site, data, 'binary', function (err) {
                  if(fs.existsSync(photo5Site.path)) {
                    fs.unlinkSync(photo5Site.path);
                  }
                });
              });

              newPhotosSite.push('/uploads/'+installe._id+'/sites/'+newSite._id+'/'+tabPathPhoto5Site[tabPathPhoto5Site.length-1]);
            }

            if(photo6Site != "") {
              var tabPathPhoto6Site = photo6Site.path.split("/");

              var pathPhoto6Site = dirSite+'/'+tabPathPhoto6Site[tabPathPhoto6Site.length-1];

              fs.readFile(photo6Site.path, function(err, data) {
                fs.writeFile(pathPhoto6Site, data, 'binary', function (err) {
                  if(fs.existsSync(photo6Site.path)) {
                    fs.unlinkSync(photo6Site.path);
                  }
                });
              });

              newPhotosSite.push('/uploads/'+installe._id+'/sites/'+newSite._id+'/'+tabPathPhoto6Site[tabPathPhoto6Site.length-1]);
            }

            newSite.update({$set: {photos: newPhotosSite}}).exec();
            installe.update({$push: {sites: newSite._id}}).exec();

            var newAllSite = new AllSite({
                _id: newSite._id,
                nomSite: nomSite,
                adresseSite: adresseSite,
                villeSite: villeSite,
                codePostalSite: codePostalSite,
                coordonneesSite: coordonneesSite,
                telSite: telSite,
                horaires: horairesSite,
                typeSite: typeSite,
                descSite: descSite
            });

            newAllSite.save(function(err, resultat2) {
                retour = {succes: true, succesMsg: 'Site créé avec succès'};
                res.json(retour);
            });
          });
        }
      }
    });
  }
});

/* Page profil sites détails GET */
router.get('/sites/id/:id', verifRequete, statutConnexion, loggedIn, function(req, res) {
  var retour;

  Admin.findOne({_id: req.user._id}, function(err, admin) {
    if(admin) {
      retour = {title: 'Profil - Sites', statutConnexion: res.locals.connecte, admin: true, installe: false};
      res.json(retour);
    }

    else {
      Site.findOne({_id: req.params.id}, function(err1, site) {
        if(err1 || !site) {
          err1 = new Error('Not Found');
          err.status = 404;
          res.locals.message = err.message;
          res.locals.error = err;
          res.render('error', {title: 'Erreur'});
        }

        else {
          Installe.findOne({adresseMail: req.user.adresseMail}, function(err2, installe) {
            if(installe) {
              TypeSite.findOne({_id: site.typeSite}, function(err3, typeSite) {
                if(installe) {
                  retour = {title: 'Profil - Sites - '+site.nomSite, statutConnexion: res.locals.connecte, admin: false, installe: true, membre: {sites: installe.sites}, site: site, typeSite: typeSite};
                  res.json(retour);
                }
              });
            }

            else {
              retour = {title: 'Profil - Sites - '+site.nomSite, statutConnexion: res.locals.connecte, admin: false, installe: false};
              res.json(retour);
            }
          });
        }
      });
    }
  });
});

/* Page profil sites modification GET */
router.get('/sites/id/:id/modification', verifRequete, statutConnexion, loggedIn, function(req, res) {
  var retour;

  Admin.findOne({_id: req.user._id}, function(err, admin) {
    if(admin) {
      retour = {title: 'Profil - Sites', statutConnexion: res.locals.connecte, admin: true, installe: false};
      res.json(retour);
    }

    else {
      Site.findOne({_id: req.params.id}, function(err1, site) {
        if(err1 || !site) {
          err1 = new Error('Not Found');
          err.status = 404;
          res.locals.message = err.message;
          res.locals.error = err;
          res.render('error', {title: 'Erreur'});
        }

        else {
          Installe.findOne({adresseMail: req.user.adresseMail}, function(err2, installe) {
            if(installe) {
              TypeSite.find(function(err3, typeSites) {
                TypeSite.findOne({_id: site.typeSite}, function(err4, typeSite) {
                  if(installe) {
                    retour = {title: 'Profil - Sites - '+site.nomSite+" - Modification", statutConnexion: res.locals.connecte, admin: false, installe: true, membre: {sites: installe.sites}, site: site, typeSite: typeSite, typeSiteObj: typeSites};
                    res.json(retour);
                  }
                });
              });
            }

            else {
              retour = {title: 'Profil - Sites - '+site.nomSite+" - Modification", statutConnexion: res.locals.connecte, admin: false, installe: false};
              res.json(retour);
            }
          });
        }
      });
    }
  });
});

/* Page profil sites modification POST */
router.post('/sites/id/:id/modification', verifRequete, multipartyMiddleware, function(req, res) {
  var retour;

  var idSite = req.params.id;
  var nomSite = req.body.site.nomSite;
  var adresseSite = req.body.site.adresseSite;
  var villeSite = req.body.site.villeSite;
  var codePostalSite = req.body.site.codePostalSite;
  var coordonneesSite = req.body.site.coordonneesSite;
  var typeSite = req.body.site.typeSite;
  var telSite = req.body.site.telSite;
  var horairesSite = req.body.site.horairesSite;
  var descSite = req.body.site.descSite;

  if(req.files.site != undefined) {
    if(typeof(req.body.site.photo1Site) == "string" || (req.body.site.photo1Site == undefined && req.files.site.photo1Site == undefined)) {
        var photo1Site = req.body.site.photo1Site;
    }

    else if(typeof(req.files.site.photo1Site) == "object") {
        var photo1Site = req.files.site.photo1Site;
    }

    if(typeof(req.body.site.photo2Site) == "string" || (req.body.site.photo2Site == undefined && req.files.site.photo2Site == undefined)) {
        var photo2Site = req.body.site.photo2Site;
    }

    else if(typeof(req.files.site.photo2Site) == "object") {
        var photo2Site = req.files.site.photo2Site;
    }

    if(typeof(req.body.site.photo3Site) == "string" || (req.body.site.photo3Site == undefined && req.files.site.photo3Site == undefined)) {
        var photo3Site = req.body.site.photo3Site;
    }

    else if(typeof(req.files.site.photo3Site) == "object") {
        var photo3Site = req.files.site.photo3Site;
    }

    if(typeof(req.body.site.photo4Site) == "string" || (req.body.site.photo4Site == undefined && req.files.site.photo4Site == undefined)) {
        var photo4Site = req.body.site.photo4Site;
    }

    else if(typeof(req.files.site.photo4Site) == "object") {
        var photo4Site = req.files.site.photo4Site;
    }

    if(typeof(req.body.site.photo5Site) == "string" || (req.body.site.photo5Site == undefined && req.files.site.photo5Site == undefined)) {
        var photo5Site = req.body.site.photo5Site;
    }

    else if(typeof(req.files.site.photo5Site) == "object") {
        var photo5Site = req.files.site.photo5Site;
    }

    if(typeof(req.body.site.photo6Site) == "string" || (req.body.site.photo6Site == undefined && req.files.site.photo6Site == undefined)) {
        var photo6Site = req.body.site.photo6Site;
    }

    else if(typeof(req.files.site.photo6Site) == "object") {
        var photo6Site = req.files.site.photo6Site;
    }
  }

  else {
    var photo1Site = req.body.site.photo1Site;
    var photo2Site = req.body.site.photo2Site;
    var photo3Site = req.body.site.photo3Site;
    var photo4Site = req.body.site.photo4Site;
    var photo5Site = req.body.site.photo5Site;
    var photo6Site = req.body.site.photo6Site;
  }

  req.checkBody({
    'site.nomSite': {
      matches: {
        options: /^[a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,100}$/,
        errorMessage: "Le nom du lieu d'exercice est invalide"
      },
      notEmpty: true,
      errorMessage: "Le nom du lieu d'exercice est vide"
    },
    'site.adresseSite': {
      matches: {
        options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{0,100}$/,
        errorMessage: "L'adresse du lieu d'exercice est invalide"
      }
    },
    'site.villeSite': {
      matches: {
        options: /^[a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
        errorMessage: "La ville du lieu d'exercice est invalide"
      },
      notEmpty: true,
      errorMessage: "Le ville du lieu d'exercice est vide"
    },
    'site.codePostalSite': {
      matches: {
        options: /^[0-9]{5}$/,
        errorMessage: "Le code postal du lieu d'exercice est invalide"
      },
      notEmpty: true,
      errorMessage: "Le code postal du lieu d'exercice est vide"
    },
    'site.telSite': {
      matches: {
        options: /^0[0-9]{9}$/,
        errorMessage: "Le numéro de téléphone du lieu d'exercice est invalide"
      },
      notEmpty: true,
      errorMessage: "Le numéro de téléphone du lieu d'exercice est vide"
    },
    'site.horairesSite': {
      matches: {
        options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù ]{0,48}$/,
        errorMessage: "Les horaires du lieu d'exercice sont invalides"
      }
    },
    'site.typeSite': {
      matches: {
        options: /[a-zA-Z]{1,30}/,
        errorMessage: "Le type de lieu d'exercice est invalide"
      },
      notEmpty: true,
      errorMessage: "Le type de lieu d'exercice est vide"
    },
    'site.descSite': {
      isLength: {
        options: [{ min: 0, max: 750 }],
        errorMessage: "La description du lieu d'exercice ne doit pas dépasser 750 caractères"
      }
    }
  });

  var errors = req.validationErrors();
  var messages = [];

  if(errors) {
    errors.forEach(function(error) {
      messages.push(error.msg);
    });

    retour = {succes: false, errors: messages};
    res.json(retour);
  }

  else {
    Installe.findOne({adresseMail: req.user.adresseMail}, function(err1, installe) {
      Site.findOne({_id: idSite}, function(err2, site) {
        if(err1 || err2) {
          messages.push(err1);
          messages.push(err2);

          retour = {succes: false, errors: messages};
          res.json(retour);
        }

        if(installe) {
          var photosSite = [];
          var dirSite = __dirname+'/../public/uploads/'+installe._id+'/sites/'+idSite;

          if(typeof(photo1Site) == "string") {
            if(req.body.supp1 == 'true') {
              fs.unlinkSync(__dirname+"/../public"+site.photos[0]);
            }

            photosSite.push(photo1Site);
          }

          else if(typeof(photo1Site) == "object") {
            var tabPathPhoto1Site = photo1Site.path.split("/");

            var pathPhoto1Site = dirSite+'/'+tabPathPhoto1Site[tabPathPhoto1Site.length-1];

            if(req.body.supp1 == 'true') {
              fs.unlinkSync(__dirname+"/../public"+site.photos[0]);
            }

            fs.readFile(photo1Site.path, function(err, data) {
              fs.writeFile(pathPhoto1Site, data, 'binary', function (err) {
                if(fs.existsSync(photo1Site.path)) {
                  fs.unlinkSync(photo1Site.path);
                }
              });
            });

            photosSite.push('/uploads/'+installe._id+'/sites/'+idSite+'/'+tabPathPhoto1Site[tabPathPhoto1Site.length-1]);
          }

          if(typeof(photo2Site) == "string") {
            if(req.body.supp2 == 'true') {
              fs.unlinkSync(__dirname+"/../public"+site.photos[1]);
            }

            photosSite.push(photo2Site);
          }

          else if(typeof(photo2Site) == "object") {
            var tabPathPhoto2Site = photo2Site.path.split("/");

            var pathPhoto2Site = dirSite+'/'+tabPathPhoto2Site[tabPathPhoto2Site.length-1];

            if(req.body.supp2 == 'true') {
              fs.unlinkSync(__dirname+"/../public"+site.photos[1]);
            }

            fs.readFile(photo2Site.path, function(err, data) {
              fs.writeFile(pathPhoto2Site, data, 'binary', function (err) {
                if(fs.existsSync(photo2Site.path)) {
                  fs.unlinkSync(photo2Site.path);
                }
              });
            });

            photosSite.push('/uploads/'+installe._id+'/sites/'+idSite+'/'+tabPathPhoto2Site[tabPathPhoto2Site.length-1]);
          }

          if(typeof(photo3Site) == "string") {
            if(req.body.supp3 == 'true') {
              fs.unlinkSync(__dirname+"/../public"+site.photos[2]);
            }

            photosSite.push(photo3Site);
          }

          else if(typeof(photo3Site) == "object") {
            var tabPathPhoto3Site = photo3Site.path.split("/");

            var pathPhoto3Site = dirSite+'/'+tabPathPhoto3Site[tabPathPhoto3Site.length-1];

            if(req.body.supp3 == 'true') {
              fs.unlinkSync(__dirname+"/../public"+site.photos[2]);
            }

            fs.readFile(photo3Site.path, function(err, data) {
              fs.writeFile(pathPhoto3Site, data, 'binary', function (err) {
                if(fs.existsSync(photo3Site.path)) {
                  fs.unlinkSync(photo3Site.path);
                }
              });
            });

            photosSite.push('/uploads/'+installe._id+'/sites/'+idSite+'/'+tabPathPhoto3Site[tabPathPhoto3Site.length-1]);
          }

          if(typeof(photo4Site) == "string") {
            if(req.body.supp4 == 'true') {
              fs.unlinkSync(__dirname+"/../public"+site.photos[3]);
            }

            photosSite.push(photo4Site);
          }

          else if(typeof(photo4Site) == "object") {
            var tabPathPhoto4Site = photo4Site.path.split("/");

            var pathPhoto4Site = dirSite+'/'+tabPathPhoto4Site[tabPathPhoto4Site.length-1];

            if(req.body.supp4 == 'true') {
              fs.unlinkSync(__dirname+"/../public"+site.photos[3]);
            }

            fs.readFile(photo4Site.path, function(err, data) {
              fs.writeFile(pathPhoto4Site, data, 'binary', function (err) {
                if(fs.existsSync(photo4Site.path)) {
                  fs.unlinkSync(photo4Site.path);
                }
              });
            });

            photosSite.push('/uploads/'+installe._id+'/sites/'+idSite+'/'+tabPathPhoto4Site[tabPathPhoto4Site.length-1]);
          }

          if(typeof(photo5Site) == "string") {
            if(req.body.supp5 == 'true') {
              fs.unlinkSync(__dirname+"/../public"+site.photos[4]);
            }

            photosSite.push(photo5Site);
          }

          else if(typeof(photo5Site) == "object") {
            var tabPathPhoto5Site = photo5Site.path.split("/");

            var pathPhoto5Site = dirSite+'/'+tabPathPhoto5Site[tabPathPhoto5Site.length-1];

            if(req.body.supp5 == 'true') {
              fs.unlinkSync(__dirname+"/../public"+site.photos[4]);
            }

            fs.readFile(photo5Site.path, function(err, data) {
              fs.writeFile(pathPhoto5Site, data, 'binary', function (err) {
                if(fs.existsSync(photo5Site.path)) {
                  fs.unlinkSync(photo5Site.path);
                }
              });
            });

            photosSite.push('/uploads/'+installe._id+'/sites/'+idSite+'/'+tabPathPhoto5Site[tabPathPhoto5Site.length-1]);
          }

          if(typeof(photo6Site) == "string") {
            if(req.body.supp6 == 'true') {
              fs.unlinkSync(__dirname+"/../public"+site.photos[5]);
            }

            photosSite.push(photo6Site);
          }

          else if(typeof(photo6Site) == "object") {
            var tabPathPhoto6Site = photo6Site.path.split("/");

            var pathPhoto6Site = dirSite+'/'+tabPathPhoto6Site[tabPathPhoto6Site.length-1];

            if(req.body.supp6 == 'true') {
              fs.unlinkSync(__dirname+"/../public"+site.photos[5]);
            }

            fs.readFile(photo6Site.path, function(err, data) {
              fs.writeFile(pathPhoto6Site, data, 'binary', function (err) {
                if(fs.existsSync(photo6Site.path)) {
                  fs.unlinkSync(photo6Site.path);
                }
              });
            });

            photosSite.push('/uploads/'+installe._id+'/sites/'+idSite+'/'+tabPathPhoto6Site[tabPathPhoto6Site.length-1]);
          }

          if(req.files.file != undefined) {
            for(var i = 0 ; i < req.files.file.length ; i++) {
              if(fs.existsSync(req.files.file[i].path)) {
                fs.unlinkSync(req.files.file[i].path);
              }
            }
          }

          site.update({$set: {
            "nomSite": nomSite,
            "adresseSite": adresseSite,
            "villeSite": villeSite,
            "codePostalSite": codePostalSite,
            "coordonneesSite": coordonneesSite,
            "telSite": telSite,
            "horaires": horairesSite,
            "typeSite": typeSite,
            "photos" : photosSite,
            "descSite": descSite
          }}).exec();

          AllSite.findOne({_id: site._id}, function(err3, allSite) {
              site.update({$set: {
                  "nomSite": nomSite,
                  "adresseSite": adresseSite,
                  "villeSite": villeSite,
                  "codePostalSite": codePostalSite,
                  "coordonneesSite": coordonneesSite,
                  "telSite": telSite,
                  "horaires": horairesSite,
                  "typeSite": typeSite,
                  "descSite": descSite
              }}).exec();

              retour = {succes: true, succesMsg: 'Site mis à jour avec succès'};
              res.json(retour);
          });
        }
      });
    });
  }
});

/* Page profil réponses GET */
router.get('/reponses', verifRequete, statutConnexion, loggedIn, function(req, res) {
  var retour;
  var tmpAnnonces = [];
  var tmpReponses = [];
  var tmpRemplacant = [];

  Admin.findOne({_id: req.user._id}, function(err, admin) {
    Installe.findOne({adresseMail: req.user.adresseMail}, function(err1, installe) {
      Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err2, remplacant) {
        if(admin) {
          retour = {title: 'Profil - Réponses', statutConnexion: res.locals.connecte, admin: true, installe: false};
          res.json(retour);
        }

        else if(installe) {
          Remplacant.aggregate([
            {
                $lookup:
                  {
                    from: "reponses",
                    localField: "reponses",
                    foreignField: "_id",
                    as: "reponses"
                  }
              },
              {
                $unwind:"$reponses"
              },
              {
                $lookup:
                  {
                    from: "annonces",
                    localField: "reponses.idAnnonce",
                    foreignField: "_id",
                    as: "reponses.idAnnonce"
                  }
              },
              {
                $unwind:"$reponses.idAnnonce"
              },
              {
                $lookup:
                  {
                    from: "installes",
                    localField: "reponses.idAnnonce.idInstalle",
                    foreignField: "_id",
                    as: "reponses.idAnnonce.idInstalle"
                  }
              },
              {
                $unwind:"$reponses.idAnnonce.idInstalle"
              },
              {
                $match: {
                   $and: [
                       {"reponses.idAnnonce.idInstalle._id": installe._id}
                  ]
                }
              }
          ], function(err1, remplacants) {
            if(remplacants) {
              var reponsesRetour = [];

              for(var i = 0 ; i < remplacants.length ; i++) {
                reponsesRetour.push({
                    _id: remplacants[i]._id,
                    nom: remplacants[i].nom,
                    prenom: remplacants[i].prenom,
                    reponses: {
                        _id: remplacants[i].reponses._id,
                        site: remplacants[i].reponses.site,
                        positive: remplacants[i].reponses.positive,
                        negative: remplacants[i].reponses.negative,
                        message: remplacants[i].reponses.message,
                        idRemplacant: remplacants[i].reponses.idRemplacant,
                        dates: remplacants[i].reponses.dates
                    }
                });
              }

              var retourMembre = {
                sites: installe.sites
              };

              retour = {title: 'Profil - Réponses', statutConnexion: res.locals.connecte, admin: false, installe: true, membre: retourMembre, reponses: reponsesRetour};
              res.json(retour);
            }

            else {
              var retourMembre = {
                  sites: installe.sites
              };

              retour = {title: 'Profil - Réponses', statutConnexion: res.locals.connecte, admin: false, installe: true, membre: retourMembre};
              res.json(retour);
            }
          });
        }

        else if(remplacant) {
          Remplacant.aggregate([
            {
                $lookup:
                  {
                    from: "reponses",
                    localField: "reponses",
                    foreignField: "_id",
                    as: "reponses"
                  }
              },
              {
                $unwind:"$reponses"
              },
              {
                $match: {
                   $and: [
                       {"reponses.idRemplacant": remplacant._id}
                  ]
                }
              }
          ], function(err1, remplacants) {
            if(remplacants) {
              var reponsesRetour = [];

              for(var i = 0 ; i < remplacants.length ; i++) {
                  reponsesRetour.push({
                      reponses: remplacants[i].reponses
                  });
              }

              retour = {title: 'Profil - Réponses', statutConnexion: res.locals.connecte, admin: false, installe: false, reponses: reponsesRetour};
              res.json(retour);
            }

            else {
              retour = {title: 'Profil - Réponses', statutConnexion: res.locals.connecte, admin: false, installe: false};
              res.json(retour);
            }
          });
        }
      });
    });
  });
});

/* Page profil réponses POST - Validation */
router.post('/reponses/validation', verifRequete, function(req, res) {
  var retour;

  var messages = [];
  var datesAcceptees = [];
  var datesEnAttente = [];
  var reponsesContenantDatesAcceptees = [];
  var estInclus = false;

  Reponse.findOne({_id: req.body.id}, function(err1, reponse) {
    if(err1) {
      messages.push(err1);

      retour = {succes: false, errors: messages};
      res.json(retour);
    }

    else if(reponse) {
      for(var i = 0 ; i < reponse.dates.length ; i++) {
        for(var j = 0 ; j < req.body.reponse.length ; j++) {
          if(reponse.dates[i].time === req.body.reponse[j].time) {
            estInclus = true;
          }
        }

        if(estInclus) {
          datesAcceptees.push(reponse.dates[i]);

          estInclus = false;
        }

        else {
          datesEnAttente.push(reponse.dates[i]);
        }
      }

      if(datesAcceptees.length == reponse.dates.length && datesEnAttente.length === 0) {
          AllReponse.findOne({_id: reponse._id}, function(err2, allReponse) {
              reponse.update({$set: {positive: true, negative: false}}).exec();
              allReponse.update({$set: {positive: true, negative: false}}).exec();
          });
      }

      else {
          AllReponse.findOne({_id: reponse._id}, function(err2, allReponse) {
              reponse.update({$set: {dates: datesAcceptees, positive: true, negative: false}}).exec();
              allReponse.update({$set: {dates: datesAcceptees, positive: true, negative: false}}).exec();

              var newReponse = new Reponse ({
                  idRemplacant: reponse.idRemplacant,
                  idAnnonce: reponse.idAnnonce,
                  site: reponse.site,
                  dates: datesEnAttente,
                  message: reponse.message,
                  positive: false,
                  negative: false
              });

              newReponse.save(function(err3, resultat1) {
                  var newAllReponse = new AllReponse({
                      _id: newReponse._id,
                      idRemplacant: reponse.idRemplacant,
                      idAnnonce: reponse.idAnnonce,
                      site: reponse.site,
                      dates: datesEnAttente,
                      message: reponse.message,
                      positive: false,
                      negative: false
                  });

                  newAllReponse.save(function(err4, resultat2) {
                      Remplacant.findOne({_id: reponse.idRemplacant}, function(err5, remplacant1) {
                          remplacant1.update({$push: {reponses: newReponse._id}}).exec();
                      });
                  });
              });
          });
      }

      Annonce.findOne({_id: reponse.idAnnonce}, function(err3, annonce) {
        if(err3) {
          messages.push(err3);

          retour = {succes: false, errors: messages};
          res.json(retour);
        }

        else if(annonce) {
          Evenement.findOne({idInstalle: annonce.idInstalle}, function(err4, evenement) {
            if(err4) {
              messages.push(err4);

              retour = {succes: false, errors: messages};
              res.json(retour);
            }

            else if(evenement) {
              Remplacant.findOne({_id: reponse.idRemplacant}, function(err5, remplacant2) {
                if(err5) {
                  messages.push(err5);

                  retour = {succes: false, errors: messages};
                  res.json(retour);
                }

                else if(remplacant2) {
                    AllEvenement.findOne({_id: evenement._id}, function(err6, allEvenement) {
                        for(var k = 0 ; k < datesAcceptees.length ; k++) {
                            for(var l = 0 ; l < evenement.evenements.length ; l++) {
                                var startDate = new Date(evenement.evenements[l].startsAt);
                                var endDate = new Date(evenement.evenements[l].endsAt);

                                if(datesAcceptees[k].time === startDate.getTime()) {
                                    evenement.evenements[l].occupe = true;
                                    evenement.remplacant = remplacant2.nom+" "+remplacant2.prenom;
                                    allEvenement.evenements[l].occupe = true;
                                    allEvenement.remplacant = remplacant2.nom+" "+remplacant2.prenom;

                                    evenement.save();
                                    allEvenement.save();
                                }
                            }
                        }
                    });
                }

                else {
                  retour = {succes: false, errorMsg: "Remplaçant ayant émis la réponse non trouvé"};
                  res.json(retour);
                }
              });
            }

            else {
              retour = {succes: false, errorMsg: "Evènements liés à l'annonce, liée à la réponse, non trouvés"};
              res.json(retour);
            }
          });

          Reponse.find({_id: {$ne: reponse._id}, idAnnonce: annonce._id, positive: false, negative: false}, function(err6, reponses) {
            if(err6) {
              messages.push(err6);

              retour = {succes: false, errors: messages};
              res.json(retour);
            }

            else if(reponses) {
              for(var m = 0 ; m < reponses.length ; m++) {
                for(var n = 0 ; n < reponses[m].dates.length ; n++) {
                  for(var o = 0 ; o < datesAcceptees.length ; o++) {
                    if(reponses[m].dates[n].time === datesAcceptees[o].time) {

                      if(reponsesContenantDatesAcceptees.length !== 0) {
                        for(var p = 0 ; p < reponsesContenantDatesAcceptees.length ; p++) {
                          if(reponsesContenantDatesAcceptees[p].id == reponses[m]._id) {
                            reponsesContenantDatesAcceptees[p].dates.push(reponses[m].dates[n]);
                          }

                          else {
                            if(p === reponsesContenantDatesAcceptees.length-1) {
                              reponsesContenantDatesAcceptees.push({id: reponses[m]._id, dates: [reponses[m].dates[n]]});
                              break;
                            }
                          }
                        }
                      }

                      else {
                        reponsesContenantDatesAcceptees.push({id: reponses[m]._id, dates: [reponses[m].dates[n]]});
                      }
                    }
                  }
                }
              }

              if(reponsesContenantDatesAcceptees.length !== 0) {
                for(var q = 0 ; q < reponsesContenantDatesAcceptees.length ; q++) {
                  refusApresValidation(reponsesContenantDatesAcceptees[q]);
                }
              }

              retour = {succes: true, succesMsg: "Les dates ont été acceptées. Ces mêmes dates ont été enlevées des réponses qui les contenaient."};
              res.json(retour);
            }

            else {
              retour = {succes: true, succesMsg: "Les dates ont été acceptées."};
              res.json(retour);
            }
          });
        }

        else {
          retour = {succes: false, errorMsg: "Annonce liée à la réponse non trouvée"};
          res.json(retour);
        }
      });
    }

    else {
      retour = {succes: false, errorMsg: "Réponse non trouvée"};
      res.json(retour);
    }
  });
});

/* Page profil réponses POST - Refus */
router.post('/reponses/refus', verifRequete, function(req, res) {
  var retour;

  var idReponse = req.body.reponses._id;
  var idRemplacant = req.body._id;

  Reponse.findOne({_id: idReponse}, function(err1, reponse) {
    if(reponse) {
        AllReponse.findOne({_id: reponse._id}, function(err2, allReponse) {
            Remplacant.findOne({_id: idRemplacant}, function(err3, remplacant) {
                Installe.findOne({_id: req.user._id}, function(err4, installe) {
                    reponse.update({$set: {negative: true}}).exec();
                    reponse.update({$set: {positive: false}}).exec();
                    allReponse.update({$set: {negative: true}}).exec();
                    allReponse.update({$set: {positive: false}}).exec();

                    envoiMail.envoiMailReponseReponseNegative(remplacant, installe);

                    retour = {succes: true, succesMsg: "Réponse refusée"};
                    res.json(retour);
                });
            });
        });
    }

    else {
      retour = {succes: false, errorMsg: "Réponse non trouvée"};
      res.json(retour);
    }
  });
});

/* Page profil réponses POST - Suppresion */
router.post('/reponses/suppression', verifRequete, function(req, res) {
  var retour;

  var idReponse = req.body.reponses._id;
  var idRemplacant = req.body._id;

  Reponse.findOne({_id: idReponse}, function(err1, reponse) {
    if(reponse) {
      reponse.remove();

      Remplacant.findOne({_id: idRemplacant}, function(err2, remplacant) {
        remplacant.update({$pull : {reponses: reponse._id}}).exec();

        retour = {succes: true, succesMsg: "Réponse supprimée"};
        res.json(retour);
      });
    }

    else {
      retour = {succes: false, errorMsg: "Réponse non trouvée"};
      res.json(retour);
    }
  });
});

/* Page profil photo GET */
router.get('/photo', verifRequete, statutConnexion, loggedIn, function(req, res) {
  var retour, photo;

  Admin.findOne({_id: req.user._id}, function(err, admin) {
    Installe.findOne({adresseMail: req.user.adresseMail}, function(err1, installe) {
      Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err2, remplacant) {
        if(installe) {
            var retourMembre = {
                _id: installe._id,
                photoMembre: installe.photoMembre,
                sites: installe.sites
            };

            retour = {title: 'Profil - Photo', statutConnexion: res.locals.connecte, admin: false, installe: true, membre: retourMembre};
            res.json(retour);
        }

        else if(remplacant) {
            var retourMembre = {
                _id: remplacant._id,
                photoMembre: remplacant.photoMembre
            };

            retour = {title: 'Profil - Photo', statutConnexion: res.locals.connecte, admin: false, installe: false, membre: retourMembre};
            res.json(retour);
        }

        else if(admin) {
          retour = {title: 'Profil - Photo', statutConnexion: res.locals.connecte, admin: true, installe: false};
          res.json(retour);
        }
      });
    });
  });
});

/* Page profil photo POST */
router.post('/photo', verifRequete, multipartyMiddleware, function(req, res) {
  var retour;

  if(req.files.file != undefined) {
    var newPhoto = req.files.file[0];
  }

  else {
    var newPhoto = '';
  }

  Installe.findOne({adresseMail: req.user.adresseMail}, function(err1, installe) {
    Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err2, remplacant) {
      if(err1 || err2) {
        var messages = [];

        messages.push(err1);
        messages.push(err2);

        retour = {succes: false, errors: messages};
        res.json(retour);
      }

      if(installe) {
        if(installe.photoMembre != '') {
          if(fs.existsSync(__dirname+'/../public'+installe.photoMembre)) {
            fs.unlinkSync(__dirname+'/../public'+installe.photoMembre);
          }
        }

        if(req.files.file != undefined) {
          var tabPathPhoto = newPhoto.path.split("/");

          var pathPhoto = __dirname+'/../public/uploads/'+installe._id+'/'+tabPathPhoto[tabPathPhoto.length-1];

          fs.readFile(newPhoto.path, function(err, data) {
            fs.writeFile(pathPhoto, data, 'binary', function (err) {
              if(fs.existsSync(newPhoto.path)) {
                fs.unlinkSync(newPhoto.path);
              }
            });
          });

          installe.update({$set: {photoMembre: '/uploads/'+installe._id+'/'+tabPathPhoto[tabPathPhoto.length-1]}}).exec();
        }

        else {
          installe.update({$set: {photoMembre: ''}}).exec();
        }

        retour = {succes: true, succesMsg: "Photo mise à jour avec succès"};
        res.json(retour);
      }

      if(remplacant) {
        if(remplacant.photoMembre != '') {
          fs.unlinkSync(__dirname+'/../public'+remplacant.photoMembre);
        }

        if(req.files.file != undefined) {
          var tabPathPhoto = newPhoto.path.split("/");

          var pathPhoto = __dirname+'/../public/uploads/'+installe._id+'/'+tabPathPhoto[tabPathPhoto.length-1];

          fs.readFile(newPhoto.path, function(err, data) {
            fs.writeFile(pathPhoto, data, 'binary', function (err) {
              if(fs.existsSync(newPhoto.path)) {
                fs.unlinkSync(newPhoto.path);
              }
            });
          });

          remplacant.update({$set: {photoMembre: '/uploads/'+remplacant._id+'/'+tabPathPhoto[tabPathPhoto.length-1]}}).exec();
        }

        else {
          remplacant.update({$set: {photoMembre: ''}}).exec();
        }

        retour = {succes: true, succesMsg: "Photo mise à jour avec succès"};
        res.json(retour);
      }
    });
  });
});

/* Page profil suppression du compte GET */
router.get('/suppression', verifRequete, statutConnexion, loggedIn, function(req, res) {
  var retour;

  Admin.findOne({_id: req.user._id}, function(err, admin) {
    Installe.findOne({adresseMail: req.user.adresseMail}, function(err1, installe) {
      Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err2, remplacant) {
        if(installe) {
          retour = {title: 'Profil - Suppression du compte', statutConnexion: res.locals.connecte, admin: false, installe: true, membre: {sites: installe.sites}};
          res.json(retour);
        }

        else if(remplacant) {
          retour = {title: 'Profil - Suppression du compte', statutConnexion: res.locals.connecte, admin: false, installe: false};
          res.json(retour);
        }

        else if(admin) {
          retour = {title: 'Profil - Suppression du compte', statutConnexion: res.locals.connecte, admin: true, installe: false};
          res.json(retour);
        }
      });
    });
  });
});

/* Page profil suppression du compte POST */
router.post('/suppression', verifRequete, function(req, res) {
  var retour;
  var messages = [];

  var raison = req.body.raison;
  var recommandation = req.body.recommandation;
  var amelioration = req.body.amelioration;

  var deleteFolderRecursive = function(path) {
    fs.readdirSync(path).forEach(function(file, index) {
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      }

      else {
        fs.unlinkSync(curPath);
      }
    });
  }

  if(raison != "Non utilisation" && raison != "Retraite" && raison != "Plus besoin des services du site" && raison != "Pas satisfait") {
      messages.push("La raison est invalide");
  }

  if(recommandation != "Oui" && recommandation != "Non") {
      messages.push("La recommandation est invalide");
  }

  req.checkBody({
      "raison": {
        notEmpty: true,
        errorMessage: "La raison n'a pas été renseignée"
      },
      "recommandation": {
        notEmpty: true,
        errorMessage: "La recommandation n'a pas été renseignée"
      },
      "amelioration": {
        matches: {
          options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù.,;?!:@_()/'" ]{0,750}$/,
          errorMessage: "Les améliorations renseignées contiennent des caractères non supportés"
        }
      }
  });

  var errors = req.validationErrors();

  if(errors || messages.length !== 0) {
      if(errors) {
          errors.forEach(function(error) {
              messages.push(error.msg);
          });

          retour = {succes: false, errors: messages};
          res.json(retour);
      }
  }

  else {
      Installe.findOne({adresseMail: req.user.adresseMail}, function(err1, installe) {
          Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err2, remplacant) {
              if(err1 || err2) {
                  messages.push(err1);
                  messages.push(err2);

                  retour = {succes: false, errors: messages};
                  res.json(retour);
              }

              if(installe) {
                  req.logout();

                  for(var i = 0 ; i < installe.sites.length ; i++) {
                      Site.findOne({_id: installe.sites[i]}, function(err3, site) {
                          site.remove();
                      });
                  }

                  Annonce.find({idInstalle: installe._id}, function(err4, annonces) {
                      annonces.forEach(function(annonce) {
                          annonce.remove();
                      });
                  });

                  Evenement.find({idInstalle: installe._id}, function(err5, evenements) {
                      evenements.forEach(function(evenement) {
                          evenement.remove();
                      });
                  });

                  var dirUser = __dirname+"/../public/uploads/"+installe._id;

                  deleteFolderRecursive(dirUser);

                  if(fs.existsSync(dirUser+"/sites/"+installe.sites[0])) {
                      fs.rmdirSync(dirUser+"/sites/"+installe.sites[0]);
                  }

                  if(installe.sites.length == 2) {
                      if(fs.existsSync(dirUser+"/sites/"+installe.sites[1])) {
                          fs.rmdirSync(dirUser+"/sites/"+installe.sites[1]);
                      }
                  }

                  if(installe.sites.length == 3) {
                      if(fs.existsSync(dirUser+"/sites/"+installe.sites[1])) {
                          fs.rmdirSync(dirUser+"/sites/"+installe.sites[1]);
                      }

                      if(fs.existsSync(dirUser+"/sites/"+installe.sites[2])) {
                          fs.rmdirSync(dirUser+"/sites/"+installe.sites[2]);
                      }
                  }

                  if(fs.existsSync(dirUser+"/sites")) {
                      fs.rmdirSync(dirUser+"/sites");
                  }

                  if(fs.existsSync(dirUser)) {
                      fs.rmdirSync(dirUser);
                  }

                  envoiMail.envoiMailSuppressionCompte(installe);
                  //envoiMail.envoiMailSuppressionCompte1Rempla(installe, raison, recommandation, amelioration);

                  AllInstalle.findOne({_id: installe._id}, function(err6, allInstalle) {
                      allInstalle.active = false;
                      allInstalle.raison = raison;
                      allInstalle.recommandation = recommandation;
                      allInstalle.amelioration = amelioration;

                      allInstalle.save(function(err7, resultat) {
                          installe.remove();

                          retour = {succes: true, succesMsg: 'Votre compte a bien été supprimé, vous allez être redirigé vers la page d\'accueil...'};
                          res.json(retour);
                      });
                  });
              }

              if(remplacant) {
                  req.logout();

                  Reponse.find({idRemplacant: remplacant._id}, function(err3, reponses) {
                      reponses.forEach(function(reponse) {
                          reponse.remove();
                      });
                  });

                  Annonce.find({idRemplacant: remplacant._id}, function(err4, annonces) {
                      annonces.forEach(function(annonce) {
                          annonce.remove();
                      });
                  });

                  Evenement.find({idRemplacant: remplacant._id}, function(err5, evenements) {
                      evenements.forEach(function(evenement) {
                          evenement.remove();
                      });
                  });

                  ZoneGeo.find({idRemplacant: remplacant._id}, function(err6, zonesgeo) {
                      zonesgeo.forEach(function(zonegeo) {
                          zonegeo.remove();
                      });
                  });

                  var dirUser = __dirname+"/../public/uploads/"+remplacant._id;

                  deleteFolderRecursive(dirUser);

                  if(fs.existsSync(dirUser)) {
                      fs.rmdirSync(dirUser);
                  }

                  envoiMail.envoiMailSuppressionCompte(remplacant);
                  //envoiMail.envoiMailSuppressionCompte1Rempla(remplacant, raison, recommandation, amelioration);

                  AllRemplacant.findOne({_id: remplacant._id}, function(err7, allRemplacant) {
                      allRemplacant.active = false;
                      allRemplacant.raison = raison;
                      allRemplacant.recommandation = recommandation;
                      allRemplacant.amelioration = amelioration;

                      allRemplacant.save(function(err8, resultat) {
                          remplacant.remove();

                          retour = {succes: true, succesMsg: 'Votre compte a bien été supprimé, vous allez être redirigé vers la page d\'accueil...'};
                          res.json(retour);
                      });
                  });
              }
          });
      });
  }
});

/* Page calendrier GET */
router.get('/calendrier/:id', verifRequete, statutConnexion, loggedIn, function(req, res) {
  var retour;

  Admin.findOne({_id: req.user._id}, function(err, admin) {
    if(admin) {
      retour = {title: 'Profil - Calendrier', statutConnexion: res.locals.connecte, admin: true, installe: false};
      res.json(retour);
    }

    else {
      Installe.findOne({adresseMail: req.user.adresseMail}, function(err1, installe) {
        Evenement.findOne({idInstalle: req.user._id, idSite: req.params.id}, function(err2, evenement) {
          Annonce.findOne({idInstalle: req.user._id, idSite: req.params.id}, function(err3, annonces) {
            if(installe && evenement && annonces) {
              var retourMembre = {
                _id: installe._id,
                sites: installe.sites
              };

              retour = {title: 'Profil - Calendrier', statutConnexion: res.locals.connecte, admin: false, installe: true, membre: retourMembre, events: evenement.evenements, annonces: annonces};
              res.json(retour);
            }

            else if(installe) {
              var retourMembre = {
                _id: installe._id,
                sites: installe.sites
              };

              retour = {title: 'Profil - Calendrier', statutConnexion: res.locals.connecte, admin: false, installe: true, membre: retourMembre, events: [], annonces: ""};
              res.json(retour);
            }

            else {
              retour = {title: 'Profil - Calendrier', statutConnexion: res.locals.connecte, admin: false, installe: false};
              res.json(retour);
            }
          });
        });
      });
    }
  });
});

/* Page calendrier POST */
router.post('/calendrier/:id', verifRequete, function(req, res) {
  var retour;

  var messages = [];

  Specialite.findOne({_id: req.user.specialite}, function(err1, specialite) {
    Site.findOne({_id: req.params.id}, function(err2, site) {
      if(err1 || err2) {
        var err = err1+err2;

        messages.push(err);

        retour = {succes: false, errors: messages};
        res.json(retour);
      }

      else {
        Evenement.findOne({idInstalle: req.user._id, idSite: req.params.id}, function(err3, evenement) {
          Annonce.findOne({idInstalle: req.user._id, idSite: req.params.id}, function(err4, annonce) {
            Installe.findOne({_id: req.user._id}, function(err5, installe) {
              if(req.body.evenements.length > 0) {
                var lieuAnnonce = site.adresseSite+", "+site.villeSite+" "+site.codePostalSite;

                for(var i = 0 ; i < req.body.evenements.length ; i++) {
                    req.body.evenements[i].startsAt = new Date(req.body.evenements[i].startsAt);
                    req.body.evenements[i].endsAt = new Date(req.body.evenements[i].endsAt);
                    req.body.evenements[i].yesterday = new Date(req.body.evenements[i].yesterday);
                    req.body.evenements[i].tomorrow = new Date(req.body.evenements[i].tomorrow);
                }

                for(var i = 0 ; i < req.body.annonces.length ; i++) {
                  var dateDebutParts = req.body.annonces[i].dateDebut.slice(0,10).split("-");
                  dateDebutParts[2] = parseInt(dateDebutParts[2])+1;
                  var startDate = new Date(Date.UTC(parseInt(dateDebutParts[0]), parseInt(dateDebutParts[1])-1,dateDebutParts[2]));
                  req.body.annonces[i].dateDebut = startDate;
                  var dateFinParts = req.body.annonces[i].dateFin.slice(0,10).split("-");
                  dateFinParts[2] = parseInt(dateFinParts[2])+1;
                  var endDate = new Date(Date.UTC(parseInt(dateFinParts[0]), parseInt(dateFinParts[1])-1,dateFinParts[2]));
                  req.body.annonces[i].dateFin = endDate;
                }

                if(evenement) {
                    AllEvenement.findOne({_id: evenement._id}, function(err6, allEvenement) {
                        evenement.update({$set: {evenements: req.body.evenements}}).exec();
                        allEvenement.update({$push: {evenements: req.body.evenements}}).exec();

                        if(annonce === null) {
                            var newAnnonce = new Annonce({
                                idInstalle: req.user._id,
                                idSite: site._id,
                                periodes: req.body.annonces
                            });

                            newAnnonce.save(function(err7, resultat1) {
                                var newAllAnnonce = new AllAnnonce({
                                    _id: newAnnonce._id,
                                    idInstalle: req.user._id,
                                    idSite: site._id,
                                    periodes: req.body.annonces
                                });

                                newAllAnnonce.save(function(err8, resultat2) {
                                    installe.update({$push: {annonces: newAnnonce._id}}).exec();

                                    envoiMail.envoiMailCreationAnnonce(site, installe);

                                    retour = {succes: true, succesMsg: "Changements opérés avec succès"};
                                    res.json(retour);
                                });
                            });
                        }

                        else {
                            AllAnnonce.findOne({_id: annonce._id}, function(err8, allAnnonce) {
                                annonce.update({$set: {periodes: req.body.annonces}}).exec();
                                allAnnonce.update({$push: {periodes: req.body.annonces}}).exec();

                                envoiMail.envoiMailCreationAnnonce(site, installe);

                                retour = {succes: true, succesMsg: "Changements opérés avec succès"};
                                res.json(retour);
                            });
                        }
                    });
                }

                else {
                    var newEvenement = new Evenement({
                        idInstalle: req.user._id,
                        idSite: site._id,
                        evenements: req.body.evenements
                    });

                    newEvenement.save(function(err6, resultat1) {
                        var newAllEvenement = new AllEvenement({
                            _id: newEvenement._id,
                            idInstalle: req.user._id,
                            idSite: site._id,
                            evenements: req.body.evenements
                        });

                        newAllEvenement.save(function(err7, resultat2) {
                            if(annonce === null) {
                                var newAnnonce = new Annonce({
                                    idInstalle: req.user._id,
                                    idSite: site._id,
                                    periodes: req.body.annonces
                                });

                                newAnnonce.save(function(err8, resultat3) {
                                    var newAllAnnonce = new AllAnnonce({
                                        _id: newAnnonce._id,
                                        idInstalle: req.user._id,
                                        idSite: site._id,
                                        periodes: req.body.annonces
                                    });

                                    newAllAnnonce.save(function(err9, resultat4) {
                                        installe.update({$push: {annonces: newAnnonce._id}}).exec();

                                        envoiMail.envoiMailCreationAnnonce(site, installe);

                                        retour = {succes: true, succesMsg: "Changements opérés avec succès"};
                                        res.json(retour);
                                    });
                                });
                            }

                            else {
                                AllAnnonce.findOne({_id: annonce._id}, function(err8, allAnnonce) {
                                    annonce.update({$set: {periodes: req.body.annonces}}).exec();
                                    allAnnonce.update({$push: {periodes: req.body.annonces}}).exec();

                                    envoiMail.envoiMailCreationAnnonce(site, installe);

                                    retour = {succes: true, succesMsg: "Changements opérés avec succès"};
                                    res.json(retour);
                                });
                            }
                        });
                    });
                }
              }

              else {
                envoiMail.envoiMailCreationAnnonce(site, installe);

                installe.update({$pull: {annonces: annonce._id}}).exec();

                if(evenement) {
                    evenement.remove();
                }

                if(annonce) {
                    annonce.remove();
                }

                retour = {succes: true, succesMsg: "Changements opérés avec succès"};
                res.json(retour);
              }
            });
          });
        });
      }
    });
  });
});

/* Page disponibilite GET */
router.get('/disponibilite', verifRequete, statutConnexion, loggedIn, function(req, res) {
  var retour;

  Admin.findOne({_id: req.user._id}, function(err, admin) {
    if(admin) {
      retour = {title: 'Profil - Disponibilités', statutConnexion: res.locals.connecte, admin: true, installe: false};
      res.json(retour);
    }

    else {
      ZoneGeo.findOne({idRemplacant: req.user._id}, function(err1, zoneGeo) {
        if(zoneGeo && zoneGeo.cercles.length > 0) {
          Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err2, remplacant) {
            Evenement.findOne({idRemplacant: req.user._id}, function(err3, evenement) {
              Annonce.findOne({idRemplacant: req.user._id}, function(err4, annonces) {
                if(remplacant && evenement && annonces) {
                  retour = {title: 'Profil - Disponibilités', statutConnexion: res.locals.connecte, admin: false, installe: false, membre: {_id: remplacant._id}, events: evenement.evenements, annonces: annonces, notFound: false};
                  res.json(retour);
                }

                else if(remplacant) {
                  retour = {title: 'Profil - Disponibilités', statutConnexion: res.locals.connecte, admin: false, installe: false, membre: {_id: remplacant._id}, events: [], annonces: "", notFound: false};
                  res.json(retour);
                }

                else {
                  retour = {title: 'Profil - Disponibilités', statutConnexion: res.locals.connecte, admin: false, installe: true};
                  res.json(retour);
                }
              });
            });
          });
        }

        else {
          Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err2, remplacant) {
            if(remplacant) {
              retour = {title: 'Profil - Disponibilités', statutConnexion: res.locals.connecte, admin: false, installe: false, notFound: true};
              res.json(retour);
            }

            else {
              retour = {title: 'Profil - Disponibilités', statutConnexion: res.locals.connecte, admin: false, installe: true};
              res.json(retour);
            }
          });
        }
      });
    }
  });
});

/* Page disponibilités POST */
router.post('/disponibilite', verifRequete, function(req, res) {
  var retour;

  var messages = [];

  Specialite.findOne({_id: req.user.specialite}, function(err1, specialite) {
    ZoneGeo.findOne({idRemplacant: req.user._id}, function(err2, zoneGeo) {
      if(err1 || err2) {
        var err = err1 + err2;
        messages.push(err);

        retour = {succes: false, errors: messages};
        res.json(retour);
      }

      else {
        Evenement.findOne({idRemplacant: req.user._id}, function(err3, evenement) {
          Annonce.findOne({idRemplacant: req.user._id}, function(err4, annonce) {
            Remplacant.findOne({_id: req.user._id}, function(err5, remplacant) {
              if(req.body.evenements.length > 0) {
                for(var i = 0 ; i < req.body.evenements.length ; i++) {
                    req.body.evenements[i].startsAt = new Date(req.body.evenements[i].startsAt);
                    req.body.evenements[i].endsAt = new Date(req.body.evenements[i].endsAt);
                    req.body.evenements[i].yesterday = new Date(req.body.evenements[i].yesterday);
                    req.body.evenements[i].tomorrow = new Date(req.body.evenements[i].tomorrow);
                }

                for(var i = 0 ; i < req.body.annonces.length ; i++) {
                  var dateDebutParts = req.body.annonces[i].dateDebut.slice(0,10).split("-");
                  dateDebutParts[2] = parseInt(dateDebutParts[2])+1;
                  var startDate = new Date(Date.UTC(parseInt(dateDebutParts[0]), parseInt(dateDebutParts[1])-1,dateDebutParts[2]));
                  req.body.annonces[i].dateDebut = startDate;
                  var dateFinParts = req.body.annonces[i].dateFin.slice(0,10).split("-");
                  dateFinParts[2] = parseInt(dateFinParts[2])+1;
                  var endDate = new Date(Date.UTC(parseInt(dateFinParts[0]), parseInt(dateFinParts[1])-1,dateFinParts[2]));
                  req.body.annonces[i].dateFin = endDate;
                }

                if(evenement) {
                    AllEvenement.findOne({_id: evenement._id}, function(err6, allEvenement) {
                        evenement.update({$set: {evenements: req.body.evenements}}).exec();
                        allEvenement.update({$push: {evenements: req.body.evenements}}).exec();

                        if(annonce === null) {
                            var newAnnonce = new Annonce({
                                idRemplacant: req.user._id,
                                idZonesGeo: zoneGeo._id,
                                periodes: req.body.annonces
                            });

                            newAnnonce.save(function (err7, resultat1) {
                                var newAllAnnonce = new AllAnnonce({
                                    _id: newAnnonce._id,
                                    idRemplacant: req.user._id,
                                    idZonesGeo: zoneGeo._id,
                                    periodes: req.body.annonces
                                });

                                newAllAnnonce.save(function(err8, resultat2) {
                                    remplacant.update({$push: {annonces: newAnnonce._id}}).exec();

                                    envoiMail.envoiMailCreationDisponibilite(remplacant);

                                    retour = {succes: true, succesMsg: "Changements opérés avec succès"};
                                    res.json(retour);
                                });
                            });
                        }

                        else {
                            AllAnnonce.findOne({_id: annonce._id}, function(err8, allAnnonce) {
                                annonce.update({$set: {periodes: req.body.annonces}}).exec();
                                allAnnonce.update({$push: {periodes: req.body.annonces}}).exec();

                                envoiMail.envoiMailCreationDisponibilite(remplacant);

                                retour = {succes: true, succesMsg: "Changements opérés avec succès"};
                                res.json(retour);
                            });
                        }
                    });
                }

                else {
                    var newEvenement = new Evenement({
                        idRemplacant: req.user._id,
                        idZonesGeo: zoneGeo._id,
                        evenements: req.body.evenements
                    });

                    newEvenement.save(function(err7, resultat1) {
                        var newAllEvenement = new AllEvenement({
                            _id: newEvenement._id,
                            idRemplacant: req.user._id,
                            idZonesGeo: zoneGeo._id,
                            evenements: req.body.evenements
                        });

                        newAllEvenement.save(function(err7, resultat2) {
                            if(annonce === null) {
                                var newAnnonce = new Annonce({
                                    idRemplacant: req.user._id,
                                    idZonesGeo: zoneGeo._id,
                                    periodes: req.body.annonces
                                });

                                newAnnonce.save(function (err8, resultat3) {
                                    var newAllAnnonce = new AllAnnonce({
                                        _id: newAnnonce._id,
                                        idRemplacant: req.user._id,
                                        idZonesGeo: zoneGeo._id,
                                        periodes: req.body.annonces
                                    });

                                    newAllAnnonce.save(function(err9, resultat4) {
                                        remplacant.update({$push: {annonces: newAnnonce._id}}).exec();

                                        envoiMail.envoiMailCreationDisponibilite(remplacant);

                                        retour = {succes: true, succesMsg: "Changements opérés avec succès"};
                                        res.json(retour);
                                    });
                                });
                            }

                            else {
                                AllAnnonce.findOne({_id: annonce._id}, function(err8, allAnnonce) {
                                    annonce.update({$set: {periodes: req.body.annonces}}).exec();
                                    allAnnonce.update({$push: {periodes: req.body.annonces}}).exec();

                                    envoiMail.envoiMailCreationDisponibilite(remplacant);

                                    retour = {succes: true, succesMsg: "Changements opérés avec succès"};
                                    res.json(retour);
                                });
                            }
                        });
                    });
                }
              }

              else {
                envoiMail.envoiMailCreationDisponibilite(remplacant);

                remplacant.update({$set: {annonces: []}}).exec();

                if(evenement) {
                  evenement.remove();
                }

                if(annonce) {
                  annonce.remove();
                }

                retour = {succes: true, succesMsg: "Changements opérés avec succès"};
                res.json(retour);
              }
            });
          });
        });
      }
    });
  });
});

module.exports = router;
