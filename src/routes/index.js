var express = require('express');
var router = express.Router();

var googleDistance = require('google-distance');
var geolib = require('geolib');
var Admin = require('../models/adminModel');
var Installe = require('../models/installeModel');
var Remplacant = require('../models/remplacantModel');
var Site = require('../models/siteModel');
var AllInstalle = require('../models/allInstalleModel');
var AllRemplacant = require('../models/allRemplacantModel');
var AllSite = require('../models/allSiteModel');
var Specialite = require('../models/specialiteModel');
var TypeSite = require('../models/typeSiteModel');
var Annonce = require('../models/annonceModel');
var Reponse = require('../models/reponseModel');
var Avis = require('../models/avisModel');
var passport = require('passport');
var generationToken = require('../config/token');
var envoiMail = require('../config/envoiMail');
var verifRequete = require('../config/verifRequete');
var statutConnexion = require('../config/statutConnexion');
var loggedIn = require('../config/connecteRole');
var notLoggedIn = require('../config/nonConnecteRole');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
var fs = require('fs');

//Fonction qui vérifie toutes les minutes si des membres n'ont pas validé leurs comptes au bout de 4h
var verifUsersNotVerified = setInterval(function() {
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
  };

  Installe.find({active: false, expirationValidation: {$lt: Date.now()}}, function(err1, installes) {
    Remplacant.find({active: false, expirationValidation: {$lt: Date.now()}}, function(err2, remplacants) {
      if(installes || remplacants) {
        if(installes) {
          installes.forEach(function(installe) {
            for(var i = 0 ; i < installe.sites.length ; i++) {
              Site.findOne({_id: installe.sites[i]}, function(err3, site) {
                site.remove();
              });
            }

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

            //envoiMail.envoiMailSuppressionCompteNonValide(installe);

            installe.remove();
          });
        }

        if(remplacants) {
          remplacants.forEach(function(remplacant) {
            var dirUser = __dirname+"/../public/uploads/"+remplacant._id;

            deleteFolderRecursive(dirUser);

            if(fs.existsSync(dirUser)) {
              fs.rmdirSync(dirUser);
            }

            //envoiMail.envoiMailSuppressionCompteNonValide(remplacant);

            remplacant.remove();
          });
        }
      }
    });
  });
}, 10000);

//Fonctions pour la recherche d'annonce
var calculDistanceAnnonce = function(res, k, distance, retour, place, destination, annoncesTab2, annoncesTab3, placeLoc) {
  googleDistance.get({origin: place, destination: destination}, function(err, data) {
      if (err) {
        retour = {succes: false, errors: err};
      }

      else {
        if(data.distanceValue < ((distance*1000)+5000)) {
          annoncesTab3.push(annoncesTab2[k]);

          if(k == annoncesTab2.length-1) {
            retourAnnonce(res, retour, annoncesTab3, placeLoc);
          }
        }

        else {
          if(k == annoncesTab2.length-1) {
            retourAnnonce(res, retour, annoncesTab3, placeLoc);
          }
        }
      }
  });
};

var retourAnnonce = function(res, retour, annoncesTab3, placeLoc) {
  if(retour !== undefined) {
    res.json(retour);
  }

  else if(annoncesTab3.length === 0) {
    retour = {succes: false, errors: "Aucune annonce ne se situe dans le périmètre indiqué"};
    res.json(retour);
  }

  else {
    var annoncesRetour = [];

    for(var i = 0 ; i < annoncesTab3.length ; i++) {
      annoncesRetour.push({
          idInstalle: {
            nom: annoncesTab3[i].idInstalle.nom,
            prenom: annoncesTab3[i].idInstalle.prenom
          },
          idSite: {
            nomSite: annoncesTab3[i].idSite.nomSite,
            adresseSite: annoncesTab3[i].idSite.adresseSite,
            villeSite: annoncesTab3[i].idSite.villeSite,
            codePostalSite: annoncesTab3[i].idSite.codePostalSite,
            photos: annoncesTab3[i].idSite.photos,
            coordonneesSite: annoncesTab3[i].idSite.coordonneesSite
          },
          periodes: annoncesTab3[i].periodes,
          _id: annoncesTab3[i]._id
      });
    }

    retour = {succes: true, annonces: annoncesRetour, place: placeLoc};
    res.json(retour);
  }
};

//Fonctions pour la recherche de disponibilités
var retourDisponibilite = function(res, retour, remplacantTab3, placeLoc) {
  if(retour ==! undefined) {
    res.json(retour);
  }

  else if(remplacantTab3.length == 0) {
    retour = {succes: false, errors: "Aucun remplaçant ne se situe dans le périmètre indiqué"};
    res.json(retour);
  }

  else {
      var remplacantsRetour = [];

      for(var i = 0 ; i < remplacantTab3.length ; i++) {
          remplacantsRetour.push({
              idRemplacant: {
                  nom: remplacantTab3[i].idRemplacant.nom,
                  prenom: remplacantTab3[i].idRemplacant.prenom,
                  photoMembre: remplacantTab3[i].idRemplacant.photoMembre,
                  specialite: remplacantTab3[i].idRemplacant.specialite
              },
              idZonesGeo: remplacantTab3[i].idZonesGeo,
              periodes: remplacantTab3[i].periodes,
              _id: remplacantTab3[i]._id
          });
      }

    retour = {succes:true, remplacants: remplacantsRetour, place: placeLoc};
    res.json(retour);
  }
};

