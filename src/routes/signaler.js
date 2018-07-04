var express = require('express');
var router = express.Router();

var Admin = require('../models/adminModel');
var Installe = require('../models/installeModel');
var Remplacant = require('../models/remplacantModel');
var Annonce = require('../models/annonceModel');
var Reponse = require('../models/reponseModel');
var Site = require('../models/siteModel');
var Specialite = require('../models/specialiteModel');
var envoiMail = require('../config/envoiMail');
var verifRequete = require('../config/verifRequete');
var statutConnexion = require('../config/statutConnexion');

router.get('/annonce/:id', verifRequete, statutConnexion, function(req, res) {
    var retour;

    Annonce.findOne({_id: req.params.id}, function(err1, annonce) {
        if(req.isAuthenticated()) {
            Installe.findOne({_id: req.user._id}, function(err2, installe) {
                Remplacant.findOne({_id: req.user._id}, function(err3, remplacant) {
                    Admin.findOne({_id: req.user._id}, function(err4, admin) {
                        if(admin) {
                            retour = {title: "Signalement d'annonce", installe: false, admin: true, statutConnexion: res.locals.connecte, notFound: true};
                            res.json(retour);
                        }

                        else if(installe) {
                            if(err1) {
                                retour = {title: "Signalement d'annonce", installe: true, admin: false, statutConnexion: res.locals.connecte, sites: installe.sites, notFound: true};
                                res.json(retour);
                            }

                            else if(annonce) {
                                Specialite.findOne({_id: installe.specialite}, function(err5, specialite) {
                                    var retourMembre = {
                                        nom: installe.nom,
                                        prenom: installe.prenom,
                                        adresseMembre: installe.adresseMembre,
                                        villeMembre: installe.villeMembre,
                                        codePostalMembre: installe.codePostalMembre
                                    };

                                    retour = {title: "Signalement d'annonce", installe: true, admin: false, statutConnexion: res.locals.connecte, notFound: false, membre: retourMembre, sites: installe.sites, specialite: specialite, nationalites: require('../config/nationalites.json')};
                                    res.json(retour);
                                });
                            }

                            else {
                                retour = {title: "Signalement d'annonce", installe: true, admin: false, statutConnexion: res.locals.connecte, sites: installe.sites, notFound: true};
                                res.json(retour);
                            }
                        }

                        else if(remplacant) {
                            if(err1) {
                                retour = {title: "Signalement d'annonce", installe: false, admin: false, statutConnexion: res.locals.connecte, notFound: true};
                                res.json(retour);
                            }

                            else if(annonce) {
                                Specialite.findOne({_id: remplacant.specialite}, function(err5, specialite) {
                                    var retourMembre = {
                                        nom: remplacant.nom,
                                        prenom: remplacant.prenom,
                                        adresseMembre: remplacant.adresseMembre,
                                        villeMembre: remplacant.villeMembre,
                                        codePostalMembre: remplacant.codePostalMembre
                                    };

                                    retour = {title: "Signalement d'annonce", installe: false, admin: false, statutConnexion: res.locals.connecte, notFound: false, membre: retourMembre, specialite: specialite, nationalites: require('../config/nationalites.json')};
                                    res.json(retour);
                                });
                            }

                            else {
                                retour = {title: "Signalement d'annonce", installe: false, admin: false, statutConnexion: res.locals.connecte, notFound: true};
                                res.json(retour);
                            }
                        }
                    });
                });
            });
        }

        else {
            if(err1) {
                retour = {title: "Signalement d'annonce", statutConnexion: res.locals.connecte, notFound: true};
                res.json(retour);
            }

            else if(annonce) {
                retour = {title: "Signalement d'annonce", statutConnexion: res.locals.connecte, notFound: false, nationalites: require('../config/nationalites.json')};
                res.json(retour);
            }

            else {
                retour = {title: "Signalement d'annonce", statutConnexion: res.locals.connecte, notFound: true};
                res.json(retour);
            }
        }
    });
});

