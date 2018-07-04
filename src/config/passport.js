var Installe = require('../models/installeModel');
var Remplacant = require('../models/remplacantModel');
var Admin = require('../models/adminModel');
var Site = require('../models/siteModel');
var envoiMail = require('../config/envoiMail');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var request = require('request');
var fs = require('fs');
var token = require('./token');

passport.serializeUser(function(membres, done) {
  done(null, membres.id);
});

passport.deserializeUser(function(id, done) {
  Installe.findById(id, function(err1, installe) {
    Remplacant.findById(id, function(err2, remplacant) {
      Admin.findById(id, function(err3, admin) {
        if(installe) {
          done(err1, installe);
        }

        else if(remplacant) {
          done(err2, remplacant);
        }

        else if(admin) {
          done(err3, admin);
        }
      });
    });
  });
});

// Installé - Remplaçant REGISTER
passport.use('local.register', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'motDePasse',
  passReqToCallback: true
},
function(req, username, password, done) {
  var messages = [];
  var type = req.body.type;
  var genre = req.body.membre.genre;
  //var numeroAdeli = req.body.membre.numeroAdeli;
  var nom = req.body.membre.nom;
  var prenom = req.body.membre.prenom;
  var email2 = req.body.membre.email2;
  var motDePasse2 = req.body.membre.motDePasse2;
  var adresseMembre = req.body.membre.adresseMembre;
  var villeMembre = req.body.membre.villeMembre;
  var codePostalMembre = req.body.membre.codePostalMembre;
  var telMembre = req.body.membre.telMembre;
  var specialite = req.body.membre.specialite;
  var captcha = req.body.membre.captcha;
  var cgu = req.body.membre.cgu;

  if(captcha === undefined) {
    messages.push("Vous n'avez pas validé le code captcha");

    return done(null, false, req.flash('error', messages));
  }

  if(cgu === undefined) {
    messages.push("Vous n'avez pas accepté les conditions générales d'utilisation");

    return done(null, false, req.flash('error', messages));
  }

  if(req.files.file != undefined) {
    var photo = "";

    for(var i = 0 ; i < req.files.file.length ; i++) {
      if(req.files.file[i].fieldName == "file[0]") {
        var photo = req.files.file[i];
      }
    }
  }

  else {
    var photo = "";
  }

  if(type == 'installe') {
    var successeur = req.body.membre.successeur;
    var collaborateur = req.body.membre.collaborateur;

    var nomSite1 = req.body.membre.nomSite1;
    var adresseSite1 = req.body.membre.adresseSite1;
    var villeSite1 = req.body.membre.villeSite1;
    var codePostalSite1 = req.body.membre.codePostalSite1;
    var coordonneesSite1 = req.body.membre.coordonneesSite1;
    var typeSite1 = req.body.membre.typeSite1;
    var telSite1 = req.body.membre.telSite1;
    var horairesSite1 = req.body.membre.horairesSite1;

    if(req.files.file != undefined) {
      var photoSite1 = "";

      for(var i = 0 ; i < req.files.file.length ; i++) {
        if(req.files.file[i].fieldName == "file[1]") {
          var photoSite1 = req.files.file[i];
        }
      }
    }

    else {
      var photoSite1 = "";
    }

    req.checkBody({
      // 'membre.numeroAdeli': {
      //   matches: {
      //     options: /^[0-9]{5,15}$/,
      //     errorMessage: 'Vous devez indiquer un numéro Adéli qui contient 5 à 15 chiffres'
      //   }
      // },
      'membre.nomSite1': {
        matches: {
          options: /^[a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,100}$/,
          errorMessage: "Le nom du premier lieu d'exercice est invalide"
        },
        notEmpty: true,
        errorMessage: "Le nom du premier lieu d'exercice est vide"
      },
      'membre.adresseSite1': {
        matches: {
          options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{0,100}$/,
          errorMessage: "L'adresse du premier lieu d'exercice est invalide"
        }
      },
      'membre.villeSite1': {
        matches: {
          options: /^[a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
          errorMessage: "La ville du premier lieu d'exercice est invalide"
        },
        notEmpty: true,
        errorMessage: "La ville du premier lieu d'exercice est vide"
      },
      'membre.codePostalSite1': {
        matches: {
          options: /^[0-9]{5}$/,
          errorMessage: "Le code postal du premier lieu d'exercice est invalide"
        },
        notEmpty: true,
        errorMessage: "Le code postal du premier lieu d'exercice est vide"
      },
      'membre.telSite1': {
        matches: {
          options: /^0[0-9]{9}$/,
          errorMessage: "Le numéro de téléphone du premier lieu d'exercice est invalide"
        },
        notEmpty: true,
        errorMessage: "Le numéro de téléphone du premier lieu d'exercice est vide"
      },
      'membre.horairesSite1': {
        matches: {
          options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù ]{0,48}$/,
          errorMessage: "Les horaires du premier lieu d'exercice sont invalides"
        }
      },
      'membre.typeSite1': {
        matches: {
          options: /[a-zA-Z ]{1,30}/,
          errorMessage: "Le type du premier lieu d'exercice est invalide"
        },
        notEmpty: true,
        errorMessage: "Le type du premier lieu d'exercice est vide"
      }
    });

    if(req.body.membre.nomSite2 != undefined) {
      var nomSite2  = req.body.membre.nomSite2;
      var adresseSite2 = req.body.membre.adresseSite2;
      var villeSite2 = req.body.membre.villeSite2;
      var codePostalSite2 = req.body.membre.codePostalSite2;
      var coordonneesSite2 = req.body.membre.coordonneesSite2;
      var typeSite2 = req.body.membre.typeSite2;
      var telSite2 = req.body.membre.telSite2;
      var horairesSite2 = req.body.membre.horairesSite2;

      if(req.files.file != undefined) {
        var photoSite2 = "";

        for(var i = 0 ; i < req.files.file.length ; i++) {
          if(req.files.file[i].fieldName == "file[2]") {
            var photoSite2 = req.files.file[i];
          }
        }
      }

      else {
        var photoSite2 = "";
      }

      req.checkBody({
        'membre.nomSite2': {
          matches: {
            options: /^[a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,100}$/,
            errorMessage: "Le nom du deuxième lieu d'exercice est invalide"
          },
          notEmpty: true,
          errorMessage: "Le nom du deuxième lieu d'exercice est vide"
        },
        'membre.adresseSite2': {
          matches: {
            options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{0,100}$/,
            errorMessage: "L'adresse du deuxième lieu d'exercice est invalide"
          }
        },
        'membre.villeSite2': {
          matches: {
            options: /^[a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
            errorMessage: "La ville du deuxième lieu d'exercice est invalide"
          },
          notEmpty: true,
          errorMessage: "La ville du deuxième lieu d'exercice est vide"
        },
        'membre.codePostalSite2': {
          matches: {
            options: /^[0-9]{5}$/,
            errorMessage: "Le code postal du deuxième lieu d'exercice est invalide"
          },
          notEmpty: true,
          errorMessage: "Le code postal du deuxième lieu d'exercice est vide"
        },
        'membre.telSite2': {
          matches: {
            options: /^0[0-9]{9}$/,
            errorMessage: "Le numéro de téléphone du deuxième lieu d'exercice est invalide"
          },
          notEmpty: true,
          errorMessage: "Le numéro de téléphone du deuxième lieu d'exercice est vide"
        },
        'membre.horairesSite2': {
          matches: {
            options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù ]{0,48}$/,
            errorMessage: "Les horaires du deuxième lieu d'exercice sont invalides"
          }
        },
        'membre.typeSite2': {
          matches: {
            options: /[a-zA-Z ]{1,30}/,
            errorMessage: "Le type du deuxième lieu d'exercice est invalide"
          },
          notEmpty: true,
          errorMessage: "Le type du deuxième lieu d'exercice est vide"
        }
      });

      if(req.body.membre.nomSite3 != undefined) {
        var nomSite3 = req.body.membre.nomSite3;
        var adresseSite3 = req.body.membre.adresseSite3;
        var villeSite3 = req.body.membre.villeSite3;
        var codePostalSite3 = req.body.membre.codePostalSite3;
        var coordonneesSite3 = req.body.membre.coordonneesSite3;
        var typeSite3 = req.body.membre.typeSite3;
        var telSite3 = req.body.membre.telSite3;
        var horairesSite3 = req.body.membre.horairesSite3;


        if(req.files.file != undefined) {
          var photoSite3 = "";

          for(var i = 0 ; i < req.files.file.length ; i++) {
            if(req.files.file[i].fieldName == "file[3]") {
              var photoSite3 = req.files.file[i];
            }
          }
        }

        else {
          var photoSite3 = "";
        }

        req.checkBody({
          'membre.nomSite3': {
            matches: {
              options: /^[a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,100}$/,
              errorMessage: "Le nom du troisième lieu d'exercice est invalide"
            },
            notEmpty: true,
            errorMessage: "Le nom du troisième lieu d'exercice est vide"
          },
          'membre.adresseSite3': {
            matches: {
              options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{0,100}$/,
              errorMessage: "L'adresse du troisième lieu d'exercice est invalide"
            }
          },
          'membre.villeSite3': {
            matches: {
              options: /^[a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
              errorMessage: "La ville du troisième lieu d'exercice est invalide"
            },
            notEmpty: true,
            errorMessage: "La ville du troisième lieu d'exercice est vide"
          },
          'membre.codePostalSite3': {
            matches: {
              options: /^[0-9]{5}$/,
              errorMessage: "Le code postal du troisième lieu d'exercice est invalide"
            },
            notEmpty: true,
            errorMessage: "Le code postal du troisième lieu d'exercice est vide"
          },
          'membre.telSite3': {
            matches: {
              options: /^0[0-9]{9}$/,
              errorMessage: "Le numéro de téléphone du troisième lieu d'exercice est invalide"
            },
            notEmpty: true,
            errorMessage: "Le numéro de téléphone du troisième lieu d'exercice est vide"
          },
          'membre.horairesSite3': {
            matches: {
              options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù ]{0,48}$/,
              errorMessage: "Les horaires du troisième lieu d'exercice sont invalides"
            }
          },
          'membre.typeSite3': {
            matches: {
              options: /[a-zA-Z ]{1,30}/,
              errorMessage: "Le type du troisième lieu d'exercice est invalide"
            },
            notEmpty: true,
            errorMessage: "Le type du troisième lieu d'exercice est vide"
          }
        });
      }
    }
  }

  //Vérification
  req.checkBody({
    'membre.genre': {
      matches: {
        options: /[a-zA-Z]{1,5}/,
        errorMessage: "Votre genre est invalide"
      },
      notEmpty: true,
      errorMessage: "Votre genre n'est pas renseigné"
    },
    'membre.nom': {
      matches: {
        options: /^[a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
        errorMessage: "Votre nom est invalide"
      },
      notEmpty: true,
      errorMessage: "Votre nom est vide"
    },
    'membre.prenom': {
      matches: {
        options: /^[a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
        errorMessage: "Votre prénom est invalide"
      },
      notEmpty: true,
      errorMessage: "Votre prénom est vide"
    },
    'membre.email': {
      matches: {
        options: /^[a-z0-9_-]+(.[a-z0-9_-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/,
        errorMessage: "Votre adresse mail est invalide"
      },
      notEmpty: true,
      errorMessage: "Votre adresse mail est vide"
    },
    'membre.email2': {
      equals: {
        options: req.body.membre.email,
        errorMessage: "L'adresse mail à confirmer n'est pas identique à l'adresse mail"
      },
      notEmpty: true,
      errorMessage: "L'adresse mail à confirmer est vide"
    },
    'membre.motDePasse': {
      isLength: {
        options: [{ min: 7, max: undefined }],
        errorMessage: 'Vous devez indiquer un mot de passe qui contient au moins 7 caractères'
      },
      matches: {
        options: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]/,
        errorMessage: "Vous devez indiquer un mot de passe contenant au moins une minuscule, une majuscule et un chiffre"
      },
      notEmpty: true,
      errorMessage: "Votre mot de passe est vide"
    },
    'membre.motDePasse2': {
      equals: {
        options: req.body.membre.motDePasse,
        errorMessage: "Vous devez indiquer un mot de passe identique"
      },
      notEmpty: true,
      errorMessage: "Le mot de passe à confirmer est vide"
    },
    'membre.adresseMembre': {
      matches: {
        options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{0,100}$/,
        errorMessage: "Votre adresse est invalide"
      }
    },
    'membre.villeMembre': {
      matches: {
        options: /^[a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
        errorMessage: "Votre ville est invalide"
      },
      notEmpty: true,
      errorMessage: "Votre ville est vide"
    },
    'membre.codePostalMembre': {
      matches: {
        options: /^[0-9]{5}$/,
        errorMessage: "Votre code postal est invalide"
      },
      notEmpty: true,
      errorMessage: "Votre code postal est vide"
    },
    'membre.telMembre': {
      matches: {
        options: /^0[0-9]{9}$/,
        errorMessage: "Votre numéro de téléphone est invalide"
      },
      notEmpty: true,
      errorMessage: "Votre numéro de téléphone est vide"
    },
    'membre.specialite': {
      matches: {
        options: /[a-zA-Z -]{1,31}/,
        errorMessage: "Votre spécialité est invalide"
      },
      notEmpty: true,
      errorMessage: "Votre spécialité est vide"
    }
  });

  var errors = req.validationErrors();

  if(errors) {
    errors.forEach(function(error) {
      messages.push(error.msg);
    });

    return done(null, false, req.flash('error', messages));
  }

  //Création d'un membre

  Installe.findOne({adresseMail: username}, function(err1, installe1) {
    Remplacant.findOne({adresseMail: username}, function(err2, remplacant1) {
      // Installe.findOne({_numeroAdeli: numeroAdeli}, function(err3, installe2) {
      //   Remplacant.findOne({_numeroAdeli: numeroAdeli}, function(err4, remplacant2) {
          if(err1 || err2) {
            var err = err1 + err2;
            return done(err);
          }

          if(installe1 || remplacant1) {
            return done(null, false, {message: 'L\'adresse mail est déjà utilisée'});
          }

          // if(installe2 || (remplacant2 && numeroAdeli != undefined) || (remplacant2 && numeroAdeli != null) || (remplacant2 && numeroAdeli != "")) {
          //   return done(null, false, {message: 'Le numéro Adeli est déjà utilisé'});
          // }

          if(type === "installe") {
            var siteTab = [];
            var newSite1, newSite2, newSite3;

            newSite1 = new Site({
              nomSite: nomSite1,
              adresseSite: adresseSite1,
              villeSite: villeSite1,
              codePostalSite: codePostalSite1,
              coordonneesSite: coordonneesSite1,
              telSite: telSite1,
              horaires: horairesSite1,
              typeSite: typeSite1,
              photos: []
            });

            siteTab.push(newSite1._id);

            if(nomSite2 != undefined) {
              newSite2 = new Site({
                nomSite: nomSite2,
                adresseSite: adresseSite2,
                villeSite: villeSite2,
                codePostalSite: codePostalSite2,
                coordonneesSite: coordonneesSite2,
                telSite: telSite2,
                horaires: horairesSite2,
                typeSite: typeSite2,
                photos: []
              });

              siteTab.push(newSite2._id);

              if(nomSite3 != undefined) {
                newSite3 = new Site({
                  nomSite: nomSite3,
                  adresseSite: adresseSite3,
                  villeSite: villeSite3,
                  codePostalSite: codePostalSite3,
                  coordonneesSite: coordonneesSite3,
                  telSite: telSite3,
                  horaires: horairesSite3,
                  typeSite: typeSite3,
                  photos: []
                });

                siteTab.push(newSite3._id);
              }
            }

            var newInstalle = new Installe({
              //_numeroAdeli: numeroAdeli,
              genre: genre,
              nom: nom,
              prenom: prenom,
              adresseMail: username,
              motDePasse: password,
              adresseMembre: adresseMembre,
              villeMembre: villeMembre,
              codePostalMembre: codePostalMembre,
              telMembre: telMembre,
              photoMembre: '',
              successeur: successeur,
              collaborateur: collaborateur,
              specialite: specialite,
              sites: siteTab,
              active: false,
              tokenValidation: token.initialisation(),
              expirationValidation: Date.now()+4*3600000 //4 hours
            });

            newInstalle.motDePasse = newInstalle.encryptPassword(password);

            newInstalle.save(function(err5, resultat) {
              if(err5) {
                return done(err5);
              }

              var dirUser = __dirname+'/../public/uploads/'+newInstalle._id;
              var dirSiteUser = __dirname+'/../public/uploads/'+newInstalle._id+'/sites';

              if (!fs.existsSync(dirUser)) {
                fs.mkdirSync(dirUser);
                fs.mkdirSync(dirSiteUser);

                newSite1.save(function(err6, resultat) {
                  if(err6) {
                    return done(err6);
                  }

                  var dirSiteUserId1 = __dirname+'/../public/uploads/'+newInstalle._id+'/sites/'+newSite1._id;
                  fs.mkdirSync(dirSiteUserId1);

                  if(photoSite1 != '') {
                    var tabPathPhotoSite1 = photoSite1.path.split("/");

                    var pathPhotoSite1 = dirSiteUserId1+'/'+tabPathPhotoSite1[tabPathPhotoSite1.length-1];

                    fs.readFile(photoSite1.path, function(err7, data) {
                      fs.writeFile(pathPhotoSite1, data, 'binary', function (err8) {
                          if(fs.existsSync(photoSite1.path)) {
                            fs.unlinkSync(photoSite1.path);
                          }
                      });
                    });

                    newSite1.update({$push: {photos: '/uploads/'+newInstalle._id+'/sites/'+newSite1._id+"/"+tabPathPhotoSite1[tabPathPhotoSite1.length-1]}}).exec();
                  }
                });

                if(siteTab.length === 2) {
                  newSite2.save(function(err9, resultat) {
                    if(err9) {
                      return done(err9);
                    }

                    var dirSiteUserId2 = __dirname+'/../public/uploads/'+newInstalle._id+'/sites/'+newSite2._id;
                    fs.mkdirSync(dirSiteUserId2);

                    if(photoSite2 != '') {
                      var tabPathPhotoSite2 = photoSite2.path.split("/");

                      var pathPhotoSite2 = dirSiteUserId2+'/'+tabPathPhotoSite2[tabPathPhotoSite2.length-1];

                      fs.readFile(photoSite2.path, function(err10, data) {
                        fs.writeFile(pathPhotoSite2, data, 'binary', function (err11) {
                          if(fs.existsSync(photoSite2.path)) {
                            fs.unlinkSync(photoSite2.path);
                          }
                        });
                      });

                      newSite2.update({$push: {photos: '/uploads/'+newInstalle._id+'/sites/'+newSite2._id+'/'+tabPathPhotoSite2[tabPathPhotoSite2.length-1]}}).exec();
                    }
                  });
                }

                else if(siteTab.length === 3) {
                  newSite2.save(function(err9, resultat) {
                    if(err9) {
                      return done(err9);
                    }

                    var dirSiteUserId2 = __dirname+'/../public/uploads/'+newInstalle._id+'/sites/'+newSite2._id;
                    fs.mkdirSync(dirSiteUserId2);

                    if(photoSite2 != '') {
                      var tabPathPhotoSite2 = photoSite2.path.split("/");

                      var pathPhotoSite2 = dirSiteUserId2+'/'+tabPathPhotoSite2[tabPathPhotoSite2.length-1];

                      fs.readFile(photoSite2.path, function(err10, data) {
                        fs.writeFile(pathPhotoSite2, data, 'binary', function (err11) {
                          if(fs.existsSync(photoSite2.path)) {
                            fs.unlinkSync(photoSite2.path);
                          }
                        });
                      });

                      newSite2.update({$push: {photos: '/uploads/'+newInstalle._id+'/sites/'+newSite2._id+'/'+tabPathPhotoSite2[tabPathPhotoSite2.length-1]}}).exec();
                    }
                  });

                  newSite3.save(function(err12, resultat) {
                    if(err12) {
                      return done(err12);
                    }

                    var dirSiteUserId3 = __dirname+'/../public/uploads/'+newInstalle._id+'/sites/'+newSite3._id;
                    fs.mkdirSync(dirSiteUserId3);

                    if(photoSite3 != '') {
                      var tabPathPhotoSite3 = photoSite3.path.split("/");

                      var pathPhotoSite3 = dirSiteUserId3+'/'+tabPathPhotoSite3[tabPathPhotoSite3.length-1];

                      fs.readFile(photoSite3.path, function(err13, data) {
                        fs.writeFile(pathPhotoSite3, data, 'binary', function (err14) {
                          if(fs.existsSync(photoSite3.path)) {
                            fs.unlinkSync(photoSite3.path);
                          }
                        });
                      });

                      newSite3.update({$set: {photos: '/uploads/'+newInstalle._id+'/sites/'+newSite3._id+'/'+tabPathPhotoSite3[tabPathPhotoSite3.length-1]}}).exec();
                    }
                  });
                }
              }

              if(photo != '') {
                var tabPathPhoto = photo.path.split("/");

                var pathPhoto = dirUser+'/'+tabPathPhoto[tabPathPhoto.length-1];

                fs.readFile(photo.path, function(err13, data) {
                  fs.writeFile(pathPhoto, data, 'binary', function (err14) {
                    if(fs.existsSync(photo.path)) {
                      fs.unlinkSync(photo.path);
                    }
                  });
                });

                newInstalle.update({$set: {photoMembre: '/uploads/'+newInstalle._id+'/'+tabPathPhoto[tabPathPhoto.length-1]}}).exec();
              }

              envoiMail.envoiMailCreationCompte(newInstalle);

              return done(null, newInstalle);
            });
          }

          else if(type === 'remplacant') {
            var newRemplacant = new Remplacant({
              //_numeroAdeli: numeroAdeli,
              genre: genre,
              nom: nom,
              prenom: prenom,
              adresseMail: username,
              motDePasse: password,
              adresseMembre: adresseMembre,
              villeMembre: villeMembre,
              codePostalMembre: codePostalMembre,
              telMembre: telMembre,
              photoMembre: '',
              specialite: specialite,
              reponses: [],
              active: false,
              tokenValidation: token.initialisation(),
              expirationValidation: Date.now()+4*3600000 //4 hours
            });

            newRemplacant.motDePasse = newRemplacant.encryptPassword(password);

            newRemplacant.save(function(err5, resultat) {
              if(err5) {
                return done(err5);
              }

              var dirUser = __dirname+'/../public/uploads/'+newRemplacant._id;

              if (!fs.existsSync(dirUser)) {
                fs.mkdirSync(dirUser);
              }

              if(photo != '') {
                var tabPathPhoto = photo.path.split("/");

                var pathPhoto = dirUser+'/'+tabPathPhoto[tabPathPhoto.length-1];

                fs.readFile(photo.path, function(err4, data) {
                  fs.writeFile(pathPhoto, data, 'binary', function (err5) {
                    if(fs.existsSync(photo.path)) {
                      fs.unlinkSync(photo.path);
                    }
                  });
                });

                newRemplacant.update({$set: {photoMembre: '/uploads/'+newRemplacant._id+'/'+tabPathPhoto[tabPathPhoto.length-1]}}).exec();
              }

              envoiMail.envoiMailCreationCompte(newRemplacant);

              return done(null, newRemplacant);
            });
          }
        //});
      //});
     });
   });
}));

//Installé - Remplaçant LOGIN
passport.use('local.login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'motDePasse',
  passReqToCallback: true
},
function(req, username, password, done) {
  req.checkBody({
      'email': {
        matches: {
            options: /^[a-z0-9_-]+(.[a-z0-9_-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/,
            errorMessage: "L'adresse mail est invalide"
        },
        notEmpty: true,
        errorMessage: "L'adresse mail est vide"
      }
  });

  var errors = req.validationErrors();

  if(errors) {
    var messages = [];

    errors.forEach(function(error) {
      messages.push(error.msg);
    });

    return done(null, false, req.flash('error', messages));
  }

  else {
    Installe.findOne({adresseMail: username}, function(err1, installe) {
      Remplacant.findOne({adresseMail: username}, function(err2, remplacant) {
        if(err1 || err2) {
          var err = err1 + err2;
          return done(err);
        }

        if(!installe && !remplacant) {
          return done(null, false, {message: 'Adresse mail ou mot de passe invalide'});
        }

        if(installe) {
          if(!installe.verifPassword(password)) {
            return done(null, false, {message: 'Adresse mail ou mot de passe invalide'});
          }

          if(!installe.active && installe.active !== undefined) {
            return done(null, false, {message: 'Vous n\'avez pas encore validé votre adresse mail'});
          }

          return done(null, installe);
        }

        if(remplacant) {
          if(!remplacant.verifPassword(password)) {
            return done(null, false, {message: 'Adresse mail ou mot de passe invalide'});
          }

          if(!remplacant.active && remplacant.active !== undefined) {
            return done(null, false, {message: 'Vous n\'avez pas encore validé votre adresse mail'});
          }

          return done(null, remplacant);
        }
      });
    });
  }
}));

//Admin LOGIN
passport.use('local.admin', new LocalStrategy({
  usernameField: 'identifiant',
  passwordField: 'motDePasse',
  passReqToCallback: true
},
function(req, username, password, done) {
  var captcha = req.body['g-recaptcha-response'];

  if(captcha === '' || captcha === undefined || captcha == 'null' || captcha === null) {
      return done(null, false, {message: "Vous n'avez pas validé le captcha"});
  }

  else {
      Admin.findOne({identifiant: username}, function(err, admin) {
          if(err) {
              return done(err);
          }

          if(!admin) {
              done(null, false, {message: 'Erreur d\'authentification'});
          }

          if(admin) {
              if(!admin.verifPassword(password)) {
                  return done(null, false, {message: 'Erreur d\'authentification'});
              }

              return done(null, admin);
          }
      });
  }
}));