/* Page d'accueil GET */
router.get('/accueil', verifRequete, statutConnexion, function(req, res) {
  var retour;
  var specialitesTab = [];

  Specialite.find(function(err, specialites) {
    specialitesTab = specialites;

    if(req.isAuthenticated()) {
      Admin.findOne({_id: req.user.id}, function(err1, admin) {
        Installe.findOne({adresseMail: req.user.adresseMail}, function(err2, installe) {
          Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err3, remplacant) {
            if(admin) {
              retour = {title: 'Page d\'accueil', statutConnexion: res.locals.connecte, admin: true, installe: false, specialites: specialitesTab};
              res.json(retour);
            }

            if(installe) {
              retour = {title: 'Page d\'accueil', statutConnexion: res.locals.connecte, admin: false, installe: true, membre: {sites: installe.sites}, specialites: specialitesTab};
              res.json(retour);
            }

            if(remplacant) {
              retour = {title: 'Page d\'accueil', statutConnexion: res.locals.connecte, admin: false, installe: false, specialites: specialitesTab};
              res.json(retour);
            }
          });
        });
      });
    }

    else {
      retour = {title: 'Page d\'accueil', statutConnexion: res.locals.connecte, specialites: specialitesTab};
      res.json(retour);
    }
  });
});

/* Page d'accueil POST */
router.post('/accueil', verifRequete, function(req, res) {
  var retour;

  var rechercheTypeAnnonce = req.body.rechercheTypeAnnonce;
  var specialite = req.body.specialite.typeSpecialite;
  var periode = req.body.periode;
  var place = req.body.place;
  var placeLoc = req.body.placeLoc;

  var dateDebutParts = periode.slice(0,10).split("/");
  var startDate = new Date(Date.UTC(parseInt(dateDebutParts[2]), parseInt(dateDebutParts[1])-1,dateDebutParts[0]));

  var dateFinParts = periode.slice(13,23).split("/");
  var endDate = new Date(Date.UTC(parseInt(dateFinParts[2]), parseInt(dateFinParts[1])-1, parseInt(dateFinParts[0])));

  if(rechercheTypeAnnonce == 'true') {
    var distance = parseInt(req.body.distance);

    req.checkBody({
      'specialite': {
        notEmpty: true,
        matches: {
            options: /[A-Za-z -]{1,31}/,
            errorMessage: 'Le format de la spécialité est incorrect'
        },
        errorMessage: 'La spécialité est manquante',
      },
      'periode': {
        notEmpty: true,
        matches: {
            options: /[0-9]{2}[/][0-9]{2}[/][0-9]{4}[ -]{3}[0-9]{2}[/][0-9]{2}[/][0-9]{4}/,
            errorMessage: 'Le format de la période est incorrect'
        },
        errorMessage: 'La période est manquante'
      },
      'place': {
        notEmpty: true,
          matches: {
              options: /[A-Za-z0-9 ,-]{1,}/,
              errorMessage: 'Le format du lieu est incorrect'
          },
        errorMessage: 'Le lieu est manquant'
      },
      'distance': {
        notEmpty: true,
        matches: {
            options: /[0-9]{1,3}/,
            errorMessage: 'Le format de la distance est incorrect'
        },
        errorMessage: 'La distance est manquante'
      },
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
      var specialiteCheck = false;
      var lieuCheck = false;
      var annoncesTab1 = [];
      var annoncesTab2 = [];
      var annoncesTab3 = [];

      Annonce.aggregate([
        {
            $lookup:
              {
                from: "installes",
                localField: "idInstalle",
                foreignField: "_id",
                as: "idInstalle"
              }
          },
          {
            $unwind:"$idInstalle"
          },
          {
            $lookup:
              {
                from: "specialites",
                localField: "idInstalle.specialite",
                foreignField: "_id",
                as: "idInstalle.specialite"
              }
          },
          {
            $unwind:"$idInstalle.specialite"
          },
          {
            $lookup:
              {
                from: "sites",
                localField: "idSite",
                foreignField: "_id",
                as: "idSite"
              }
          },
          {
            $unwind:"$idSite"
          },
          {
            $match: {
               $and: [
                   {"idInstalle.specialite.typeSpecialite": specialite}
              ]
            }
          }
      ],
      function(err1, annonce) {
        annoncesTab1 = annonce;

        if(err1) {
          retour = {succes: false, errors: err1};
          res.json(retour);
        }

        else if(annoncesTab1.length == 0 || annoncesTab1 == undefined) {
          retour = {succes: false, errors: "Aucune annonce ne correspond à la spécialité"};
          res.json(retour);
        }

        else {
          var jourDebSel = startDate.getDate();
          var moisDebSel = startDate.getMonth() + 1;
          var anneeDebSel = startDate.getFullYear();
          var jourFinSel = endDate.getDate();
          var moisFinSel = endDate.getMonth() + 1;
          var anneeFinSel = endDate.getFullYear();

          for(var i = 0 ; i < annoncesTab1.length ; i++) {
            for(var j = 0 ; j < annoncesTab1[i].periodes.length ; j++) {
              var jourDebAnnonce = annoncesTab1[i].periodes[j].dateDebut.getDate();
              var moisDebAnnonce = annoncesTab1[i].periodes[j].dateDebut.getMonth()+1;
              var anneeDebAnnonce = annoncesTab1[i].periodes[j].dateDebut.getFullYear();
              var jourFinAnnonce = annoncesTab1[i].periodes[j].dateFin.getDate();
              var moisFinAnnonce = annoncesTab1[i].periodes[j].dateFin.getMonth()+1;
              var anneeFinAnnonce = annoncesTab1[i].periodes[j].dateFin.getFullYear();

              if (((anneeDebSel > anneeDebAnnonce) || (anneeDebSel == anneeDebAnnonce && (moisDebSel > moisDebAnnonce || (moisDebSel == moisDebAnnonce && jourDebSel >= jourDebAnnonce )))) && ((anneeFinSel < anneeFinAnnonce) || (anneeFinSel == anneeFinAnnonce && (moisFinSel < moisFinAnnonce || (moisFinSel == moisFinAnnonce && jourFinSel <= jourFinAnnonce )))) ){
                annoncesTab2.push(annoncesTab1[i]);
                break;
              }

              else if(((anneeDebSel < anneeDebAnnonce) || (anneeDebSel == anneeDebAnnonce && (moisDebSel < moisDebAnnonce || (moisDebSel == moisDebAnnonce && jourDebSel <= jourDebAnnonce )))) && ((anneeFinSel > anneeFinAnnonce) || (anneeFinSel == anneeFinAnnonce && (moisFinSel > moisFinAnnonce || (moisFinSel == moisFinAnnonce && jourFinSel >= jourFinAnnonce )))) ){
                annoncesTab2.push(annoncesTab1[i]);
                break;
              }

              else if((anneeDebAnnonce<anneeDebSel || (anneeDebAnnonce==anneeDebSel && (moisDebAnnonce<moisDebSel || (moisDebAnnonce==moisDebSel && jourDebAnnonce<=jourDebSel)))) && (anneeFinAnnonce>anneeDebSel || (anneeFinAnnonce==anneeDebSel && (moisFinAnnonce>moisDebSel || (moisFinAnnonce==moisDebSel && jourFinAnnonce>=jourDebSel)))) ){
                annoncesTab2.push(annoncesTab1[i]);
                break;
              }

              else if((anneeDebAnnonce<anneeFinSel || (anneeDebAnnonce==anneeFinSel && (moisDebAnnonce<moisFinSel || (moisDebAnnonce==moisFinSel && jourDebAnnonce<=jourFinSel)))) && (anneeFinAnnonce>anneeFinSel || (anneeFinAnnonce==anneeFinSel && (moisFinAnnonce>moisFinSel || (moisFinAnnonce==moisFinSel && jourFinAnnonce>=jourFinSel)))) ){
                annoncesTab2.push(annoncesTab1[i]);
                break;
              }
            }
          }

          if(annoncesTab2.length !== 0) {
            for(var k = 0 ; k < annoncesTab2.length ; k++) {
              var destination = "";

              if(annoncesTab2[k].idSite.adresseSite == null || annoncesTab2[k].idSite.adresseSite == undefined) {
                destination = ""+annoncesTab2[k].idSite.villeSite+", France";
              }

              else {
                destination = annoncesTab2[k].idSite.adresseSite+", "+annoncesTab2[k].idSite.villeSite+", France";
              }

              calculDistanceAnnonce(res, k, distance, retour, place, destination, annoncesTab2, annoncesTab3, placeLoc);
            }
          }

          else {
            retour = {succes: false, errors: "Aucune annonce ne correspond aux dates choisies"};
            res.json(retour);
          }
        }
      });
    }
  }

  else {
    req.checkBody({
      'specialite': {
        notEmpty: true,
        matches: {
            options: /[A-Za-z -]{1,31}/,
            errorMessage: 'Le format de la spécialité est incorrect'
        },
        errorMessage: 'La spécialité est manquante',
      },
      'periode': {
        notEmpty: true,
        matches: {
            options: /[0-9]{2}[/][0-9]{2}[/][0-9]{4}[ -]{3}[0-9]{2}[/][0-9]{2}[/][0-9]{4}/,
            errorMessage: 'Le format de la période est incorrect'
        },
        errorMessage: 'La période est manquante'
      },
      'place': {
        notEmpty: true,
        matches: {
            options: /[A-Za-z0-9 ,-]{1,}/,
            errorMessage: 'Le format du lieu est incorrect'
        },
        errorMessage: 'Le lieu est manquant'
      },
      'distance': {
        notEmpty: true,
        matches: {
            options: /[0-9]{1,3}/,
            errorMessage: 'Le format de la distance est incorrect'
        },
        errorMessage: 'La distance est manquante'
      },
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
      var specialiteCheck = false;
      var lieuCheck = false;
      var remplacantsTab1 = [];
      var remplacantsTab2 = [];
      var remplacantsTab3 = [];

      Annonce.aggregate([
        {
            $lookup:
              {
                from: "remplacants",
                localField: "idRemplacant",
                foreignField: "_id",
                as: "idRemplacant"
              }
          },
          {
            $unwind:"$idRemplacant"
          },
          {
            $lookup:
              {
                from: "specialites",
                localField: "idRemplacant.specialite",
                foreignField: "_id",
                as: "idRemplacant.specialite"
              }
          },
          {
            $unwind:"$idRemplacant.specialite"
          },
          {
            $lookup:
              {
                from: "zonegeos",
                localField: "idRemplacant.zonesGeo",
                foreignField: "_id",
                as: "idRemplacant.zonesGeo"
              }
          },
          {
            $unwind:"$idRemplacant.zonesGeo"
          },
          {
            $match: {
               $and: [
                   {"idRemplacant.specialite.typeSpecialite": specialite},
              ]
            }
          }
      ], function(err1, remplacant) {

        remplacantsTab1 = remplacant;

        if(err1) {
          retour = {succes: false, errors: err1};
          res.json(retour);
        }

        else if(remplacantsTab1.length == 0 || remplacantsTab1 == undefined) {
          retour = {succes: false, errors: "Aucun remplaçant ne correspond à la spécialité"};
          res.json(retour);
        }

        else {
          var jourDebSel = startDate.getDate();
          var moisDebSel = startDate.getMonth() + 1;
          var anneeDebSel = startDate.getFullYear();
          var jourFinSel = endDate.getDate();
          var moisFinSel = endDate.getMonth() + 1;
          var anneeFinSel = endDate.getFullYear();

          for(var i = 0 ; i < remplacantsTab1.length ; i++) {
            for(var j = 0 ; j < remplacantsTab1[i].periodes.length ; j++) {
              var jourDebAnnonce = remplacantsTab1[i].periodes[j].dateDebut.getDate();
              var moisDebAnnonce = remplacantsTab1[i].periodes[j].dateDebut.getMonth()+1;
              var anneeDebAnnonce = remplacantsTab1[i].periodes[j].dateDebut.getFullYear();
              var jourFinAnnonce = remplacantsTab1[i].periodes[j].dateFin.getDate();
              var moisFinAnnonce = remplacantsTab1[i].periodes[j].dateFin.getMonth()+1;
              var anneeFinAnnonce = remplacantsTab1[i].periodes[j].dateFin.getFullYear();

              if (((anneeDebSel > anneeDebAnnonce) || (anneeDebSel == anneeDebAnnonce && (moisDebSel > moisDebAnnonce || (moisDebSel == moisDebAnnonce && jourDebSel >= jourDebAnnonce )))) && ((anneeFinSel < anneeFinAnnonce) || (anneeFinSel == anneeFinAnnonce && (moisFinSel < moisFinAnnonce || (moisFinSel == moisFinAnnonce && jourFinSel <= jourFinAnnonce )))) ){
                remplacantsTab2.push(remplacantsTab1[i]);
                break;
              }

              else if(((anneeDebSel < anneeDebAnnonce) || (anneeDebSel == anneeDebAnnonce && (moisDebSel < moisDebAnnonce || (moisDebSel == moisDebAnnonce && jourDebSel <= jourDebAnnonce )))) && ((anneeFinSel > anneeFinAnnonce) || (anneeFinSel == anneeFinAnnonce && (moisFinSel > moisFinAnnonce || (moisFinSel == moisFinAnnonce && jourFinSel >= jourFinAnnonce )))) ){
                remplacantsTab2.push(remplacantsTab1[i]);
                break;
              }

              else if((anneeDebAnnonce<anneeDebSel || (anneeDebAnnonce==anneeDebSel && (moisDebAnnonce<moisDebSel || (moisDebAnnonce==moisDebSel && jourDebAnnonce<=jourDebSel)))) && (anneeFinAnnonce>anneeDebSel || (anneeFinAnnonce==anneeDebSel && (moisFinAnnonce>moisDebSel || (moisFinAnnonce==moisDebSel && jourFinAnnonce>=jourDebSel)))) ){
                remplacantsTab2.push(remplacantsTab1[i]);
                break;
              }

              else if((anneeDebAnnonce<anneeFinSel || (anneeDebAnnonce==anneeFinSel && (moisDebAnnonce<moisFinSel || (moisDebAnnonce==moisFinSel && jourDebAnnonce<=jourFinSel)))) && (anneeFinAnnonce>anneeFinSel || (anneeFinAnnonce==anneeFinSel && (moisFinAnnonce>moisFinSel || (moisFinAnnonce==moisFinSel && jourFinAnnonce>=jourFinSel)))) ){
                remplacantsTab2.push(remplacantsTab1[i]);
                break;
              }
            }
          }

          if(remplacantsTab2.length !== 0) {
            for(var k = 0 ; k < remplacantsTab2.length ; k++) {
              var zones = remplacantsTab2[k].idRemplacant.zonesGeo.cercles;

              for(var l = 0 ; l < zones.length ; l++) {
                var origine = placeLoc[0].toString()+", "+placeLoc[1].toString();
                var destination = zones[l].center.latitude.toString()+", "+zones[l].center.longitude.toString();
                var distance = geolib.getDistance({latitude: placeLoc[0], longitude: placeLoc[1]}, {latitude: zones[l].center.latitude, longitude: zones[l].center.longitude});

                if(distance < parseInt(zones[l].radius)) {
                   remplacantsTab3.push(remplacantsTab2[k]);
                }
              }

              if(k == remplacantsTab2.length-1) {
                retourDisponibilite(res, retour, remplacantsTab3, placeLoc);
              }
            }
          }

          else {
            retour = {succes: false, errors: "Aucun remplaçant ne correspond aux dates choisies"};
            res.json(retour);
          }
        }
      });
    }
  }
});

/* Page A Propos GET*/
router.get('/apropos', verifRequete, statutConnexion, function(req, res) {
    var retour;

    if(req.isAuthenticated()) {
        Admin.findOne({_id: req.user.id}, function(err1, admin) {
            Installe.findOne({adresseMail: req.user.adresseMail}, function(err2, installe) {
                Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err3, remplacant) {
                    if(admin) {
                        retour = {title: 'A propos', statutConnexion: res.locals.connecte, admin: true, installe: false};
                        res.json(retour);
                    }

                    if(installe) {
                        retour = {title: 'A propos', statutConnexion: res.locals.connecte, admin: false, installe: true, membre: {sites: installe.sites}};
                        res.json(retour);
                    }

                    if(remplacant) {
                        retour = {title: 'A Propos', statutConnexion: res.locals.connecte, admin: false, installe: false};
                        res.json(retour);
                    }
                });
            });
        });
    }

    else {
        retour = {title: 'A propos', statutConnexion: res.locals.connecte};
        res.json(retour);
    }
});