router.post('/annonce/:id', verifRequete, function(req, res) {
    var retour;
    var messages = [];

    var id = req.params.id;
    var raison = req.body.raison;
    var precision = req.body.precision;
    var infosSupp = req.body.infosSupp;
    var captcha = req.body.captcha;
    var nomSignaleur = req.body.nomSignaleur;
    var prenomSignaleur = req.body.prenomSignaleur;
    var professionSignaleur = req.body.professionSignaleur;
    var adresseSignaleur = req.body.adresseSignaleur;
    var villeSignaleur = req.body.villeSignaleur;
    var codePostalSignaleur = req.body.codePostalSignaleur;
    var nationaliteSignaleur = req.body.nationaliteSignaleur;
    var dateNaissanceSignaleur = req.body.dateNaissanceSignaleur;
    var villeNaissanceSignaleur = req.body.villeNaissanceSignaleur;
    var codePostalNaissanceSignaleur = req.body.codePostalNaissanceSignaleur;

    if(captcha === undefined) {
        messages.push("Vous n'avez pas validé le code captcha");
    }

    if(raison != 'L\'annonce contient des informations érronées' && raison != 'Autre') {
        messages.push("La raison n'est pas valide");
    }

    if(raison == 'Autre') {
        if(precision === undefined) {
            messages.push("La précision de la raison est vide");
        }

        else {
            req.checkBody({
                'precision': {
                    matches: {
                        options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù.,;?!:@_()/'"\n ]{1,750}$/,
                        errorMessage: "La précision contient des caractères non supportés (entre 1 et 750 caractères)"
                    }
                }
            });
        }
    }

    if(infosSupp !== undefined) {
        req.checkBody({
            'infosSupp': {
                matches: {
                    options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù.,;?!:@_()/'"\n ]{0,750}$/,
                    errorMessage: "Les informations supplémentaires contiennent des caractères non supportés (entre 0 et 750 caractères)"
                }
            }
        });
    }

    req.checkBody({
        'nomSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
                errorMessage: "Votre nom comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre nom est vide"
        },
        'prenomSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
                errorMessage: "Votre prénom comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre prénom est vide"
        },
        'professionSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù'/ ]{1,48}$/,
                errorMessage: "Votre profession comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre profession est vide"
        },
        'adresseSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,100}$/,
                errorMessage: "Votre adresse comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre adresse est vide"
        },
        'villeSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
                errorMessage: "Votre ville comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre ville est vide"
        },
        'codePostalSignaleur': {
            matches: {
                options: /^[0-9]{5}$/,
                errorMessage: "Votre code postal est invalide"
            },
            notEmpty: true,
            errorMessage: "Votre code postal est vide"
        },
        'nationaliteSignaleur': {
            notEmpty: true,
            errorMessage: "Votre nationalité n'a pas été sélectionnée"
        },
        'dateNaissanceSignaleur': {
            isDate: true,
            errorMessage: "Votre date de naissance n'est pas au bon format"
        },
        'villeNaissanceSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
                errorMessage: "Votre ville de naissance comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre ville  de naissanceest vide"
        },
        'codePostalNaissanceSignaleur': {
            matches: {
                options: /^[0-9]{5}$/,
                errorMessage: "Votre code postal de ville de naissance est invalide"
            },
            notEmpty: true,
            errorMessage: "Votre code postal de ville de naissance est vide"
        },
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
        var dateNaissanceSignaleurD = new Date(dateNaissanceSignaleur);

        var signaleur = {
            nom: nomSignaleur,
            prenom: prenomSignaleur,
            profession: professionSignaleur,
            adresse: adresseSignaleur,
            ville: villeSignaleur,
            codePostal: codePostalSignaleur,
            nationalite: nationaliteSignaleur,
            dateNaissance: dateNaissanceSignaleurD.getDate()+"/"+dateNaissanceSignaleurD.getMonth()+"/"+dateNaissanceSignaleurD.getFullYear(),
            villeNaissance: villeNaissanceSignaleur,
            codePostalNaissance: codePostalNaissanceSignaleur
        };

        Annonce.findOne({_id: id}, function(err1, annonce) {
            if(annonce) {
                if(annonce.idInstalle !== undefined) {
                    Installe.findOne({_id: annonce.idInstalle}, function(err2, installe) {
                        if(installe) {
                            envoiMail.envoiMailSignalisationMembreAnnonce(installe, id, raison, precision, infosSupp);
                            envoiMail.envoiMailSignalisationAnnonce1Rempla(id, raison, precision, infosSupp, signaleur);

                            retour = {succes: true, succesMsg: "L'annonce a été signalée. Nous allons être notifié et prendrons les mesures nécessaires si nous jugeont votre signalisation pertinente"};
                            res.json(retour);
                        }

                        else {
                            retour = {succes: false, errors: ["Installé non trouvé"]};
                            res.json(retour);
                        }

                    });
                }

                else if(annonce.idRemplacant !== undefined) {
                    Remplacant.findOne({_id: annonce.idRemplacant}, function(err2, remplacant) {
                        if(remplacant) {
                            envoiMail.envoiMailSignalisationMembreAnnonce(remplacant, id, raison, precision, infosSupp);
                            envoiMail.envoiMailSignalisationAnnonce1Rempla(id, raison, precision, infosSupp, signaleur);

                            retour = {succes: true, succesMsg: "L'annonce a été signalée. Nous allons être notifié et prendrons les mesures nécessaires si nous jugeont votre signalisation pertinente"};
                            res.json(retour);
                        }

                        else {
                            retour = {succes: false, errors: ["Remplaçant non trouvé"]};
                            res.json(retour);
                        }
                    });
                }
            }

            else {
                retour = {succes: false, errors: ["Annonce non trouvée"]};
                res.json(retour);
            }
        });
    }
});