/* Page Mentions Légales GET*/
router.get('/mentionsLegales', verifRequete, statutConnexion, function(req, res) {
    var retour;

    if(req.isAuthenticated()) {
        Admin.findOne({_id: req.user.id}, function(err1, admin) {
            Installe.findOne({adresseMail: req.user.adresseMail}, function(err2, installe) {
                Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err3, remplacant) {
                    if(admin) {
                        retour = {title: 'Mentions Légales', statutConnexion: res.locals.connecte, admin: true, installe: false};
                        res.json(retour);
                    }

                    if(installe) {
                        retour = {title: 'Mentions Légales', statutConnexion: res.locals.connecte, admin: false, installe: true, membre: {sites: installe.sites}};
                        res.json(retour);
                    }

                    if(remplacant) {
                        retour = {title: 'Mentions Légales', statutConnexion: res.locals.connecte, admin: false, installe: false};
                        res.json(retour);
                    }
                });
            });
        });
    }

    else {
        retour = {title: 'Mentions Légales', statutConnexion: res.locals.connecte};
        res.json(retour);
    }
});

/* Page CGU GET*/
router.get('/conditions-generales-d-utilisation', verifRequete, statutConnexion, function(req, res) {
    var retour;

    if(req.isAuthenticated()) {
        Admin.findOne({_id: req.user.id}, function(err1, admin) {
            Installe.findOne({adresseMail: req.user.adresseMail}, function(err2, installe) {
                Remplacant.findOne({adresseMail: req.user.adresseMail}, function(err3, remplacant) {
                    if(admin) {
                        retour = {title: 'Conditions générales d\'utilisation', statutConnexion: res.locals.connecte, admin: true, installe: false};
                        res.json(retour);
                    }

                    if(installe) {
                        retour = {title: 'Conditions générales d\'utilisation', statutConnexion: res.locals.connecte, admin: false, installe: true, membre: {sites: installe.sites}};
                        res.json(retour);
                    }

                    if(remplacant) {
                        retour = {title: 'Conditions générales d\'utilisation', statutConnexion: res.locals.connecte, admin: false, installe: false};
                        res.json(retour);
                    }
                });
            });
        });
    }

    else {
        retour = {title: 'Conditions générales d\'utilisation', statutConnexion: res.locals.connecte};
        res.json(retour);
    }
});