router.get('/membre/:id', verifRequete, statutConnexion, function(req, res) {
    var retour;

    Installe.findOne({_id: req.params.id}, function(err1, installeMembre) {
        Remplacant.findOne({_id: req.params.id}, function(err2, remplacantMembre) {
            if(req.isAuthenticated()) {
                Installe.findOne({_id: req.user._id}, function(err3, installe) {
                    Remplacant.findOne({_id: req.user._id}, function(err4, remplacant) {
                        Admin.findOne({_id: req.user._id}, function(err5, admin) {
                            if(admin) {
                                retour = {title: "Signalement de membre", installe: false, admin: true, statutConnexion: res.locals.connecte, notFound: true};
                                res.json(retour);
                            }

                            else if(installe) {
                                if(err1 || err2) {
                                    retour = {title: "Signalement de membre", installe: true, admin: false, statutConnexion: res.locals.connecte, sites: installe.sites, notFound: true};
                                    res.json(retour);
                                }

                                else if(installeMembre) {
                                    Specialite.findOne({_id: installe.specialite}, function(err6, specialite) {
                                        var retourMembre = {
                                            nom: installe.nom,
                                            prenom: installe.prenom,
                                            adresseMembre: installe.adresseMembre,
                                            villeMembre: installe.villeMembre,
                                            codePostalMembre: installe.codePostalMembre
                                        };

                                        retour = {title: "Signalement de membre", installe: true, admin: false, statutConnexion: res.locals.connecte, notFound: false, membre: retourMembre, sites: installe.sites, specialite: specialite, nationalites: require('../config/nationalites.json')};
                                        res.json(retour);
                                    });
                                }

                                else if(remplacantMembre) {
                                    Specialite.findOne({_id: installe.specialite}, function(err6, specialite) {
                                        var retourMembre = {
                                            nom: installe.nom,
                                            prenom: installe.prenom,
                                            adresseMembre: installe.adresseMembre,
                                            villeMembre: installe.villeMembre,
                                            codePostalMembre: installe.codePostalMembre
                                        };

                                        retour = {title: "Signalement de membre", installe: true, admin: false, statutConnexion: res.locals.connecte, notFound: false, membre: retourMembre, sites: installe.sites, specialite: specialite, nationalites: require('../config/nationalites.json')};
                                        res.json(retour);
                                    });
                                }

                                else {
                                    retour = {title: "Signalement de membre", installe: true, admin: false, statutConnexion: res.locals.connecte, sites: installe.sites, notFound: true};
                                    res.json(retour);
                                }
                            }

                            else if(remplacant) {
                                if(err1) {
                                    retour = {title: "Signalement de membre", installe: false, admin: false, statutConnexion: res.locals.connecte, notFound: true};
                                    res.json(retour);
                                }

                                else if(installeMembre) {
                                    Specialite.findOne({_id: remplacant.specialite}, function(err6, specialite) {
                                        var retourMembre = {
                                            nom: remplacant.nom,
                                            prenom: remplacant.prenom,
                                            adresseMembre: remplacant.adresseMembre,
                                            villeMembre: remplacant.villeMembre,
                                            codePostalMembre: remplacant.codePostalMembre
                                        };

                                        retour = {title: "Signalement de membre", installe: false, admin: false, statutConnexion: res.locals.connecte, notFound: false, membre: retourMembre, specialite: specialite, nationalites: require('../config/nationalites.json')};
                                        res.json(retour);
                                    });
                                }

                                else if(remplacantMembre) {
                                    Specialite.findOne({_id: remplacant.specialite}, function(err6, specialite) {
                                        var retourMembre = {
                                            nom: remplacant.nom,
                                            prenom: remplacant.prenom,
                                            adresseMembre: remplacant.adresseMembre,
                                            villeMembre: remplacant.villeMembre,
                                            codePostalMembre: remplacant.codePostalMembre
                                        };

                                        retour = {title: "Signalement de membre", installe: false, admin: false, statutConnexion: res.locals.connecte, notFound: false, membre: retourMembre, specialite: specialite, nationalites: require('../config/nationalites.json')};
                                        res.json(retour);
                                    });
                                }

                                else {
                                    retour = {title: "Signalement de membre", installe: false, admin: false, statutConnexion: res.locals.connecte, notFound: true};
                                    res.json(retour);
                                }
                            }
                        });
                    });
                });
            }

            else {
                if(err1) {
                    retour = {title: "Signalement de membre", statutConnexion: res.locals.connecte, notFound: true};
                    res.json(retour);
                }

                else if(installeMembre) {
                    retour = {title: "Signalement de membre", statutConnexion: res.locals.connecte, notFound: false, nationalites: require('../config/nationalites.json')};
                    res.json(retour);
                }

                else if(remplacantMembre) {
                    retour = {title: "Signalement de membre", statutConnexion: res.locals.connecte, notFound: false, nationalites: require('../config/nationalites.json')};
                    res.json(retour);
                }

                else {
                    retour = {title: "Signalement de membre", statutConnexion: res.locals.connecte, notFound: true};
                    res.json(retour);
                }
            }
        });
    });
});

router.post('/membre/:id', verifRequete, function(req, res) {
    var retour;
    var messages = [];

    var id = req.params.id;
    var raison = req.body.raison;
    var precision = req.body.precision;
    var infosSupp = req.body.infosSupp;
    var captcha = req.body.captcha;
    var nomSignaleur = req.body.nomSignaleur;
    var prenomSignaleur = req.body.prenomSignaleur;
    var professionSignaleur = req.body.professionSignaleur;
    var adresseSignaleur = req.body.adresseSignaleur;
    var villeSignaleur = req.body.villeSignaleur;
    var codePostalSignaleur = req.body.codePostalSignaleur;
    var nationaliteSignaleur = req.body.nationaliteSignaleur;
    var dateNaissanceSignaleur = req.body.dateNaissanceSignaleur;
    var villeNaissanceSignaleur = req.body.villeNaissanceSignaleur;
    var codePostalNaissanceSignaleur = req.body.codePostalNaissanceSignaleur;

    if(captcha === undefined) {
        messages.push("Vous n'avez pas validé le code captcha");
    }

    if(raison != 'La photo du membre est inappropriée' && raison != "La biographie du membre est inappropriée" && raison != "Ce membre n'arrête pas de m'envoyer des messages" && raison != 'Autre') {
        messages.push("La raison n'est pas valide");
    }

    if(raison == 'Autre') {
        if(precision === undefined) {
            messages.push("La précision de la raison est vide");
        }

        else {
            req.checkBody({
                'precision': {
                    matches: {
                        options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù.,;?!:@_()/'"\n ]{1,750}$/,
                        errorMessage: "La précision contient des caractères non supportés (entre 1 et 750 caractères)"
                    }
                }
            });
        }
    }

    if(infosSupp !== undefined) {
        req.checkBody({
            'infosSupp': {
                matches: {
                    options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù.,;?!:@_()/'"\n ]{0,750}$/,
                    errorMessage: "Les informations supplémentaires contiennent des caractères non supportés (entre 0 et 750 caractères)"
                }
            }
        });
    }

    req.checkBody({
        'nomSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
                errorMessage: "Votre nom comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre nom est vide"
        },
        'prenomSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
                errorMessage: "Votre prénom comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre prénom est vide"
        },
        'professionSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù'/ ]{1,48}$/,
                errorMessage: "Votre profession comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre profession est vide"
        },
        'adresseSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,100}$/,
                errorMessage: "Votre adresse comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre adresse est vide"
        },
        'villeSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
                errorMessage: "Votre ville comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre ville est vide"
        },
        'codePostalSignaleur': {
            matches: {
                options: /^[0-9]{5}$/,
                errorMessage: "Votre code postal est invalide"
            },
            notEmpty: true,
            errorMessage: "Votre code postal est vide"
        },
        'nationaliteSignaleur': {
            notEmpty: true,
            errorMessage: "Votre nationalité n'a pas été sélectionnée"
        },
        'dateNaissanceSignaleur': {
            isDate: true,
            errorMessage: "Votre date de naissance n'est pas au bon format"
        },
        'villeNaissanceSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
                errorMessage: "Votre ville de naissance comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre ville  de naissanceest vide"
        },
        'codePostalNaissanceSignaleur': {
            matches: {
                options: /^[0-9]{5}$/,
                errorMessage: "Votre code postal de ville de naissance est invalide"
            },
            notEmpty: true,
            errorMessage: "Votre code postal de ville de naissance est vide"
        },
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
        var dateNaissanceSignaleurD = new Date(dateNaissanceSignaleur);

        var signaleur = {
            nom: nomSignaleur,
            prenom: prenomSignaleur,
            profession: professionSignaleur,
            adresse: adresseSignaleur,
            ville: villeSignaleur,
            codePostal: codePostalSignaleur,
            nationalite: nationaliteSignaleur,
            dateNaissance: dateNaissanceSignaleurD.getDate()+"/"+dateNaissanceSignaleurD.getMonth()+"/"+dateNaissanceSignaleurD.getFullYear(),
            villeNaissance: villeNaissanceSignaleur,
            codePostalNaissance: codePostalNaissanceSignaleur
        };

        Installe.findOne({_id: id}, function(err1, installe) {
            Remplacant.findOne({_id: id}, function(err2, remplacant) {
                if(installe) {
                    envoiMail.envoiMailSignalisationMembreMembre(installe, raison, precision, infosSupp);
                    envoiMail.envoiMailSignalisationMembre1Rempla(id, raison, precision, infosSupp, signaleur);

                    retour = {succes: true, succesMsg: "Le membre a été signalé. Nous allons être notifié et prendrons les mesures nécessaires si nous jugeont votre signalisation pertinente"};
                    res.json(retour);
                }

                else if(remplacant) {
                    envoiMail.envoiMailSignalisationMembreMembre(remplacant, raison, precision, infosSupp);
                    envoiMail.envoiMailSignalisationMembre1Rempla(id, raison, precision, infosSupp, signaleur);

                    retour = {succes: true, succesMsg: "Le membre a été signalé. Nous allons être notifié et prendrons les mesures nécessaires si nous jugeont votre signalisation pertinente"};
                    res.json(retour);
                }

                else {
                    retour = {succes: false, errors: ["Membre non trouvé"]};
                    res.json(retour);
                }
            });
        });
    }
});