/* Page de connexion GET */
router.get('/connexion', verifRequete, statutConnexion, notLoggedIn, function(req, res) {
  var retour;
  var messages = req.flash('error');

  retour = {title: 'Connexion', statutConnexion: res.locals.connecte, messages: messages, hasErrors: messages.length > 0};
  res.json(retour);
});

/* Page de connexion POST */
router.post('/connexion', verifRequete, function(req, res, next) {
    passport.authenticate('local.login', function(err, user, info) {
      if(!user) {
        res.json({loggedIn: false, messages: [info.message]});
      }

      else {
        req.logIn(user, function(err) {
            res.json({loggedIn: true});
        });
      }
    })(req, res, next);
});

/* Page mot de passe oublié GET */
router.get('/connexion/motDePasseOublie', verifRequete, statutConnexion, notLoggedIn, function(req, res) {
  var retour;
  var messages = req.flash('error');

  retour = {title : 'Mot de passe oublié', statutConnexion: res.locals.connecte, messages: messages, hasErrors: messages.length > 0};
  res.json(retour);
});

/* Page mot de passe oublié POST */
router.post('/connexion/motDePasseOublie', verifRequete, function(req, res) {
  var retour;

  var adresseMail = req.body.adresseMail;

  req.checkBody({
      'adresseMail': {
          matches: {
            options: /^[a-z0-9_-]+(.[a-z0-9_-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/,
            errorMessage: "L'adresse mail est invalide"
          },
          notEmpty: true,
          errorMessage: "L'adresse mail est vide"
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
    Installe.findOne({adresseMail: adresseMail}, function(err1, installe) {
      Remplacant.findOne({adresseMail: adresseMail}, function(err2, remplacant) {
        if(err1 || err2) {
          messages.push(err1);
          messages.push(err2);

          retour = {succes: false, errors: messages};
          res.json(retour);
        }

        if(installe || remplacant) {
          var token = generationToken.initialisation();

          if(installe) {
            generationToken.miseEnPlaceTokens(token, installe);
            envoiMail.envoiMailOubliMdp(token, installe);

            retour = {succes: true, succesMsg: 'Le mail a été envoyé avec succès'};
            res.json(retour);
          }

          if(remplacant) {
            generationToken.miseEnPlaceTokens(token, remplacant);
            envoiMail.envoiMailOubliMdp(token, remplacant);

            retour = {succes: true, succesMsg: 'Le mail a été envoyé avec succès'};
            res.json(retour);
          }
        }

        else {
          messages.push('Utilisateur non trouvé');

          retour = {succes: false, errors: messages};
          res.json(retour);
        }
      });
    });
  }
});

/* Page réinitialisation mot de passe GET */
router.get('/reinitialisationMdp/:token', verifRequete, statutConnexion, notLoggedIn, function(req, res) {
  var retour;

  Installe.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err1, installe) {
    Remplacant.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err2, remplacant) {
      if(!installe && !remplacant) {
        retour = {title: 'Réinitialisation du mot de passe', error: true, statutConnexion: res.locals.connecte};
        res.json(retour);
      }

      else {
        retour = {title : 'Réinitialisation du mot de passe', error: false, statutConnexion: res.locals.connecte};
        res.json(retour);
      }
    });
  });
});