router.get('/reponse/:id', verifRequete, statutConnexion, function(req, res) {
    var retour;

    var reponseInstalle = false;

    Reponse.findOne({_id: req.params.id}, function(err1, reponse) {
        if(req.isAuthenticated()) {
            Installe.findOne({_id: req.user._id}, function(err2, installe) {
                Remplacant.findOne({_id: req.user._id}, function(err3, remplacant) {
                    Admin.findOne({_id: req.user._id}, function(err4, admin) {
                        if(admin) {
                            retour = {title: "Signalement de réponse", installe: false, admin: true, statutConnexion: res.locals.connecte, notFound: true};
                            res.json(retour);
                        }

                        else if(installe) {
                            if(err1) {
                                retour = {title: "Signalement de réponse", installe: true, admin: false, statutConnexion: res.locals.connecte, sites: installe.sites, notFound: true};
                                res.json(retour);
                            }

                            else if(reponse) {
                                for(var i = 0 ; i < installe.annonces.length ; i++) {
                                    if(Object.is(String(installe.annonces[i]), String(reponse.idAnnonce))) {
                                        reponseInstalle = true;
                                        break;
                                    }
                                }

                                if(reponseInstalle) {
                                    Specialite.findOne({_id: installe.specialite}, function(err5, specialite) {
                                        var retourMembre = {
                                            nom: installe.nom,
                                            prenom: installe.prenom,
                                            adresseMembre: installe.adresseMembre,
                                            villeMembre: installe.villeMembre,
                                            codePostalMembre: installe.codePostalMembre
                                        };

                                        retour = {title: "Signalement de réponse", installe: true, admin: false, statutConnexion: res.locals.connecte, notFound: false, membre: retourMembre, sites: installe.sites, specialite: specialite, nationalites: require('../config/nationalites.json')};
                                        res.json(retour);
                                    });
                                }

                                else {
                                    retour = {title: "Signalement de réponse", installe: true, admin: false, statutConnexion: res.locals.connecte, sites: installe.sites, notFound: true};
                                    res.json(retour);
                                }
                            }

                            else {
                                retour = {title: "Signalement de réponse", installe: true, admin: false, statutConnexion: res.locals.connecte, sites: installe.sites, notFound: true};
                                res.json(retour);
                            }
                        }

                        else if(remplacant) {
                            retour = {title: "Signalement de réponse", installe: false, admin: false, statutConnexion: res.locals.connecte, notFound: true};
                            res.json(retour);
                        }
                    });
                });
            });
        }

        else {
            retour = {title: "Signalement de réponse", statutConnexion: res.locals.connecte, notFound: true};
            res.json(retour);
        }
    });
});

router.post('/reponse/:id', verifRequete, function(req, res) {
    var retour;
    var messages = [];

    var id = req.params.id;
    var raison = req.body.raison;
    var precision = req.body.precision;
    var infosSupp = req.body.infosSupp;
    var captcha = req.body.captcha;
    var nomSignaleur = req.body.nomSignaleur;
    var prenomSignaleur = req.body.prenomSignaleur;
    var professionSignaleur = req.body.professionSignaleur;
    var adresseSignaleur = req.body.adresseSignaleur;
    var villeSignaleur = req.body.villeSignaleur;
    var codePostalSignaleur = req.body.codePostalSignaleur;
    var nationaliteSignaleur = req.body.nationaliteSignaleur;
    var dateNaissanceSignaleur = req.body.dateNaissanceSignaleur;
    var villeNaissanceSignaleur = req.body.villeNaissanceSignaleur;
    var codePostalNaissanceSignaleur = req.body.codePostalNaissanceSignaleur;

    if(captcha === undefined) {
        messages.push("Vous n'avez pas validé le code captcha");
    }

    if(raison != 'Le message est inaproprié' && raison != 'Autre') {
        messages.push("La raison n'est pas valide");
    }

    if(raison == 'Autre') {
        if(precision === undefined) {
            messages.push("La précision de la raison est vide");
        }

        else {
            req.checkBody({
                'precision': {
                    matches: {
                        options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù.,;?!:@_()/'"\n ]{1,750}$/,
                        errorMessage: "La précision contient des caractères non supportés (entre 1 et 750 caractères)"
                    }
                }
            });
        }
    }

    if(infosSupp !== undefined) {
        req.checkBody({
            'infosSupp': {
                matches: {
                    options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù.,;?!:@_()/'"\n ]{0,750}$/,
                    errorMessage: "Les informations supplémentaires contiennent des caractères non supportés (entre 0 et 750 caractères)"
                }
            }
        });
    }

    req.checkBody({
        'nomSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
                errorMessage: "Votre nom comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre nom est vide"
        },
        'prenomSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
                errorMessage: "Votre prénom comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre prénom est vide"
        },
        'professionSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù'/ ]{1,48}$/,
                errorMessage: "Votre profession comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre profession est vide"
        },
        'adresseSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,100}$/,
                errorMessage: "Votre adresse comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre adresse est vide"
        },
        'villeSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
                errorMessage: "Votre ville comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre ville est vide"
        },
        'codePostalSignaleur': {
            matches: {
                options: /^[0-9]{5}$/,
                errorMessage: "Votre code postal est invalide"
            },
            notEmpty: true,
            errorMessage: "Votre code postal est vide"
        },
        'nationaliteSignaleur': {
            notEmpty: true,
            errorMessage: "Votre nationalité n'a pas été sélectionnée"
        },
        'dateNaissanceSignaleur': {
            isDate: true,
            errorMessage: "Votre date de naissance n'est pas au bon format"
        },
        'villeNaissanceSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
                errorMessage: "Votre ville de naissance comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre ville  de naissanceest vide"
        },
        'codePostalNaissanceSignaleur': {
            matches: {
                options: /^[0-9]{5}$/,
                errorMessage: "Votre code postal de ville de naissance est invalide"
            },
            notEmpty: true,
            errorMessage: "Votre code postal de ville de naissance est vide"
        },
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
        var dateNaissanceSignaleurD = new Date(dateNaissanceSignaleur);

        var signaleur = {
            nom: nomSignaleur,
            prenom: prenomSignaleur,
            profession: professionSignaleur,
            adresse: adresseSignaleur,
            ville: villeSignaleur,
            codePostal: codePostalSignaleur,
            nationalite: nationaliteSignaleur,
            dateNaissance: dateNaissanceSignaleurD.getDate()+"/"+dateNaissanceSignaleurD.getMonth()+"/"+dateNaissanceSignaleurD.getFullYear(),
            villeNaissance: villeNaissanceSignaleur,
            codePostalNaissance: codePostalNaissanceSignaleur
        };

        Reponse.findOne({_id: id}, function(err1, reponse) {
            if(reponse) {
                Remplacant.findOne({_id: reponse.idRemplacant}, function(err2, remplacant) {
                    if(remplacant) {
                        envoiMail.envoiMailSignalisationReponseMembre(remplacant, id, raison, precision, infosSupp);
                        envoiMail.envoiMailSignalisationReponse1Rempla(id, raison, precision, infosSupp, signaleur);

                        retour = {succes: true, succesMsg: "La réponse a été signalée. Nous allons être notifié et prendrons les mesures nécessaires si nous jugeont votre signalisation pertinente"};
                        res.json(retour);
                    }

                    else {
                        retour = {succes: false, errors: ["Remplaçant non trouvé"]};
                        res.json(retour);
                    }
                });
            }

            else {
                retour = {succes: false, errors: ["Réponse non trouvée"]};
                res.json(retour);
            }
        });
    }
});