/* Page réinitialisation mot de passe POST */
router.post('/reinitialisationMdp/:token', verifRequete, function(req, res) {
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
      }
    },
    'mdpNouveau2': {
      isLength: {
        options: [{ min: 7, max: undefined }],
        errorMessage: 'Vous devez indiquer un nouveau mot de passe à confirmer qui contient au moins 7 caractères'
      },
      equals: {
        options: req.body.mdpNouveau1,
        errorMessage: 'Vous devez indiquer un nouveau mot de passe à confirmer identique'
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
    Installe.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err1, installe) {
      Remplacant.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err2, remplacant) {
        if(err1 || err2) {
          messages.push(err1);
          messages.push(err2);

          retour = {succes: false, errors: messages};
          res.json(retour);
        }

        if(installe) {
          installe.motDePasse = installe.encryptPassword(req.body.mdpNouveau1);
          generationToken.retireToken(installe);
          envoiMail.envoiMailMdpReinit(installe);

          retour = {succes: true, succesMsg: 'Mot de passe modifié avec succès'};
          res.json(retour);
        }

        if(remplacant) {
          remplacant.motDePasse = remplacant.encryptPassword(req.body.mdpNouveau1);
          generationToken.retireToken(remplacant);
          envoiMail.envoiMailMdpReinit(remplacant);

          retour = {succes: true, succesMsg: 'Mot de passe modifié avec succès'};
          res.json(retour);
        }
      });
    });
  }
});