router.get('/site/:id', verifRequete, statutConnexion, function(req, res) {
    var retour;

    Site.findOne({_id: req.params.id}, function(err1, site) {
        if(req.isAuthenticated()) {
            Installe.findOne({_id: req.user._id}, function(err2, installe) {
                Remplacant.findOne({_id: req.user._id}, function(err3, remplacant) {
                    Admin.findOne({_id: req.user._id}, function(err4, admin) {
                        if(admin) {
                            retour = {title: "Signalement de lieu d'exercice", installe: false, admin: true, statutConnexion: res.locals.connecte, notFound: true};
                            res.json(retour);
                        }

                        else if(installe) {
                            if(err1) {
                                retour = {title: "Signalement de lieu d'exercice", installe: true, admin: false, statutConnexion: res.locals.connecte, sites: installe.sites, notFound: true};
                                res.json(retour);
                            }

                            else if(site) {
                                Specialite.findOne({_id: installe.specialite}, function(err5, specialite) {
                                    var retourMembre = {
                                        nom: installe.nom,
                                        prenom: installe.prenom,
                                        adresseMembre: installe.adresseMembre,
                                        villeMembre: installe.villeMembre,
                                        codePostalMembre: installe.codePostalMembre
                                    };

                                    retour = {title: "Signalement de lieu d'exercice", installe: true, admin: false, statutConnexion: res.locals.connecte, notFound: false, membre: retourMembre, sites: installe.sites, specialite: specialite, nationalites: require('../config/nationalites.json')};
                                    res.json(retour);
                                });
                            }

                            else {
                                retour = {title: "Signalement de lieu d'exercice", installe: true, admin: false, statutConnexion: res.locals.connecte, sites: installe.sites, notFound: true};
                                res.json(retour);
                            }
                        }

                        else if(remplacant) {
                            if(err1) {
                                retour = {title: "Signalement de lieu d'exercice", installe: false, admin: false, statutConnexion: res.locals.connecte, notFound: true};
                                res.json(retour);
                            }

                            else if(site) {
                                Specialite.findOne({_id: remplacant.specialite}, function(err5, specialite) {
                                    var retourMembre = {
                                        nom: remplacant.nom,
                                        prenom: remplacant.prenom,
                                        adresseMembre: remplacant.adresseMembre,
                                        villeMembre: remplacant.villeMembre,
                                        codePostalMembre: remplacant.codePostalMembre
                                    };

                                    retour = {title: "Signalement de lieu d'exercice", installe: false, admin: false, statutConnexion: res.locals.connecte, notFound: false, membre: retourMembre, specialite: specialite, nationalites: require('../config/nationalites.json')};
                                    res.json(retour);
                                });
                            }

                            else {
                                retour = {title: "Signalement de lieu d'exercice", installe: false, admin: false, statutConnexion: res.locals.connecte, notFound: true};
                                res.json(retour);
                            }
                        }
                    });
                });
            });
        }

        else {
            if(err1) {
                retour = {title: "Signalement de lieu d'exercice", statutConnexion: res.locals.connecte, notFound: true};
                res.json(retour);
            }

            else if(site) {
                retour = {title: "Signalement de lieu d'exercice", statutConnexion: res.locals.connecte, notFound: false, nationalites: require('../config/nationalites.json')};
                res.json(retour);
            }

            else {
                retour = {title: "Signalement de lieu d'exercice", statutConnexion: res.locals.connecte, notFound: true};
                res.json(retour);
            }
        }
    });
});

router.post('/site/:id', verifRequete, function(req, res) {
    var retour;
    var messages = [];

    var id = req.params.id;
    var raison = req.body.raison;
    var precision = req.body.precision;
    var infosSupp = req.body.infosSupp;
    var siteInstalle = false;
    var captcha = req.body.captcha;
    var nomSignaleur = req.body.nomSignaleur;
    var prenomSignaleur = req.body.prenomSignaleur;
    var professionSignaleur = req.body.professionSignaleur;
    var adresseSignaleur = req.body.adresseSignaleur;
    var villeSignaleur = req.body.villeSignaleur;
    var codePostalSignaleur = req.body.codePostalSignaleur;
    var nationaliteSignaleur = req.body.nationaliteSignaleur;
    var dateNaissanceSignaleur = req.body.dateNaissanceSignaleur;
    var villeNaissanceSignaleur = req.body.villeNaissanceSignaleur;
    var codePostalNaissanceSignaleur = req.body.codePostalNaissanceSignaleur;
    var indice;

    if(captcha === undefined) {
        messages.push("Vous n'avez pas validé le code captcha");
    }

    if(raison != 'Les informations sont incorrectes' && raison != "Les photos du lieu d'exercice sont inapropriées" && raison != "La description du lieu d'exercice est inappropriée" && raison != 'Autre') {
        messages.push("La raison n'est pas valide");
    }

    if(raison == 'Autre') {
        if(precision === undefined) {
            messages.push("La précision de la raison est vide");
        }

        else {
            req.checkBody({
                'precision': {
                    matches: {
                        options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù.,;?!:@_()/'"\n ]{1,750}$/,
                        errorMessage: "La précision contient des caractères non supportés (entre 1 et 750 caractères)"
                    }
                }
            });
        }
    }

    if(infosSupp !== undefined) {
        req.checkBody({
            'infosSupp': {
                matches: {
                    options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù.,;?!:@_()/'"\n ]{0,750}$/,
                    errorMessage: "Les informations supplémentaires contiennent des caractères non supportés (entre 0 et 750 caractères)"
                }
            }
        });
    }

    req.checkBody({
        'nomSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
                errorMessage: "Votre nom comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre nom est vide"
        },
        'prenomSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
                errorMessage: "Votre prénom comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre prénom est vide"
        },
        'professionSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù'/ ]{1,48}$/,
                errorMessage: "Votre profession comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre profession est vide"
        },
        'adresseSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,100}$/,
                errorMessage: "Votre adresse comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre adresse est vide"
        },
        'villeSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
                errorMessage: "Votre ville comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre ville est vide"
        },
        'codePostalSignaleur': {
            matches: {
                options: /^[0-9]{5}$/,
                errorMessage: "Votre code postal est invalide"
            },
            notEmpty: true,
            errorMessage: "Votre code postal est vide"
        },
        'nationaliteSignaleur': {
            notEmpty: true,
            errorMessage: "Votre nationalité n'a pas été sélectionnée"
        },
        'dateNaissanceSignaleur': {
            isDate: true,
            errorMessage: "Votre date de naissance n'est pas au bon format"
        },
        'villeNaissanceSignaleur': {
            matches: {
                options: /^[0-9a-zA-Z-ÀÂÄÇÉĒËÊÏÎÔŒÖÛÜÙàâäçéèëêïîœôöûüù' ]{1,48}$/,
                errorMessage: "Votre ville de naissance comporte des caractères non supportés"
            },
            notEmpty: true,
            errorMessage: "Votre ville  de naissanceest vide"
        },
        'codePostalNaissanceSignaleur': {
            matches: {
                options: /^[0-9]{5}$/,
                errorMessage: "Votre code postal de ville de naissance est invalide"
            },
            notEmpty: true,
            errorMessage: "Votre code postal de ville de naissance est vide"
        },
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
        var dateNaissanceSignaleurD = new Date(dateNaissanceSignaleur);

        var signaleur = {
            nom: nomSignaleur,
            prenom: prenomSignaleur,
            profession: professionSignaleur,
            adresse: adresseSignaleur,
            ville: villeSignaleur,
            codePostal: codePostalSignaleur,
            nationalite: nationaliteSignaleur,
            dateNaissance: dateNaissanceSignaleurD.getDate()+"/"+dateNaissanceSignaleurD.getMonth()+"/"+dateNaissanceSignaleurD.getFullYear(),
            villeNaissance: villeNaissanceSignaleur,
            codePostalNaissance: codePostalNaissanceSignaleur
        };

        Site.findOne({_id: id}, function(err1, site) {
            if(site) {
                Installe.find({}, function(err2, installes) {
                    if(installes) {
                        for(var i = 0 ; i < installes.length ; i++) {
                            for(var j = 0 ; j < installes[i].sites.length ; j++) {
                                if(Object.is(String(installes[i].sites[j]), String(site._id))) {
                                    siteInstalle = true;
                                    break;
                                }
                            }

                            if(siteInstalle) {
                                indice = i;
                                break;
                            }
                        }

                        if(siteInstalle) {
                            envoiMail.envoiMailSignalisationSiteMembre(installes[indice], id, raison, precision, infosSupp);
                            envoiMail.envoiMailSignalisationSite1Rempla(id, raison, precision, infosSupp, signaleur);

                            retour = {succes: true, succesMsg: "Le lieu d'exercice a été signalé. Nous allons être notifié et prendrons les mesures nécessaires si nous jugeont votre signalisation pertinente"};
                            res.json(retour);
                        }

                        else {
                            retour = {succes: false, errors: ["Installé non trouvé"]};
                            res.json(retour);
                        }
                    }

                    else {
                        retour = {succes: false, errors: ["Installé non trouvé"]};
                        res.json(retour);
                    }
                });
            }

            else {
                retour = {succes: false, errors: ["Lieu d'exercice non trouvée"]};
                res.json(retour);
            }
        });
    }
});

module.exports = router;