/* Page d'inscription GET */
router.get('/inscription', verifRequete, statutConnexion, notLoggedIn, function(req, res) {
  var retour;
  var specialitesTab = [];
  var messages = req.flash('error');

  Specialite.find(function(err, specialites) {
    TypeSite.find(function(err, typeSites) {
      specialitesTab = specialites;
      typeSiteTab = typeSites;
      retour = {title: 'Inscription', statutConnexion: res.locals.connecte, specialites: specialitesTab, typeSites: typeSiteTab, messages: messages, hasErrors: messages.length > 0};
      res.json(retour);
    });
  });
});

/* Page d'inscription POST */
router.post('/inscription', verifRequete, multipartyMiddleware, function(req, res, next) {
    passport.authenticate('local.register', function(err, user, info) {
        if(!user) {
            res.json({loggedIn: false, messages: [info.message]});
        }

        else {
            req.logIn(user, function(err) {
                res.json({loggedIn: true});
            });
        }
    })(req, res, next);
});

/* Déconnexion POST */
router.post('/deconnexion', verifRequete, loggedIn, function(req, res) {
  var retour;

  req.logout();

  retour = {succes: true, succesMsg: 'Vous avez été déconnecté avec succès'};
  res.json(retour);
});

/* Page profil sites détails GET */
router.get('/remplacant/:id', verifRequete, statutConnexion, loggedIn, function(req, res) {
  var retour;
  var installeAnnonce = false;

  Remplacant.findOne({_id: req.params.id}, function(err1, remplacant1) {
    if(remplacant1) {
      Specialite.findOne({_id: remplacant1.specialite}, function(err2, specialite) {
        Admin.findOne({_id: req.user._id}, function(err3, admin) {
          Installe.findOne({_id: req.user._id}, function(err4, installe) {
            if(admin) {
              retour = {title: "Profil - Remplacant - Accès refusé", statutConnexion: res.locals.connecte, admin: true, installe: false, forbidden: true, notFound: false};
              res.json(retour);
            }

            else if(installe) {
              Reponse.find({idRemplacant: remplacant1._id}, function(err5, reponses) {
                for(var i = 0 ; i < reponses.length ; i++) {
                  for(var j = 0 ; j < installe.annonces.length ; j++) {
                    if(Object.is(String(installe.annonces[j]), String(reponses[i].idAnnonce))) {
                      installeAnnonce = true;
                      break;
                    }
                  }

                  if(installeAnnonce) {
                    break;
                  }
                }

                if(installeAnnonce) {
                  var membre = {
                    nom: remplacant1.nom,
                    prenom: remplacant1.prenom,
                    adresseMail: remplacant1.adresseMail,
                    adresseMembre: remplacant1.adresseMembre,
                    villeMembre: remplacant1.villeMembre,
                    codePostalMembre: remplacant1.codePostalMembre,
                    telMembre: remplacant1.telMembre,
                    photoMembre: remplacant1.photoMembre,
                    biographie: remplacant1.biographie
                  };

                  retour = {title: 'Profil - Remplacant - '+remplacant1.nom+" "+remplacant1.prenom, statutConnexion: res.locals.connecte, admin: false, installe: true, membre: membre, sites: installe.sites, specialite: specialite, forbidden: false, notFound: false};
                  res.json(retour);
                }

                else {
                  retour = {title: "Profil - Remplacant - Accès refusé", statutConnexion: res.locals.connecte, admin: false, installe: true, sites: installe.sites, forbidden: true, notFound: false};
                  res.json(retour);
                }
              });
            }

            else {
              Remplacant.findOne({_id: req.user._id}, function(err5, remplacant) {
                if(Object.is(String(remplacant._id), String(remplacant1._id))) {
                  var membre = {
                    nom: remplacant1.nom,
                    prenom: remplacant1.prenom,
                    adresseMail: remplacant1.adresseMail,
                    adresseMembre: remplacant1.adresseMembre,
                    villeMembre: remplacant1.villeMembre,
                    codePostalMembre: remplacant1.codePostalMembre,
                    telMembre: remplacant1.telMembre,
                    photoMembre: remplacant1.photoMembre,
                    biographie: remplacant1.biographie
                  };

                  retour = {title: "Profil - Remplacant - "+remplacant1.nom+" "+remplacant1.prenom, statutConnexion: res.locals.connecte, membre: membre, specialite: specialite, admin: false, installe: false, forbidden: false, notFound: false};
                  res.json(retour);
                }

                else {
                  retour = {title: "Profil - Remplacant - Accès refusé", statutConnexion: res.locals.connecte, admin: false, installe: false, forbidden: true, notFound: false};
                  res.json(retour);
                }
              });
            }
          });
        });
      });
    }

    else {
        Admin.findOne({_id: req.user._id}, function(err2, admin) {
            Installe.findOne({_id: req.user._id}, function (err3, installe) {
                Remplacant.findOne({_id: req.user._id}, function (err4, remplacant) {
                  if(admin) {
                      retour = {title: "Profil - Remplacant - Non trouvé", statutConnexion: res.locals.connecte, admin: true, installe: false, forbidden: false, notFound: true};
                      res.json(retour);
                  }

                  else if(installe) {
                      retour = {title: "Profil - Remplacant - Non trouvé", statutConnexion: res.locals.connecte, admin: false, installe: true, sites: installe.sites, forbidden: false, notFound: true};
                      res.json(retour);
                  }

                  else if(remplacant) {
                      retour = {title: "Profil - Remplacant - Non trouvé", statutConnexion: res.locals.connecte, admin: false, installe: false, forbidden: false, notFound: true};
                      res.json(retour);
                  }
                });
            });
        });
    }
  });
});

/* Page de vérification du compte GET */
router.get('/validation/:token', verifRequete, statutConnexion, notLoggedIn, function(req, res) {
  var retour;

  Installe.findOne({tokenValidation: req.params.token, expirationValidation: {$gt: Date.now()}}, function(err1, installe) {
    Remplacant.findOne({tokenValidation: req.params.token, expirationValidation: {$gt: Date.now()}}, function(err2, remplacant) {
      if(!installe && !remplacant) {
        retour = {title: 'Vérification du compte', error: true, statutConnexion: res.locals.connecte};
        res.json(retour);
      }

      else {
        if(installe) {
          if(req.headers.validation) {
              installe.active = true;
              installe.tokenValidation = undefined;
              installe.expirationValidation = undefined;

              envoiMail.envoiMailValidationCompte(installe);

              installe.save(function(err3, result1) {
                  var newAllInstalle = new AllInstalle({
                      _id: installe._id,
                      genre: installe.genre,
                      nom: installe.nom,
                      prenom: installe.prenom,
                      adresseMembre: installe.adresseMembre,
                      villeMembre: installe.villeMembre,
                      codePostalMembre: installe.codePostalMembre,
                      telMembre: installe.telMembre,
                      successeur: installe.successeur,
                      collaborateur: installe.collaborateur,
                      specialite: installe.specialite,
                      active: true
                  });

                  newAllInstalle.save(function(err4, result2) {
                    for(var i = 0 ; i < installe.sites.length ; i++) {
                        Site.findOne({_id: installe.sites[i]}, function(err5, site) {
                            var newAllSite = new AllSite({
                                _id: site._id,
                                nomSite: site.nomSite,
                                adresseSite: site.adresseSite,
                                villeSite: site.villeSite,
                                codePostalSite: site.codePostalSite,
                                coordonneesSite: site.coordonneesSite,
                                telSite: site.telSite,
                                horaires: site.horaires,
                                typeSite: site.typeSite,
                                descSite: site.descSite
                            });

                            newAllSite.save();
                        });
                    }

                    retour = {title : 'Vérification du compte', error: false, statutConnexion: res.locals.connecte};
                    res.json(retour);
                  });
              });
          }

          else {
              retour = {title : 'Vérification du compte', error: false, statutConnexion: res.locals.connecte};
              res.json(retour);
          }
        }

        if(remplacant) {
          if(req.headers.validation) {
              remplacant.active = true;
              remplacant.tokenValidation = undefined;
              remplacant.expirationValidation = undefined;

              envoiMail.envoiMailValidationCompte(remplacant);

              remplacant.save(function(err3, result) {
                  var newAllRemplacant = new AllRemplacant({
                      _id: remplacant._id,
                      genre: remplacant.genre,
                      nom: remplacant.nom,
                      prenom: remplacant.prenom,
                      adresseMembre: remplacant.adresseMembre,
                      villeMembre: remplacant.villeMembre,
                      codePostalMembre: remplacant.codePostalMembre,
                      telMembre: remplacant.telMembre,
                      specialite: remplacant.specialite,
                      active: true
                  });

                  newAllRemplacant.save(function(err4, result2) {
                      retour = {title : 'Vérification du compte', error: false, statutConnexion: res.locals.connecte};
                      res.json(retour);
                  });
              });
          }

          else {
              retour = {title : 'Vérification du compte', error: false, statutConnexion: res.locals.connecte};
              res.json(retour);
          }
        }
      }
    });
  });
});

/* Page contact GET */
router.get('/contact', verifRequete, statutConnexion, function(req, res) {
    var retour;

    if(req.isAuthenticated()) {
      Admin.findOne({_id: req.user._id}, function(err1, admin) {
        Installe.findOne({_id: req.user._id}, function(err2, installe) {
          Remplacant.findOne({_id: req.user._id}, function(err3, remplacant) {
            if(admin) {
              retour = {title: 'Nous contacter', statutConnexion: res.locals.connecte, admin: true, installe: false};
              res.json(retour);
            }

            else if(installe) {
              retour = {title: 'Nous contacter', statutConnexion: res.locals.connecte, admin: false, installe: true, nom: installe.nom, prenom: installe.prenom, mail: installe.adresseMail, sites: installe.sites};
              res.json(retour);
            }

            else if(remplacant) {
              retour = {title: 'Nous contacter', statutConnexion: res.locals.connecte, admin: false, installe: false, nom: remplacant.nom, prenom: remplacant.prenom, mail: remplacant.adresseMail};
              res.json(retour);
            }
          });
        });
      });
    }

    else {
      retour = {title: 'Nous contacter', statutConnexion: res.locals.connecte};
      res.json(retour);
    }
});

/* Page contact POST */
router.post('/contact', verifRequete, function(req, res) {
    var retour;
    var messages = [];

    var nom = req.body.nom;
    var prenom = req.body.prenom;
    var adresseMail = req.body.email;
    var message = req.body.message;
    var captcha = req.body.captcha;

    if(captcha === undefined) {
        messages.push("Vous n'avez pas validé le code captcha");
    }

    if(nom === undefined) {
        messages.push("Vous n'avez pas renseigné votre nom");
    }

    if(prenom === undefined) {
        messages.push("Vous n'avez pas renseigné votre prénom");
    }

    if(adresseMail === undefined) {
        messages.push("Vous n'avez pas renseigné votre adresse mail");
    }

    if(message === undefined) {
        messages.push("Vous n'avez pas renseigné de message");
    }

    req.checkBody({
        'nom': {
            matches: {
                options: /^[a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
                errorMessage: "Votre nom contient des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre nom est vide"
        },
        'prenom': {
            matches: {
                options: /^[a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
                errorMessage: "Votre prénom contient des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre prénom est vide"
        },
        'email': {
            matches: {
                options: /^[a-z0-9_-]+(.[a-z0-9_-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/,
                errorMessage: "Votre adresse mail n'est pas valide"
            },
            notEmpty: true,
            errorMessage: "Votre adresse mail est vide"
        },
        'message': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù.,;?!:@_()/'"\n ]{1,750}$/,
                errorMessage: "Le message contient des caractères non supportés (entre 1 et 750 caractères)"
            },
            notEmpty: true,
            errorMessage: "Votre message est vide"
        }
    });

    var errors = req.validationErrors();

    if(errors || messages.length !== 0) {
        if(errors) {
            errors.forEach(function(error) {
                messages.push(error.msg);
            });
        }

        retour = {succes: false, errors: messages};
        res.json(retour);
    }

    else {
        envoiMail.envoiMailContactDemandeur(nom, prenom, adresseMail, message);
        envoiMail.envoiMailContact1Rempla(nom, prenom, adresseMail, message);

        retour = {succes: true, succesMsg: "Votre message vient de nous être envoyé. Nous vous répondrons dès que possible"};
        res.json(retour);
    }
});

/* Page avis GET */
router.get('/votre-avis', verifRequete, statutConnexion, loggedIn, function(req, res) {
    var retour;

    Admin.findOne({_id: req.user._id}, function(err1, admin) {
        Installe.findOne({_id: req.user._id}, function(err2, installe) {
            Remplacant.findOne({_id: req.user._id}, function(err3, remplacant) {
                if(admin) {
                    retour = {title: 'Donnez votre avis', statutConnexion: res.locals.connecte, admin: true, installe: false};
                    res.json(retour);
                }

                else if(installe) {
                    retour = {title: 'Donnez votre avis', statutConnexion: res.locals.connecte, admin: false, installe: true, sites: installe.sites};
                    res.json(retour);
                }

                else if(remplacant) {
                    retour = {title: 'Donnez votre avis', statutConnexion: res.locals.connecte, admin: false, installe: false};
                    res.json(retour);
                }
            });
        });
    });
});

/* Page avis POST */
router.post('/votre-avis', verifRequete, function(req, res) {
    var retour;
    var messages = [];

    var note = req.body.rating;
    var commentaire = req.body.commentaire;
    var captcha = req.body.captcha;

    if(captcha === undefined) {
        messages.push("Vous n'avez pas validé le code captcha");
    }

    if(note === undefined) {
        messages.push("Vous n'avez pas renseigné de note");
    }

    if(commentaire === undefined) {
        messages.push("Vous n'avez pas renseigné de commentaire");
    }

    if(note < 0 || note > 5) {
        messages.push("La note doit être comprise entre 0 et 5");
    }

    req.checkBody({
        'commentaire': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù.,;?!:@_()/'"\n ]{1,750}$/,
                errorMessage: "Votre commentaire contient des caractères non supportés (entre 1 et 750 caractères)"
            },
            notEmpty: true,
            errorMessage: "Votre commentaire est vide"
        }
    });

    var errors = req.validationErrors();

    if(errors || messages.length !== 0) {
        if(errors) {
            errors.forEach(function(error) {
                messages.push(error.msg);
            });
        }

        retour = {succes: false, errors: messages};
        res.json(retour);
    }

    else {
        Installe.findOne({_id: req.user._id}, function(err1, installe) {
          Remplacant.findOne({_id: req.user._id}, function(err2, remplacant) {
            if(installe) {
                var newAvis = new Avis({
                    idInstalle: installe._id,
                    note: note,
                    commentaire: commentaire
                });

                newAvis.save(function(err3, resultat) {
                    //envoiMail.envoiMailAvis1REMPLA(installe._id, note, commentaire);

                    retour = {succes: true, succesMsg: "Votre avis nous a bien été transmis. Nous vous remercions et vous souhaitons un agréable moment sur 1REMPLA"};
                    res.json(retour);
                });
            }

            else if(remplacant) {
                var newAvis = new Avis({
                    idInstalle: remplacant._id,
                    note: note,
                    commentaire: commentaire
                });

                newAvis.save(function(err3, resultat) {
                    //envoiMail.envoiMailAvis1REMPLA(remplacant._id, note, commentaire);

                    retour = {succes: true, succesMsg: "Votre avis nous a bien été transmis. Nous vous remercions et vous souhaitons un agréable moment sur 1REMPLA"};
                    res.json(retour);
                });
            }

            else {
                retour = {succes: false, errors: ["Vous n'êtes pas autorisé à donner d'avis"]};
                res.json(retour);
            }
          });
        });
    }
});

module.exports = router;
