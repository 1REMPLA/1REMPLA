var routeAppControllers = angular.module('routeAppControllers', ['ngFileUpload']);

routeAppControllers.controller('mainCtrl', function($scope, $http, $location, $sce) {
    $scope.videoInscription = false;
    $scope.videoProfilInstalle = false;
    $scope.videoProfilRemplacant = false;
    $scope.videoReponses = false;
    $scope.players = [];

    // Fonction post pour se déconnecter
    $scope.deconnexion = function() {
        $http.post('/deconnexion').then(function(res) {
            $location.path('/rien');
        });
    };
});

routeAppControllers.controller('accueilCtrl', function($scope, $http, $location, $timeout, annoncesService, remplacantsService, $sce) {
    //Variables
    $scope.installe = false;
    $scope.admin = false;
    $scope.remplacant = false;
    $scope.erreur = false;
    $scope.result1 = '';
    $scope.options = {
      country: 'fr'
    };

    $scope.showModal = false;

    $scope.cacherModal = function() {
        $scope.showModal = false;
    };

    $scope.players = [];

    $scope.onPlayerReady = function(API) {
        $scope.players.push(API);
    };

    $scope.stopPlayer = function() {
        for(var i = 0 ; i < $scope.players.length ; i++) {
            $scope.players[i].stop();
        }
    };

    $scope.rechercheReponseAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Reponses.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    // Fonction get pour récupérer les informations
    $http.get('/accueil').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.specialites = res.data.specialites;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.statutConnexion) {
            if(res.data.installe) {
                $scope.installe = true;
                $scope.idSite1 = res.data.membre.sites[0];
            }

            else if(res.data.admin) {
                $scope.admin = true;
            }

            else {
                $scope.remplacant = true;
            }
        }
    });

    $scope.rechercher = function(recherche){
        $scope.erreur = false;

        if($scope.details === undefined) {
            $scope.erreur = true;
            $scope.errorMsg = "L'adresse indiquée n'est pas valide";
        }

        else {
            $scope.showModal = true;

            recherche.placeLoc = [$scope.details.geometry.location.lat(),$scope.details.geometry.location.lng()];
            recherche.rechercheTypeAnnonce = $scope.rechercheTypeAnnonce;

            if($scope.rechercheTypeAnnonce == 'true'){

              annoncesService.setDistance(recherche.distance);

              $http.post('/accueil', recherche, $scope.details).then(function(data) {
                  if(data.data.succes) {
                      annoncesService.setAnnonces(data.data.annonces);
                      annoncesService.setLocation(data.data.place);
                      $location.path('/annonces/recherche');
                  }
                  else {
                      $scope.erreur = true;
                      $scope.errorMsg = data.data.errors;
                  }
              });
            }
            else {

              $http.post('/accueil', recherche, $scope.details).then(function(data) {
                  if(data.data.succes) {
                      remplacantsService.setRemplacants(data.data.remplacants);
                      remplacantsService.setLocation(data.data.place);
                      $location.path('/annonces/rechercheRemplacants');
                  }
                  else {
                      $scope.erreur = true;
                      $scope.errorMsg = data.data.errors;
                  }
              });
            }

        }
    };
});

routeAppControllers.controller('aproposCtrl', function($scope, $http) {
    $scope.installe = false;
    $scope.admin = false;
    $scope.remplacant = false;

    // Fonction get pour récupérer les informations
    $http.get('/apropos').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.statutConnexion) {
            if(res.data.installe) {
                $scope.installe = true;
                $scope.idSite1 = res.data.membre.sites[0];
            }

            else if(res.data.admin) {
                $scope.admin = true;
            }

            else {
                $scope.remplacant = true;
            }
        }
    });
});

routeAppControllers.controller('mentionsLegalesCtrl', function($scope, $http) {
    $scope.installe = false;
    $scope.admin = false;
    $scope.remplacant = false;

    // Fonction get pour récupérer les informations
    $http.get('/mentionsLegales').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.statutConnexion) {
            if(res.data.installe) {
                $scope.installe = true;
                $scope.idSite1 = res.data.membre.sites[0];
            }

            else if(res.data.admin) {
                $scope.admin = true;
            }

            else {
                $scope.remplacant = true;
            }
        }
    });
});

routeAppControllers.controller('cguCtrl', function($scope, $http) {
    $scope.installe = false;
    $scope.admin = false;
    $scope.remplacant = false;

    // Fonction get pour récupérer les informations
    $http.get('/conditions-generales-d-utilisation').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.statutConnexion) {
            if(res.data.installe) {
                $scope.installe = true;
                $scope.idSite1 = res.data.membre.sites[0];
            }

            else if(res.data.admin) {
                $scope.admin = true;
            }

            else {
                $scope.remplacant = true;
            }
        }
    });
});

routeAppControllers.controller('contactCtrl', function($scope, $http, $location, $timeout) {
    $scope.informations = {};
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.succes = false;
    $scope.error = false;
    $scope.load = false;

    $http.get('/contact').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if($scope.connecte) {
            $scope.informations.nom = res.data.nom;
            $scope.informations.prenom = res.data.prenom;
            $scope.informations.email = res.data.mail;

            if(res.data.installe) {
                $scope.installe = true;
                $scope.idSite1 = res.data.sites[0];
            }

            else {
                $scope.remplacant = true;
            }
        }
    });

    $scope.contact = function(informations) {
        $http.post('/contact', informations).then(function(data) {
            $scope.load = true;

            if(data.data.succes) {
                $scope.succes = true;
                $scope.succesMsg = data.data.succesMsg;

                $timeout(function() {
                    $scope.load = false;
                    $location.path("/");
                }, 5000);
            }

            else {
                $scope.error = true;
                $scope.erreurMsg = data.data.errors;

                $timeout(function() {
                    $scope.load = false;
                }, 1000);
            }
        });
    };
});

routeAppControllers.controller('connexionCtrl', function($scope, $http, $location, $timeout) {
    // Variables
    $scope.error = false;

    // Fonction get pour récupérer les informations
    $http.get('/connexion').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;
    });

    // Fonction post attachée au formulaire
    $scope.connexion = function(membre) {
        $scope.load = true;

        $http.post('/connexion', membre).then(function(data) {
            if(data.data.loggedIn) {
                $timeout(function() {
                    $location.path('/profil/public');
                }, 1000);
            }

            else {
                $scope.load = false;
                $scope.erreur = true;
                $scope.messages = data.data.messages;
            }
        });
    }
});

routeAppControllers.controller('motDePasseOublieCtrl', function($scope, $http, $timeout) {
    // Variables
    $scope.succes = false;
    $scope.erreur = false;
    $scope.formulaire = true;
    $scope.load = false;

    // Fonction get pour récupérer les informations
    $http.get('/connexion/motDePasseOublie').then(function (res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;
    });

    // Fonction post attachée au formulaire
    $scope.mdpOublie = function(oubli) {
        $scope.load = true;

        $http.post('/connexion/motDePasseOublie', oubli).then(function(data) {
            if(data.data.succes) {
                $scope.formulaire = false;
                $scope.succesMsg = data.data.succesMsg;
                $timeout(function() {
                    $scope.load = false;
                    $scope.succes = data.data.succes;
                }, 3000);
            }

            else {
                $scope.formulaire = false;
                $scope.erreurMsg = data.data.errors;
                $timeout(function() {
                    $scope.load = false;
                    $scope.erreur = !data.data.succes;
                    $scope.formulaire = true;
                }, 3000);
            }
        })
    }
});

routeAppControllers.controller('reinitialisationMdpCtrl', function($scope, $http, $location, $timeout) {
    //Variables
    $scope.succes = false;
    $scope.erreur = false;
    $scope.formulaire = true;
    $scope.load = false;

    // Fonction get pour récupérer les informations
    $http.get($location.path()).then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.error) {
          $scope.erreur = true;
          $scope.formulaire = false;
          $scope.erreurMsg = ["Token invalide"];
        }
    });

    // Fonction post attachée au formulaire
    $scope.reinitialisation = function(reinit) {
        $scope.load = true;

        $http.post($location.path(), reinit).then(function(data) {
            if(data.data.succes) {
                $scope.formulaire = false;
                $scope.succesMsg = data.data.succesMsg;
                $timeout(function() {
                    $scope.load = false;
                    $scope.succes = data.data.succes;
                }, 3000);
            }

            else {
                $scope.formulaire = false;
                $scope.erreurMsg = data.data.errors;
                $timeout(function() {
                    $scope.load = false;
                    $scope.erreur = !data.data.succes;
                    $scope.formulaire = true;
                }, 3000);

            }
        });
    }
});

routeAppControllers.controller('validationCtrl', function($scope, $http, $location) {
    // Fonction get pour récupérer les informations
    $http.get($location.path(), {headers: {validation: true}}).then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        console.log(res);

        if(res.data.error) {
          $scope.erreur = true;
          $scope.erreurMsg = "Token invalide";
        }

        else {
          $scope.erreur = false;
          $scope.succesMsg = "Votre compte a été validé. Vous pouvez vous désormais vous connecter en cliquant ";
        }
    });
});

routeAppControllers.controller('inscriptionCtrl', function($scope, Upload, $http, $location, $timeout, $sce) {
    // Variables
    $scope.type = "";
    $scope.choixProfil = true;
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.site2 = false;
    $scope.site3 = false;
    $scope.succes = false;
    $scope.error = false;
    $scope.erreurPhotos = false;
    $scope.erreurCaracteres = false;
    $scope.adresseVal = true;
    $scope.adresseSite1Val = true;
    $scope.adresseSite2Val = true;
    $scope.adresseSite3Val = true;
    $scope.adresseDisableMembre = true;
    $scope.players = [];

    $scope.membre = {};

    $scope.options = {
      country: 'fr'
    };

    $scope.onPlayerReady = function(API) {
        $scope.players.push(API);
    };

    $scope.stopPlayer = function() {
        for(var i = 0 ; i < $scope.players.length ; i++) {
            $scope.players[i].stop();
        }
    };

    $scope.inscriptionAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Inscription.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    // Fonction get pour récupérer les informations
    $http.get('/inscription').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.specialites = res.data.specialites;
        $scope.typeSites = res.data.typeSites;
        $scope.connecte = res.data.statutConnexion;
        $scope.membre.horairesSite1 = '';
        $scope.membre.horairesSite2 = '';
        $scope.membre.horairesSite3 = '';
    });

    $scope.adresseChange = function() {
        $scope.adresseDisableMembre = !$scope.adresseDisableMembre;
    };

    // Fonction post attachée au formulaire
    $scope.inscriptionMembre = function(membre) {
        $scope.succes = false;
        $scope.error = false;
        $scope.load = true;

        var photos = [];

        photos.push(membre.photoMembre);
        photos.push(membre.photoSite1);
        photos.push(membre.photoSite2);
        photos.push(membre.photoSite3);

        Upload.upload({
          url: '/inscription',
          data: {membre: membre, email: membre.email, motDePasse: membre.motDePasse, type: $scope.type, file: photos},
          file: photos
        }).then(function(data) {
            if(data.data.loggedIn) {
                $scope.installe = false;
                $scope.remplacant = false;
                $scope.choixProfil = false;
                $scope.succes = true;
                $scope.erreur = false;

                $timeout(function() {
                    $http.post('/deconnexion').then(function(res) {
                        $location.path('/');
                    });
                }, 3000);
            }

            else {
                $scope.load = false;
                $scope.erreur = true;
                $scope.messages = data.data.messages;
            }
        });
    };

    // Fonctions de modification du formulaire
    $scope.adresse = function(details) {
      $scope.adresseVal = true;
      $scope.membre.adresseMembre = "";
      $scope.membre.villeMembre = "";
      $scope.membre.codePostalMembre = "";

      for(var i = 0 ; i < details.address_components.length ; i++) {
        if(details.address_components[i].types[0] == "street_number") {
          $scope.membre.adresseMembre = details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "route") {
          $scope.membre.adresseMembre += " "+details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "locality") {
          $scope.membre.villeMembre = details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "postal_code") {
          $scope.membre.codePostalMembre = details.address_components[i].long_name;
        }
      }

      if($scope.membre.villeMembre === "" || $scope.membre.codePostalMembre === "") {
        $scope.adresseVal = false;
      }
    }

    $scope.adresseSite1 = function(details) {
      $scope.adresseSite1Val = true;
      $scope.membre.adresseSite1 = "";
      $scope.membre.villeSite1 = "";
      $scope.membre.codePostalSite1 = "";
      $scope.membre.coordonneesSite1 = [];

      for(var i = 0 ; i < details.address_components.length ; i++) {
        if(details.address_components[i].types[0] == "street_number") {
          $scope.membre.adresseSite1 = details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "route") {
          $scope.membre.adresseSite1 += " "+details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "locality") {
          $scope.membre.villeSite1 = details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "postal_code") {
          $scope.membre.codePostalSite1 = details.address_components[i].long_name;
        }
      }

      $scope.membre.coordonneesSite1 = [details.geometry.location.lat(),details.geometry.location.lng()]

      if($scope.membre.villeSite1 === "" || $scope.membre.codePostalSite1 === "") {
        $scope.adresseSite1Val = false;
      }
    }

    $scope.adresseSite2 = function(details) {
      $scope.adresseSite2Val = true;
      $scope.membre.adresseSite2 = "";
      $scope.membre.villeSite2 = "";
      $scope.membre.codePostalSite2 = "";
      $scope.membre.coordonneesSite2 = [];

      for(var i = 0 ; i < details.address_components.length ; i++) {
        if(details.address_components[i].types[0] == "street_number") {
          $scope.membre.adresseSite2 = details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "route") {
          $scope.membre.adresseSite2 += " "+details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "locality") {
          $scope.membre.villeSite2 = details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "postal_code") {
          $scope.membre.codePostalSite2 = details.address_components[i].long_name;
        }
      }

      $scope.membre.coordonneesSite2 = [details.geometry.location.lat(),details.geometry.location.lng()]

      if($scope.membre.villeSite2 === "" || $scope.membre.codePostalSite2 === "") {
        $scope.adresseSite2Val = false;
      }
    }

    $scope.adresseSite3 = function(details) {
      $scope.adresseSite3Val = true;
      $scope.membre.adresseSite3 = "";
      $scope.membre.villeSite3 = "";
      $scope.membre.codePostalSite3 = "";
      $scope.membre.coordonneesSite3 = [];

      for(var i = 0 ; i < details.address_components.length ; i++) {
        if(details.address_components[i].types[0] == "street_number") {
          $scope.membre.adresseSite3 = details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "route") {
          $scope.membre.adresseSite3 += " "+details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "locality") {
          $scope.membre.villeSite3 = details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "postal_code") {
          $scope.membre.codePostalSite3 = details.address_components[i].long_name;
        }
      }

      $scope.membre.coordonneesSite3 = [details.geometry.location.lat(),details.geometry.location.lng()]

      if($scope.membre.villeSite3 === "" || $scope.membre.codePostalSite3 === "") {
        $scope.adresseSite3Val = false;
      }
    }

    $scope.installeFct = function() {
        $scope.installe = true;
        $scope.remplacant = false;
        $scope.type = "installe";
    }

    $scope.remplacantFct = function() {
        $scope.remplacant = true;
        $scope.installe = false;
        $scope.type = "remplacant";
        $scope.membre.nomSite1 = undefined;
    }

    $scope.ajoutDeuxiemeSite = function() {
        $scope.site2 = true;
        $scope.membre.horairesSite2='';
    }

    $scope.suppDeuxiemeSite = function() {
        $scope.site2 = false;
        $scope.membre.nomSite2 = undefined;
    }

    $scope.ajoutTroisiemeSite = function() {
        $scope.site3 = true;
        $scope.membre.horairesSite3='';
    }

    $scope.suppTroisiemeSite = function() {
        $scope.site3 = false;
        $scope.membre.nomSite3 = undefined;
    }
});

routeAppControllers.controller('profilPublicCtrl', function($scope, $http, $sce) {
    // Variables
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.admin = false;
    $scope.players = [];

    $scope.onPlayerReady = function(API) {
        $scope.players.push(API);
    };

    $scope.stopPlayer = function() {
        for(var i = 0 ; i < $scope.players.length ; i++) {
            $scope.players[i].stop();
        }
    };

    $scope.profilInstalleAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Installe.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    $scope.profilRemplacantAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Remplacant.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    // Fonction get pour récupérer les informations
    $http.get('/profil/public').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.statutConnexion) {
            $scope.membre = res.data.membre;
            $scope.specialite = res.data.specialite;

            if(res.data.membre.biographie != undefined && res.data.membre.biographie != "") {
                $scope.showBio = true;
            }

            else {
                $scope.showBio = false;
            }

            if(res.data.installe) {
                $scope.installe = true;
                $scope.sites = res.data.sites;
                $scope.typeSites = res.data.typeSites;
                $scope.idSite1 = res.data.sites[0]._id;
            }

            else if(res.data.admin) {
                $scope.admin = true;
            }

            else {
                $scope.remplacant = true;
            }
        }
    });
});

routeAppControllers.controller('profilGeneralCtrl', function($scope, $http, $timeout, $sce) {
    // Variables
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.admin = false;
    $scope.succes = false;
    $scope.erreur = false;
    $scope.formulaire = true;
    $scope.load = false;
    $scope.modifSpeB = false;
    $scope.adresseVal = true;
    $scope.players = [];

    $scope.onPlayerReady = function(API) {
        $scope.players.push(API);
    };

    $scope.stopPlayer = function() {
        for(var i = 0 ; i < $scope.players.length ; i++) {
            $scope.players[i].stop();
        }
    };

    $scope.profilInstalleAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Installe.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    $scope.profilRemplacantAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Remplacant.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    $scope.options = {
      country: 'fr'
    };

    // Fonction get pour récupérer les informations
    $http.get('/profil/general').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.statutConnexion) {
            $scope.membre = res.data.membre;
            $scope.specialiteMembre = res.data.specialite.typeSpecialite;
            $scope.specialiteId = res.data.specialite._id;
            $scope.specialiteObj = res.data.specialiteObj;

            if(res.data.installe) {
                $scope.installe = true;
                $scope.idSite1 = res.data.membre.sites[0];
            }

            else if(res.data.admin) {
                $scope.admin = true;
            }

            else {
                $scope.remplacant = true;
            }
        }
    });

    $scope.remplirAdresse = function(details) {
      $scope.adresseVal = true;
      $scope.membre.adresseMembre = "";
      $scope.membre.villeMembre = "";
      $scope.membre.codePostalMembre = "";

      for(var i = 0 ; i < details.address_components.length ; i++) {
        if(details.address_components[i].types[0] == "street_number") {
          $scope.membre.adresseMembre = details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "route") {
          $scope.membre.adresseMembre += " "+details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "locality") {
          $scope.membre.villeMembre = details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "postal_code") {
          $scope.membre.codePostalMembre = details.address_components[i].long_name;
        }
      }

      if($scope.membre.villeMembre === "" || $scope.membre.codePostalMembre === "") {
        $scope.adresseVal = false;
      }
    }

    // Fonction post attachée au formulaire
    $scope.profilG = function(membre) {
        $scope.load = true;

        if(membre.specialite == undefined) {
            membre.specialite = $scope.specialiteId;
        }

        $http.post('/profil/general', membre).then(function(data) {
            if(data.data.succes) {
                $scope.formulaire = false;
                $scope.succesMsg = data.data.succesMsg;
                $timeout(function() {
                    $scope.load = false;
                    $scope.succes = true;
                }, 3000);
            }

            else {
                $scope.formulaire = false;
                $scope.erreurMsg = data.data.errors;
                $timeout(function() {
                    $scope.load = false;
                    $scope.erreur = !data.data.succes;
                    $scope.formulaire = true;
                }, 3000);
            }
        });
    }

    // Fonctions de modification du formulaire
    $scope.modifSpe = function() {
        $scope.modifSpeB = !$scope.modifSpeB;

        if(!$scope.modifNomB && !$scope.modifPrenomB && !$scope.modifMailB && !$scope.modifSpeB && !$scope.modifTelB && !$scope.modifBioB && !$scope.modifAdrB && !$scope.modifVilleB && !$scope.modifCPB) {
            $scope.depart = true;
        }

        else {
            $scope.depart = false;
        }
    }
});

routeAppControllers.controller('profilMdpCtrl', function($scope, $http, $timeout, $sce) {
    // Variables
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.admin = false;
    $scope.load = false;
    $scope.succes = false;
    $scope.erreur = false;
    $scope.formulaire = true;
    $scope.players = [];

    $scope.onPlayerReady = function(API) {
        $scope.players.push(API);
    };

    $scope.stopPlayer = function() {
        for(var i = 0 ; i < $scope.players.length ; i++) {
            $scope.players[i].stop();
        }
    };

    $scope.profilInstalleAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Installe.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    $scope.profilRemplacantAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Remplacant.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    // Fonction get pour récupérer les informations
    $http.get('/profil/motDePasse').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.statutConnexion) {
            if(res.data.installe) {
                $scope.installe = true;
                $scope.idSite1 = res.data.membre.sites[0];
            }

            else if(res.data.admin) {
                $scope.admin = true;
            }

            else {
                $scope.remplacant = true;
            }
        }
    });

    // Fonction post attachée au formulaire
    $scope.changementMdp = function(membre) {
        $scope.load = true;

        $http.post('profil/motDePasse', membre).then(function(data) {
            if(data.data.succes) {
                $scope.formulaire = false;
                $scope.succesMsg = data.data.succesMsg;
                $timeout(function() {
                    $scope.load = false;
                    $scope.succes = true;
                }, 3000);
            }

            else {
                $scope.formulaire = false;
                $scope.erreurMsg = data.data.errors;
                $timeout(function() {
                    $scope.load = false;
                    $scope.erreur = !data.data.succes;
                    $scope.formulaire = true;
                }, 3000);
            }
        });
    }
});

routeAppControllers.controller('profilPhotoCtrl', function($scope, Upload, $http, $timeout, $sce) {
    // Variables
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.admin = false;
    $scope.load = false;
    $scope.succes = false;
    $scope.erreur = false;
    $scope.formulaire = true;
    $scope.showPhoto = false;
    $scope.players = [];

    $scope.onPlayerReady = function(API) {
        $scope.players.push(API);
    };

    $scope.stopPlayer = function() {
        for(var i = 0 ; i < $scope.players.length ; i++) {
            $scope.players[i].stop();
        }
    };

    $scope.profilInstalleAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Installe.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    $scope.profilRemplacantAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Remplacant.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    // Fonction get pour récupérer les informations
    $http.get('/profil/photo').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.statutConnexion) {
              $scope.id = res.data.membre._id;
              $scope.photo = res.data.membre.photoMembre;

              if($scope.photo !== "") {
                  $scope.showPhoto = true;
              }

              if(res.data.installe) {
                  $scope.installe = true;
                  $scope.idSite1 = res.data.membre.sites[0];
              }

              else if(res.data.admin) {
                  $scope.admin = true;
              }

              else {
                  $scope.remplacant = true;
              }
        }
    });

    // Fonction post attachée au formulaire
    $scope.changementPhoto = function(membre) {
        $scope.load = true;

        var photos = [];
        photos.push(membre.photoNew);

        Upload.upload({
          url: '/profil/photo',
          data: {content: membre.photoNew.type, file: photos},
          file: photos
        }).then(function(data) {
          if(data.data.succes) {
              $scope.formulaire = false;
              $scope.succesMsg = data.data.succesMsg;
              $timeout(function() {
                  $scope.load = false;
                  $scope.succes = true;
              }, 3000);
          }

          else {
              $scope.formulaire = false;
              $scope.erreurMsg = data.data.errors;
              $timeout(function() {
                  $scope.load = false;
                  $scope.erreur = !data.data.succes;
                  $scope.formulaire = true;
              }, 3000);
          }
        });
    }
});

routeAppControllers.controller('profilZonesGeoCtrl', function($scope, $http, $timeout, $sce) {
    // Variables
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.admin = false;
    $scope.load = false;
    $scope.succes = false;
    $scope.erreur = false;
    $scope.circles = [];
    $scope.locations = [];
    $scope.players = [];

    $scope.onPlayerReady = function(API) {
        $scope.players.push(API);
    };

    $scope.stopPlayer = function() {
        for(var i = 0 ; i < $scope.players.length ; i++) {
            $scope.players[i].stop();
        }
    };

    $scope.profilRemplacantAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Remplacant.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    // Fonction get pour récupérer les informations
    $http.get('/profil/zonesDisponibilite').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.statutConnexion) {
              if(res.data.installe) {
                  $scope.installe = true;
              }

              else if(res.data.admin) {
                  $scope.admin = true;
              }

              else {
                  $scope.remplacant = true;

                  if(res.data.zonesGeo) {
                      for(var i = 0 ; i < res.data.zonesGeo.length ; i++) {
                          for(var j = 0 ; j < res.data.zonesGeo[i].cercles.length ; j++) {
                              res.data.zonesGeo[i].cercles[j].events = {
                                  radius_changed : function(newRadius, nom, cercleSelec) {
                                      for(var k = 0 ; k < $scope.circles.length ; k++) {
                                          if(cercleSelec.center.longitude == $scope.circles[k].center.longitude && cercleSelec.center.latitude == $scope.circles[k].center.latitude) {
                                              $scope.locations[k].rayon = Math.round(newRadius.radius/1000);
                                          }
                                      }
                                  },
                                  dragend: function() {
                                      for(var k = 0 ; k < $scope.circles.length ; k++) {
                                          var urlmap = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+$scope.circles[k].center.latitude+","+$scope.circles[k].center.longitude+"&key=AIzaSyCgUMCp-rymTyw0DZAR37BKffDMCR_zSkk";

                                          var request = new XMLHttpRequest();
                                          request.open('GET', urlmap, false);  // `false` makes the request synchronous
                                          request.send(null);

                                          if(request.status === 200) {
                                              var newVille = "";
                                              var newCodePostal = "";
                                              var donneesRetour = JSON.parse(request.response);

                                              for(var l = 0 ; l < donneesRetour.results.length ; l++) {
                                                  if(donneesRetour.results[l].types[0] == "locality") {
                                                      newVille = donneesRetour.results[l].address_components[0].long_name;
                                                  }

                                                  if(donneesRetour.results[l].types[0] == "postal_code") {
                                                      newCodePostal = donneesRetour.results[l].address_components[0].long_name;
                                                  }

                                                  $scope.locations[k] = {
                                                    indice: k,
                                                    ville: newVille,
                                                    codePostal: newCodePostal,
                                                    rayon: Math.round($scope.circles[k].radius/1000)
                                                  };
                                              }
                                          }
                                      }
                                  }
                              };

                              $scope.circles.push(res.data.zonesGeo[i].cercles[j]);
                          }
                      }

                      for(var k = 0 ; k < $scope.circles.length ; k++) {
                          var urlmap = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+$scope.circles[k].center.latitude+","+$scope.circles[k].center.longitude+"&key=AIzaSyCgUMCp-rymTyw0DZAR37BKffDMCR_zSkk";

                          var request = new XMLHttpRequest();
                          request.open('GET', urlmap, false);  // `false` makes the request synchronous
                          request.send(null);

                          if(request.status === 200) {
                              var newVille = "";
                              var newCodePostal = "";
                              var donneesRetour = JSON.parse(request.response);

                              for(var l = 0 ; l < donneesRetour.results.length ; l++) {
                                  if(donneesRetour.results[l].types[0] == "locality") {
                                      newVille = donneesRetour.results[l].address_components[0].long_name;
                                  }

                                  if(donneesRetour.results[l].types[0] == "postal_code") {
                                      newCodePostal = donneesRetour.results[l].address_components[0].long_name;
                                  }

                                  $scope.locations[k] = {
                                    indice: k,
                                    ville: newVille,
                                    codePostal: newCodePostal,
                                    rayon: Math.round($scope.circles[k].radius/1000)
                                  };
                              }
                          }
                      }
                  }
              }
        }
    });

    // Fonction post pour mettre les zones geo en base
    $scope.validationZonesGeo = function(circles) {
        $scope.load = true;

        $http.post('/profil/zonesDisponibilite', circles).then(function(data) {
            if(data.data.succes) {
                $scope.succes = true;
                $scope.succesMsg = data.data.succesMsg;
                $timeout(function() {
                    $scope.load = false;
                    $scope.succes = false;
                }, 2000);
            }

            else {
                $scope.erreur = true;
                $scope.erreurMsg = data.data.errors;
                $timeout(function() {
                    $scope.load = false;
                    $scope.erreur = !data.data.succes;
                }, 1500);
            }
        });
    }

    // Fonctions
    $scope.map = {
        center: { latitude: 46.52863469527167, longitude: 2.43896484375 },
        zoom: 5,
        markers: [],
        markersEvents: {
            click: function(marker, model) {
                $scope.map.mapWindow.coords = marker.model.coords;
                $scope.map.mapWindow.show = true;
                $scope.selectedAnnonce = $scope.annonces[marker.labelContent-1];
            }
        },
        mapWindow: {
            coords: {},
            show: false,
            closeClick: function() {
                this.show = false;
            }
        },
    };

    $scope.verifTableau = function() {
        if($scope.locations.length == 0) {
            return false;
        }

        else {
            return true;
        }
    }

    $scope.ajouterCercle = function() {
        $scope.circles.push({
            center: { latitude: 46.52863469527167, longitude: 2.43896484375 },
            radius: 100000,
            stroke: {
                color: '#e36060',
                weight: 2,
                opacity: 0.5
            },
            fill: {
                color: '#e36060',
                opacity: 0.2
            },
            clickable: true,
            editable : true,
            draggable : true,
            events: {
              radius_changed : function(newRadius, nom, cercleSelec) {
                  for(var k = 0 ; k < $scope.circles.length ; k++) {
                      if(cercleSelec.center.longitude == $scope.circles[k].center.longitude && cercleSelec.center.latitude == $scope.circles[k].center.latitude) {
                          $scope.locations[k].rayon = Math.round(newRadius.radius/1000);
                      }
                  }
              },
              dragend: function() {
                  for(var k = 0 ; k < $scope.circles.length ; k++) {
                      var urlmap = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+$scope.circles[k].center.latitude+","+$scope.circles[k].center.longitude+"&key=AIzaSyCgUMCp-rymTyw0DZAR37BKffDMCR_zSkk";

                      var request = new XMLHttpRequest();
                      request.open('GET', urlmap, false);  // `false` makes the request synchronous
                      request.send(null);

                      if(request.status === 200) {
                          var newVille = "";
                          var newCodePostal = "";
                          var donneesRetour = JSON.parse(request.response);

                          for(var l = 0 ; l < donneesRetour.results.length ; l++) {
                              if(donneesRetour.results[l].types[0] == "locality") {
                                  newVille = donneesRetour.results[l].address_components[0].long_name;
                              }

                              if(donneesRetour.results[l].types[0] == "postal_code") {
                                  newCodePostal = donneesRetour.results[l].address_components[0].long_name;
                              }

                              $scope.locations[k] = {
                                indice: k,
                                ville: newVille,
                                codePostal: newCodePostal,
                                rayon: Math.round($scope.circles[k].radius/1000)
                              };
                          }
                      }
                  }
              }
            }
        });

        for(var k = 0 ; k < $scope.circles.length ; k++) {
            var urlmap = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+$scope.circles[k].center.latitude+","+$scope.circles[k].center.longitude+"&key=AIzaSyCgUMCp-rymTyw0DZAR37BKffDMCR_zSkk";

            var request = new XMLHttpRequest();
            request.open('GET', urlmap, false);  // `false` makes the request synchronous
            request.send(null);

            if(request.status === 200) {
                var newVille = "";
                var newCodePostal = "";
                var donneesRetour = JSON.parse(request.response);

                for(var l = 0 ; l < donneesRetour.results.length ; l++) {
                    if(donneesRetour.results[l].types[0] == "locality") {
                        newVille = donneesRetour.results[l].address_components[0].long_name;
                    }

                    if(donneesRetour.results[l].types[0] == "postal_code") {
                        newCodePostal = donneesRetour.results[l].address_components[0].long_name;
                    }

                    $scope.locations[k] = {
                      indice: k,
                      ville: newVille,
                      codePostal: newCodePostal,
                      rayon: Math.round($scope.circles[k].radius/1000)
                    };
                }
            }
        }
    }

    $scope.supprimerCercle = function(indice) {
        $scope.circles.splice(indice, 1);
        $scope.locations.splice(indice, 1);
    }

    $scope.supprimerTout = function() {
        $scope.circles = [];
        $scope.locations = [];
    }
});

routeAppControllers.controller('profilSitesCtrl', function($scope, $http, $timeout, $sce) {
    //Variables
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.admin = false;
    $scope.site1ok = false;
    $scope.site2ok = false;
    $scope.site3ok = false;
    $scope.creationok = true;
    $scope.load = false;
    $scope.formulaire = true;
    $scope.suppSite1 = false;
    $scope.suppSite2 = false;
    $scope.suppSite3 = false;
    $scope.players = [];

    $scope.onPlayerReady = function(API) {
        $scope.players.push(API);
    };

    $scope.stopPlayer = function() {
        for(var i = 0 ; i < $scope.players.length ; i++) {
            $scope.players[i].stop();
        }
    };

    $scope.profilInstalleAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Installe.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    // Fonction get pour récupérer les informations
    $http.get('/profil/sites').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.statutConnexion) {
            if(res.data.installe) {
                $scope.installe = true;
                $scope.site = res.data.sites;

                if(res.data.sites.length >= 1) {
                    $scope.site1ok = true;

                    $scope.site1 = res.data.sites[0];
                    $scope.typeSite1 = res.data.typeSites[0].typeSite;
                    $scope.idSite1 = res.data.sites[0]._id;
                    $scope.photo1Site1 = res.data.sites[0].photos[0];

                    if($scope.photo1Site1 === undefined) {
                        $scope.photo1Site1 = "/images/aucune.jpg";
                    }

                    if(res.data.sites[0].adresseSite === "") {
                        $scope.adresseSite1 = false;
                    }

                    else {
                        $scope.adresseSite1 = true;
                    }

                    if(res.data.sites[0].horaires === "") {
                        $scope.horairesSite1 = false;
                    }

                    else {
                        $scope.horairesSite1 = true;
                    }
                }

                if(res.data.sites.length >= 2) {
                    $scope.site2ok = true;

                    $scope.site2 = res.data.sites[1];
                    $scope.typeSite2 = res.data.typeSites[1].typeSite;
                    $scope.idSite2 = res.data.sites[1]._id;
                    $scope.photo1Site2 = res.data.sites[1].photos[0];

                    if($scope.photo1Site2 === undefined) {
                        $scope.photo1Site2 = "/images/aucune.jpg";
                    }

                    if(res.data.sites[1].adresseSite === "") {
                        $scope.adresseSite2 = false;
                    }

                    else {
                        $scope.adresseSite2 = true;
                    }

                    if(res.data.sites[1].horaires === "") {
                        $scope.horairesSite2 = false;
                    }

                    else {
                        $scope.horairesSite2 = true;
                    }
                }

                if(res.data.sites.length == 3) {
                    $scope.site3ok = true;
                    $scope.creationok = false;

                    $scope.site3 = res.data.sites[2];
                    $scope.typeSite3 = res.data.typeSites[2].typeSite;
                    $scope.idSite3 = res.data.sites[2]._id;
                    $scope.photo1Site3 = res.data.sites[2].photos[0];

                    if($scope.photo1Site3 === undefined) {
                        $scope.photo1Site3 = "/images/aucune.jpg";
                    }

                    if(res.data.sites[2].adresseSite === "") {
                        $scope.adresseSite3 = false;
                    }

                    else {
                        $scope.adresseSite3 = true;
                    }

                    if(res.data.sites[2].horaires === "") {
                        $scope.horairesSite3 = false;
                    }

                    else {
                        $scope.horairesSite3 = true;
                    }
                }
            }

            else if(res.data.admin) {
                $scope.admin = true;
            }
        }
    });

    // Fonction post attachée au bouton de suppression du site
    $scope.supprimerSite = function(site1, site2, site3) {
        $scope.load = true;
        var site = {};

        if($scope.suppSite1) {
            site = site1;
        }

        if($scope.suppSite2) {
            site = site2;
        }

        if($scope.suppSite3) {
            site = site3;
        }

        $http.post('/profil/sites', site).then(function(data) {
            if(data.data.succes) {
                $scope.formulaire = false;
                $scope.succesMsg = data.data.succesMsg;
                $timeout(function() {
                    $scope.load = false;
                    $scope.succes = true;
                }, 3000);
            }

            else {
                $scope.formulaire = false;
                $scope.erreurMsg = data.data.errors;
                $timeout(function() {
                    $scope.load = false;
                    $scope.erreur = !data.data.succes;
                    $scope.formulaire = true;
                }, 3000);
            }
        });
    }
});

routeAppControllers.controller('profilSitesCreationCtrl', function($scope, Upload, $http, $timeout, $sce) {
    //Variables
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.admin = false;
    $scope.formulaire = true;
    $scope.load = false;
    $scope.adresseSiteVal = true;
    $scope.site = {};
    $scope.players = [];

    $scope.onPlayerReady = function(API) {
        $scope.players.push(API);
    };

    $scope.stopPlayer = function() {
        for(var i = 0 ; i < $scope.players.length ; i++) {
            $scope.players[i].stop();
        }
    };

    $scope.profilInstalleAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Installe.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    $scope.options = {
      country: 'fr'
    };

    // Fonction get pour récupérer les informations
    $http.get('/profil/sites/creation').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;
        $scope.site.horairesSite = '';

        if(res.data.statutConnexion) {
              if(res.data.installe) {
                  $scope.installe = true;
                  $scope.typeSites = res.data.typeSites;
                  $scope.idSite1 = res.data.membre.sites[0];
              }

              else if(res.data.admin) {
                  $scope.admin = true;
              }
        }
    });

    $scope.remplirAdresse = function(details) {
      $scope.adresseSiteVal = true;
      $scope.site.adresseSite = "";
      $scope.site.villeSite = "";
      $scope.site.codePostalSite = "";
      $scope.site.coordonneesSite = [];

      for(var i = 0 ; i < details.address_components.length ; i++) {
        if(details.address_components[i].types[0] == "street_number") {
          $scope.site.adresseSite = details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "route") {
          $scope.site.adresseSite += " "+details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "locality") {
          $scope.site.villeSite = details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "postal_code") {
          $scope.site.codePostalSite = details.address_components[i].long_name;
        }
      }

      $scope.site.coordonneesSite = [details.geometry.location.lat(),details.geometry.location.lng()]

      if($scope.site.villeSite === "" || $scope.site.codePostalSite === "") {
        $scope.adresseSiteVal = false;
      }
    };

    // Fonction post attachée au bouton de création du site
    $scope.creationSite = function(site) {
        $scope.load = true;

        var photos = [];

        photos.push(site.photo1Site);
        photos.push(site.photo2Site);
        photos.push(site.photo3Site);
        photos.push(site.photo4Site);
        photos.push(site.photo5Site);
        photos.push(site.photo6Site);

        Upload.upload({
          url: '/profil/sites/creation',
          data: {site: site, file: photos},
          file: photos
        }).then(function(data) {
            if(data.data.succes) {
                $scope.formulaire = false;
                $scope.succesMsg = data.data.succesMsg;
                $timeout(function() {
                    $scope.load = false;
                    $scope.succes = true;
                }, 3000);
            }

            else {
                $scope.formulaire = false;
                $scope.erreurMsg = data.data.errors;
                $timeout(function() {
                    $scope.load = false;
                    $scope.erreur = !data.data.succes;
                    $scope.formulaire = true;
                }, 3000);
            }
        });
    }
});

routeAppControllers.controller('profilSitesDetailsCtrl', function($scope, $http, $location, $sce) {
    //Variables
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.admin = false;
    $scope.players = [];

    $scope.onPlayerReady = function(API) {
        $scope.players.push(API);
    };

    $scope.stopPlayer = function() {
        for(var i = 0 ; i < $scope.players.length ; i++) {
            $scope.players[i].stop();
        }
    };

    $scope.profilInstalleAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Installe.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    // Fonction get pour récupérer les informations
    $http.get($location.path()).then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.statutConnexion) {
            if(res.data.installe) {
                  $scope.installe = true;
                  $scope.nom = res.data.site.nomSite;
                  $scope.adresse = res.data.site.adresseSite;
                  $scope.ville = res.data.site.villeSite;
                  $scope.codePostal = res.data.site.codePostalSite;
                  $scope.telephone = res.data.site.telSite;
                  $scope.horaires = res.data.site.horaires;
                  $scope.typeSite = res.data.typeSite.typeSite;
                  $scope.description = res.data.site.descSite;
                  $scope.photo1Site = res.data.site.photos[0];
                  $scope.photo2Site = res.data.site.photos[1];
                  $scope.photo3Site = res.data.site.photos[2];
                  $scope.photo4Site = res.data.site.photos[3];
                  $scope.photo5Site = res.data.site.photos[4];
                  $scope.photo6Site = res.data.site.photos[5];
                  $scope.idSite1 = res.data.membre.sites[0];

                  $scope.images = [];

                  for(var i = 0 ; i < 6 ; i++) {
                      if(res.data.site.photos[i] != undefined) {
                          $scope.images.push({id: i, url: res.data.site.photos[i]});
                      }
                  }

                  $scope.baniereok = true;
                  $scope.adresseok = true;
                  $scope.horairesok = true;
                  $scope.descriptionok = true;
                  $scope.galerieok = true;

                  if($scope.photo1Site === undefined) {
                      $scope.baniereok = false;
                  }

                  if($scope.adresse === '') {
                      $scope.adresseok = false;
                  }

                  if($scope.horaires === '') {
                      $scope.horairesok = false;
                  }

                  if(($scope.description === undefined) || ($scope.description === '') || ($scope.description === null)) {
                      $scope.descriptionok = false;
                  }

                  if($scope.images[0] === undefined) {
                      $scope.galerieok = false;
                  }

                  console.log($scope.descriptionok);
                  console.log($scope.description);
              }

              else if(res.data.admin) {
                  $scope.admin = true;
              }
        }
    });
});

routeAppControllers.controller('profilSitesModificationCtrl', function($scope, Upload, $http, $location, $timeout, $sce) {
    // Variables
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.admin = false;
    $scope.succes = false;
    $scope.erreur = false;
    $scope.formulaire = true;
    $scope.load = false;
    $scope.modifTypeSiteB = false;
    $scope.siPhoto1 = false;
    $scope.siPhoto2 = false;
    $scope.siPhoto3 = false;
    $scope.siPhoto4 = false;
    $scope.siPhoto5 = false;
    $scope.siPhoto6 = false;
    $scope.suppPhoto1 = false;
    $scope.suppPhoto2 = false;
    $scope.suppPhoto3 = false;
    $scope.suppPhoto4 = false;
    $scope.suppPhoto5 = false;
    $scope.suppPhoto6 = false;
    $scope.adresseSiteVal = true;
    $scope.site = {};
    $scope.players = [];

    $scope.onPlayerReady = function(API) {
        $scope.players.push(API);
    };

    $scope.stopPlayer = function() {
        for(var i = 0 ; i < $scope.players.length ; i++) {
            $scope.players[i].stop();
        }
    };

    $scope.profilInstalleAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Installe.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    $scope.options = {
      country: 'fr'
    };

    // Fonction get pour récupérer les informations
    $http.get($location.path()).then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.statutConnexion) {
            if(res.data.installe) {
                $scope.installe = true;

                $scope.nom = res.data.site.nomSite;
                $scope.typeSite = res.data.typeSite.typeSite;
                $scope.typeSiteId = res.data.typeSite._id;
                $scope.typeSiteObj = res.data.typeSiteObj;
                $scope.id = res.data.site._id;
                $scope.adresse = res.data.site.adresseSite;
                $scope.ville = res.data.site.villeSite;
                $scope.codePostal = res.data.site.codePostalSite;
                $scope.coordonneesSite = res.data.site.coordonneesSite;
                $scope.telephone = res.data.site.telSite;
                $scope.horaires = res.data.site.horaires;
                $scope.photo1 = res.data.site.photos[0];
                $scope.photo2 = res.data.site.photos[1];
                $scope.photo3 = res.data.site.photos[2];
                $scope.photo4 = res.data.site.photos[3];
                $scope.photo5 = res.data.site.photos[4];
                $scope.photo6 = res.data.site.photos[5];
                $scope.site.descSite = res.data.site.descSite;
                $scope.idSite1 = res.data.membre.sites[0];

                if($scope.adresse == "null" || $scope.adresse == undefined) {
                  $scope.adresse = "";
                }

                if($scope.photo1 != undefined && $scope.photo1 != "") {
                    $scope.siPhoto1 = true;
                }

                if($scope.photo2 != undefined && $scope.photo2 != "") {
                    $scope.siPhoto2 = true;
                }

                if($scope.photo3 != undefined && $scope.photo3 != "") {
                    $scope.siPhoto3 = true;
                }

                if($scope.photo4 != undefined && $scope.photo4 != "") {
                    $scope.siPhoto4 = true;
                }

                if($scope.photo5 != undefined && $scope.photo5 != "") {
                    $scope.siPhoto5 = true;
                }

                if($scope.photo6 != undefined && $scope.photo6 != "") {
                    $scope.siPhoto6 = true;
                }
            }

            else if(res.data.admin) {
                $scope.admin = true;
            }
        }
    });

    $scope.remplirAdresse = function(details) {
      $scope.adresseSiteVal = true;
      $scope.site.adresseSite = "";
      $scope.site.villeSite = "";
      $scope.site.codePostalSite = "";
      $scope.site.coordonneesSite = [];

      for(var i = 0 ; i < details.address_components.length ; i++) {
        if(details.address_components[i].types[0] == "street_number") {
          $scope.site.adresseSite = details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "route") {
          $scope.site.adresseSite += " "+details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "locality") {
          $scope.site.villeSite = details.address_components[i].long_name;
        }

        if(details.address_components[i].types[0] == "postal_code") {
          $scope.site.codePostalSite = details.address_components[i].long_name;
        }
      }

      $scope.site.coordonneesSite = [details.geometry.location.lat(),details.geometry.location.lng()]

      if($scope.site.villeSite === "" || $scope.site.codePostalSite === "") {
        $scope.adresseSiteVal = false;
      }
    };

    // Fonction post attachée au bouton de suppression du site
    $scope.modificationSite = function(site) {
        $scope.load = true;

        if(site.nomSite == undefined) {
            site.nomSite = $scope.nom;
        }

        if(site.typeSite == undefined) {
            site.typeSite = $scope.typeSiteId;
        }

        if(site.telSite == undefined) {
            site.telSite = $scope.telephone;
        }

        if(site.adresseSite == undefined) {
            site.adresseSite = $scope.adresse;
        }

        if(site.villeSite == undefined) {
            site.villeSite = $scope.ville;
        }

        if(site.codePostalSite == undefined) {
            site.codePostalSite = $scope.codePostal;
        }

        if(site.coordonneesSite == undefined) {
            site.coordonneesSite = $scope.coordonneesSite;
        }

        if(site.horairesSite == undefined) {
            site.horairesSite = $scope.horaires;
        }

        if(site.description == undefined) {
            site.description = $scope.description;
        }

        if(site.photo1Site == "" && !$scope.suppPhoto1) {
            site.photo1Site = $scope.photo1;
        }

        if(site.photo2Site == "" && !$scope.suppPhoto2) {
            site.photo2Site = $scope.photo2;
        }

        if(site.photo3Site == "" && !$scope.suppPhoto3) {
            site.photo3Site = $scope.photo3;
        }

        if(site.photo4Site == "" && !$scope.suppPhoto4) {
            site.photo4Site = $scope.photo4;
        }

        if(site.photo5Site == "" && !$scope.suppPhoto5) {
            site.photo5Site = $scope.photo5;
        }

        if(site.photo6Site == "" && !$scope.suppPhoto6) {
            site.photo6Site = $scope.photo6;
        }

        var photos = [];

        photos.push(site.photo1Site);
        photos.push(site.photo2Site);
        photos.push(site.photo3Site);
        photos.push(site.photo4Site);
        photos.push(site.photo5Site);
        photos.push(site.photo6Site);

        Upload.upload({
          url: $location.path(),
          data: {
            site: site,
            file: photos,
            supp1: $scope.suppPhoto1,
            supp2: $scope.suppPhoto2,
            supp3: $scope.suppPhoto3,
            supp4: $scope.suppPhoto4,
            supp5: $scope.suppPhoto5,
            supp6: $scope.suppPhoto6,
          },
          file: photos
        }).then(function(data) {
            if(data.data.succes) {
                $scope.formulaire = false;
                $scope.succesMsg = data.data.succesMsg;
                $timeout(function() {
                    $scope.load = false;
                    $scope.succes = true;
                }, 3000);
            }

            else {
                $scope.formulaire = false;
                $scope.erreurMsg = data.data.errors;
                $timeout(function() {
                    $scope.load = false;
                    $scope.erreur = !data.data.succes;
                    $scope.formulaire = true;
                }, 3000);
            }
        });
    }

    // Fonctions de modification du formulaire
    $scope.modifTypeSite = function() {
        $scope.modifTypeSiteB = !$scope.modifTypeSiteB;
    }
});

routeAppControllers.controller('profilReponsesCtrl', function($scope, $http, $timeout, $window, $sce) {
    // Variables
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.admin = false;
    $scope.notFound = false;
    $scope.succes = false;
    $scope.erreur = false;
    $scope.reponses = [];
    $scope.reponsesPositives = [];
    $scope.reponsesNegatives = [];
    $scope.players = [];

    $scope.onPlayerReady = function(API) {
        $scope.players.push(API);
    };

    $scope.stopPlayer = function() {
        for(var i = 0 ; i < $scope.players.length ; i++) {
            $scope.players[i].stop();
        }
    };

    $scope.profilInstalleAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Installe.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    $scope.profilRemplacantAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Remplacant.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    // Fonction get pour récupérer les informations
    $http.get('/profil/reponses').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.statutConnexion) {
              if(res.data.installe) {
                  $scope.installe = true;
                  $scope.idSite1 = res.data.membre.sites[0];

                  if(res.data.reponses.length > 0) {
                      for(var i = 0 ; i < res.data.reponses.length ; i++) {
                          if(res.data.reponses[i].reponses.positive) {
                              $scope.reponsesPositives.push(res.data.reponses[i]);
                          }

                          else if(res.data.reponses[i].reponses.negative) {
                              $scope.reponsesNegatives.push(res.data.reponses[i]);
                          }

                          else {
                              $scope.reponses.push(res.data.reponses[i]);
                          }
                      }
                  }

                  else {
                      $scope.notFound = true;
                  }
              }

              else if(res.data.admin) {
                  $scope.admin = true;
              }

              else {
                  $scope.remplacant = true;

                  if(res.data.reponses.length > 0) {
                      for(var i = 0 ; i < res.data.reponses.length ; i++) {
                          if(res.data.reponses[i].reponses.positive) {
                              $scope.reponsesPositives.push(res.data.reponses[i]);
                          }

                          else if(res.data.reponses[i].reponses.negative) {
                              $scope.reponsesNegatives.push(res.data.reponses[i]);
                          }

                          else {
                              $scope.reponses.push(res.data.reponses[i]);
                          }
                      }
                  }

                  else {
                      $scope.notFound = true;
                  }
              }
        }
    });

    $scope.passingData = function(reponse) {
      $scope.reponse = reponse;
    };

    $scope.checkAll = function(reponse) {
        $scope.reponse.datesValidation = [];

        for(var i = 0 ; i < reponse.reponses.dates.length ; i++) {
          $scope.reponse.datesValidation.push(reponse.reponses.dates[i]);
        }
    };

    $scope.validerReponse = function(id, reponse) {
        var donnee = {id, reponse};

        $http.post('/profil/reponses/validation', donnee).then(function(data) {
            if(data.data.succes) {
                $scope.succes = true;
                $scope.succesMsg = data.data.succesMsg;

                $timeout(function() {
                    $window.location.reload();
                }, 1500);
            }

            else {
                $scope.erreurMsg = data.data.erreurMsg;
                $scope.erreur = !data.data.succes;
            }
        });
    }

    $scope.refusReponse = function(reponse) {
        $http.post('/profil/reponses/refus', reponse).then(function(data) {
            if(data.data.succes) {
                $scope.succes = true;
                $scope.succesMsg = data.data.succesMsg;

                $timeout(function() {
                    $window.location.reload();
                }, 1500);
            }

            else {
                $scope.erreurMsg = data.data.erreurMsg;
                $scope.erreur = !data.data.succes;
            }
        });
    }

    $scope.supprimerReponse = function(reponse) {
        $http.post('/profil/reponses/suppression', reponse).then(function(data) {
            if(data.data.succes) {
                $scope.succes = true;
                $scope.succesMsg = data.data.succesMsg;

                $timeout(function() {
                    $window.location.reload();
                }, 1500);
            }

            else {
                $scope.erreurMsg = data.data.erreurMsg;
                $scope.erreur = !data.data.succes;
            }
        });
    }
});

routeAppControllers.controller('profilSuppressionCtrl', function($scope, $http, $timeout, $location, $sce) {
    // Variables
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.admin = false;
    $scope.load = false;
    $scope.succes = false;
    $scope.erreur = false;
    $scope.formulaire = true;
    $scope.players = [];

    $scope.onPlayerReady = function(API) {
        $scope.players.push(API);
    };

    $scope.stopPlayer = function() {
        for(var i = 0 ; i < $scope.players.length ; i++) {
            $scope.players[i].stop();
        }
    };

    $scope.profilInstalleAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Installe.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    $scope.profilRemplacantAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Remplacant.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    // Fonction get pour récupérer les informations
    $http.get('/profil/suppression').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.statutConnexion) {
              if(res.data.installe) {
                  $scope.installe = true;
                  $scope.idSite1 = res.data.membre.sites[0];
              }

              else if(res.data.admin) {
                  $scope.admin = true;
              }

              else {
                  $scope.remplacant = true;
              }
        }
    });

    // Fonction post attachée au formulaire
    $scope.suppression = function(membre) {
        $scope.load = true;

        $http.post('/profil/suppression', membre).then(function(data) {
            if(data.data.succes) {
                $scope.formulaire = false;
                $scope.succesMsg = data.data.succesMsg;
                $scope.succes = true;

                $timeout(function() {
                    $scope.load = false;
                    $location.path('/');
                }, 3000);
            }

            else {
                $scope.formulaire = false;
                $scope.erreurMsg = data.data.errors;
                $timeout(function() {
                    $scope.load = false;
                    $scope.erreur = !data.data.succes;
                    $scope.formulaire = true;
                }, 3000);
            }
        });
    }
});

routeAppControllers.controller('rechercheAnnoncesInstallesCtrl', function($scope, $http, $timeout, $location, $filter, annoncesService, $sce) {
    $scope.annonces = null;
    $scope.selectedAnnonce = null;
    $scope.installe = false;
    $scope.admin = false;
    $scope.remplacant = false;
    $scope.players = [];

    $scope.onPlayerReady = function(API) {
        $scope.players.push(API);
    };

    $scope.stopPlayer = function() {
        for(var i = 0 ; i < $scope.players.length ; i++) {
            $scope.players[i].stop();
        }
    };

    $scope.rechercheReponseAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Reponses.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    $scope.show = function(value, index, array){
        return $scope.annonces[index].show;
    }

    setInterval(function(){
        for (var i = 0; i < $scope.map.markers.length; i++) {
                // Affichage

            if (    $scope.map.bounds.northeast != undefined
                &&  $scope.map.markers[i].coords.latitude <= $scope.map.bounds.northeast.latitude
                &&  $scope.map.markers[i].coords.latitude >= $scope.map.bounds.southwest.latitude
                &&  $scope.map.markers[i].coords.longitude <= $scope.map.bounds.northeast.longitude
                &&  $scope.map.markers[i].coords.longitude >= $scope.map.bounds.southwest.longitude ) {
                $scope.$apply(function(){
                    $scope.annonces[i].show = true;
                });
            } else {
                $scope.$apply(function(){
                    $scope.annonces[i].show = false;
                });
            }
        }
    },10);

    $scope.map = {
      center: { latitude: 0, longitude: 0 },
      zoom: 5,
      markers: [],
      markersEvents: {
          click: function(marker, model) {
              $scope.map.mapWindow.coords = marker.model.coords;
              $scope.map.mapWindow.show = true;
              $scope.selectedAnnonce = $scope.annonces[marker.labelContent-1];
          }
      },
      mapWindow: {
          coords: {},
          show: false,
          closeClick: function() {
              this.show = false;
          }
      },
      bounds : {},
    };

    $scope.circle = {
      center: { latitude: 0, longitude: 0 },
      radius: 0,
      stroke: {
          color: '#e36060',
          weight: 2,
          opacity: 0.5
      },
      fill: {
          color: '#e36060',
          opacity: 0.2
      },
      clickable: false
    };

    // Fonction get pour récupérer les informations
    $http.get('/annonces/recherche').then(function(res) {

        $scope.annonces = annoncesService.getAnnonces();
        $scope.annonces = $filter('orderBy')($scope.annonces, 'distance', false);

        for (var i = 0; i < $scope.annonces.length; i++) {
            $scope.annonces[i].show = true;
            $scope.annonces[i].indexMap = i;

            if($scope.annonces[i].idSite.photos.length <= 0) {
                $scope.annonces[i].showPhotos = false;
            }

            else {
                $scope.annonces[i].showPhotos = true;
            }
        };

        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.specialites = res.data.specialites;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.statutConnexion) {
              if(res.data.installe) {
                  $scope.installe = true;
                  $scope.idSite1 = res.data.membre.sites[0];
              }

              else if(res.data.admin) {
                  $scope.admin = true;
              }

              else {
                  $scope.remplacant = true;
              }
        }

        var locMap = annoncesService.getLocation();
        var dist = annoncesService.getDistance();
        var zoomMap = 15;

        if(dist <= 10) {
            zoomMap = 12;
        }

        else if(dist <= 22) {
            zoomMap = 11;
        }

        else if(dist <= 45) {
            zoomMap = 10;
        }

        else if(dist <= 80) {
            zoomMap = 9;
        }

        else if(dist <= 130) {
            zoomMap = 8;
        }

        else {
            zoomMap = 8;
        }

        $scope.map.center = { latitude: locMap[0], longitude: locMap[1] };
        $scope.map.zoom = zoomMap;

        $scope.circle.center = { latitude: locMap[0], longitude: locMap[1] };
        $scope.circle.radius = dist*1000;

        for(var i=0;i<$scope.annonces.length;i++) {
            $scope.map.markers[i] = {
                id: i,
                coords: {
                  latitude: parseFloat($scope.annonces[i].idSite.coordonneesSite[0]),
                  longitude: parseFloat($scope.annonces[i].idSite.coordonneesSite[1]),
                },
                options:{
                  animation: 0,
                  labelClass:'marker-labels',
                  labelAnchor:'3 33'
                }
            };
        }
    });

    $scope.centrerAnnonce = function(index,coordonnees) {
        $scope.map.center = {
          latitude: parseFloat(coordonnees[0]),
          longitude: parseFloat(coordonnees[1])
        };

        $scope.map.markers[index].options.animation = 1;

        $timeout(function() {
              $scope.map.markers[index].options.animation = 0;
        }, 2000);
    }
});

routeAppControllers.controller('rechercheAnnoncesRemplacantsCtrl', function($scope, $http, remplacantsService, $sce) {
    $scope.annonces = null;
    $scope.selectedAnnonce = null;
    $scope.installe = false;
    $scope.admin = false;
    $scope.remplacant = false;
    $scope.players = [];

    $scope.onPlayerReady = function(API) {
        $scope.players.push(API);
    };

    $scope.stopPlayer = function() {
        for(var i = 0 ; i < $scope.players.length ; i++) {
            $scope.players[i].stop();
        }
    };

    $scope.rechercheReponseAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Reponses.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    // Fonction get pour récupérer les informations
    $http.get('/annonces/recherche').then(function(res) {

        $scope.annonces = remplacantsService.getRemplacants();

        for (var i = 0; i < $scope.annonces.length; i++) {
            if($scope.annonces[i].idRemplacant.photoMembre === "") {
                $scope.annonces[i].showPhotos = false;
            }

            else {
                $scope.annonces[i].showPhotos = true;
            }
        }

        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.specialites = res.data.specialites;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.statutConnexion) {
              if(res.data.remplacant) {
                  $scope.remplacant = true;
              }

              else if(res.data.admin) {
                  $scope.admin = true;
              }

              else {
                  $scope.installe = true;
                  $scope.idSite1 = res.data.membre.sites[0];
              }
        }
    });
});

routeAppControllers.controller('detailsRemplacantCtrl', function($scope, $http, $timeout, $location) {
    //Variables
    $scope.installe = false;
    $scope.admin = false;
    $scope.remplacant = false;
    $scope.forbidden = false;
    $scope.notFound = false;

    // Fonction get pour récupérer les informations
    $http.get($location.path()).then(function(res) {

      //Variables
      $scope.pageTitle = "1Rempla - "+res.data.title;
      $scope.title = res.data.title;
      $scope.connecte = res.data.statutConnexion;

      if(res.data.statutConnexion) {
          $scope.membre = res.data.membre;
          $scope.specialite = res.data.specialite;

          if(res.data.forbidden) {
              $scope.forbidden = true;
          }

          if(res.data.notFound) {
              $scope.notFound = true;
          }

          if(res.data.membre !== undefined) {
              if(res.data.membre.biographie !== undefined && res.data.membre.biographie !== "") {
                  $scope.showBio = true;
              }

              else {
                  $scope.showBio = false;
              }
          }

          if(res.data.installe) {
              $scope.installe = true;
              $scope.idSite1 = res.data.sites[0];
          }

          else if(res.data.admin) {
              $scope.admin = true;
          }

          else {
              $scope.remplacant = true;
          }
      }
    });
});

routeAppControllers.controller('detailsAnnoncesCtrl', function($scope, $http, $timeout, $location, $sce) {
    //Variables
    $scope.load = false;
    $scope.formulaire = true;
    $scope.notFound = false;
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.admin = false;
    $scope.calendarView = 'month';
    $scope.viewDates = {
      viewDate: moment().startOf('month').toDate(),
      viewDate2: moment().startOf('month').toDate().setMonth(moment().startOf('month').toDate().getMonth() + 1)
    };
    $scope.events = [];
    $scope.dates = [];
    $scope.circles = [];
    $scope.locations = [];
    $scope.viewChangeEnabled = false;
    $scope.confirmation = false;
    $scope.confirmationI = false;
    $scope.interdiction = false;
    $scope.interdictionDeja = false;
    $scope.messageAnnonceRemplacant = false;
    var tmpDate, tmpDateDebut, tmpDateFin;
    var monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    $scope.players = [];

    $scope.onPlayerReady = function(API) {
        $scope.players.push(API);
    };

    $scope.stopPlayer = function() {
        for(var i = 0 ; i < $scope.players.length ; i++) {
            $scope.players[i].stop();
        }
    };

    $scope.rechercheReponseAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Reponses.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    //Fonctions de tri
    var trierDates = function() {
        for(var l = 0 ; l < $scope.dates.length-1 ; l++) {
            if($scope.dates[l].time > $scope.dates[l+1].time) {
                tmpDate = $scope.dates[l];
                $scope.dates[l] = $scope.dates[l+1];
                $scope.dates[l+1] = tmpDate;
            }
        }
    }

    var verifTri = function() {
        for(var k = 0 ; k < $scope.dates.length-1 ; k++) {
            if($scope.dates[k].time > $scope.dates[k+1].time) {
                trierDates();
                verifTri();
            }
        }
    }

    $scope.$watch('viewDates.viewDate', function() {
        $scope.viewDates.viewDate2 = new Date($scope.viewDates.viewDate);
        $scope.viewDates.viewDate2 = $scope.viewDates.viewDate2.setMonth($scope.viewDates.viewDate2.getMonth() + 1);
    }, true);

    $scope.map = {
        center: { latitude: 46.52863469527167, longitude: 2.43896484375 },
        zoom: 5,
        markers: [],
        markersEvents: {
            click: function(marker, model) {
                $scope.map.center = {latitude: marker.model.coords.latitude, longitude: marker.model.coords.longitude};
                $scope.map.zoom = 8;
            }
        }
    };

    // Fonction get pour récupérer les informations
    $http.get($location.path()).then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.specialites = res.data.specialites;
        $scope.connecte = res.data.statutConnexion;

        var url = $location.path().split("/");

        $scope._id = url[url.length-1];

        if(res.data.statutConnexion) {
            if(res.data.installe) {
                $scope.installe = true;
                $scope.idSite1 = res.data.sites[0];
            }

            else if(res.data.admin) {
                $scope.admin = true;
            }

            else {
                $scope.remplacant = true;
            }
        }

        if(res.data.notFound) {
            $scope.notFound = true;
            $scope.message = "Erreur ! Annonce non trouvée"
        }

        else {
            tmpDateDebut = new Date(res.data.annonce.dateDebut);
            tmpDateFin = new Date(res.data.annonce.dateFin);
            $scope.diff = (tmpDateFin.getTime() - tmpDateDebut.getTime())/60/60/24000 + 1;
            res.data.annonce.dateDebut = tmpDateDebut.getDate()+" "+monthNames[tmpDateDebut.getMonth()]+" "+tmpDateDebut.getFullYear();
            res.data.annonce.dateFin = tmpDateFin.getDate()+" "+monthNames[tmpDateFin.getMonth()]+" "+tmpDateFin.getFullYear();
            $scope.annonce = res.data.annonce;
            $scope.membreAnnonce = res.data.membre;
            $scope.specialite = res.data.specialite.typeSpecialite;
            $scope.annonceInstalle = res.data.annonceInstalle;
            $scope.biographieok = true;

            if(($scope.membreAnnonce.biographie === undefined) || ($scope.membreAnnonce.biographie === '')) {
                $scope.biographieok = false;
            }

            if($scope.annonceInstalle) {
                $scope.site = res.data.site;
                $scope.typeSite = res.data.typeSite.typeSite;
                $scope.images = [];

                for(var i = 0 ; i < 6 ; i++) {
                    if(res.data.site.photos[i] != undefined) {
                        $scope.images.push({id: i, url: res.data.site.photos[i]});
                    }
                }

                if($scope.site.coordonneesSite !== undefined) {
                    $scope.map.markers.push({
                        id: 0,
                        coords: {
                            latitude: parseFloat($scope.site.coordonneesSite[0]),
                            longitude: parseFloat($scope.site.coordonneesSite[1]),
                        },
                        options:{
                            animation: 0,
                            labelClass:'marker-labels',
                            labelAnchor:'3 33'
                        }
                    });
                }

                $scope.baniereok = true;
                $scope.horairesok = true;
                $scope.descriptionok = true;
                $scope.galerieok = true;

                if($scope.site.photos.length === 0) {
                    $scope.baniereok = false;
                    $scope.galerieok = false;
                }

                else if($scope.site.photos[0] === undefined) {
                    $scope.baniereok = false;
                }

                if($scope.site.horaires === '') {
                    $scope.horairesok = false;
                }

                if(($scope.site.descSite === undefined) || ($scope.site.descSite === '')) {
                    $scope.descriptionok = false;
                }
            }

            else {
                $scope.messageAnnonceRemplacant = true;

                if(res.data.zonesGeo !== undefined) {
                    res.data.zonesGeo.cercles.forEach(function(cercle) {
                        cercle.draggable = false;
                        cercle.clickable = false;
                        cercle.editable = false;
                    });

                    $scope.circles = res.data.zonesGeo.cercles;

                    for(var k = 0 ; k < $scope.circles.length ; k++) {
                        var urlmap = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+$scope.circles[k].center.latitude+","+$scope.circles[k].center.longitude+"&key=AIzaSyCgUMCp-rymTyw0DZAR37BKffDMCR_zSkk";

                        var request = new XMLHttpRequest();
                        request.open('GET', urlmap, false);  // `false` makes the request synchronous
                        request.send(null);

                        if(request.status === 200) {
                            var newVille = "";
                            var newCodePostal = "";
                            var donneesRetour = JSON.parse(request.response);

                            for(var l = 0 ; l < donneesRetour.results.length ; l++) {
                                if(donneesRetour.results[l].types[0] == "locality") {
                                    newVille = donneesRetour.results[l].address_components[0].long_name;
                                }

                                if(donneesRetour.results[l].types[0] == "postal_code") {
                                    newCodePostal = donneesRetour.results[l].address_components[0].long_name;
                                }

                                $scope.locations[k] = {
                                    indice: k,
                                    ville: newVille,
                                    codePostal: newCodePostal,
                                    rayon: Math.round($scope.circles[k].radius/1000)
                                };
                            }
                        }
                    }
                }

                if($scope.installe) {
                    $scope.confirmationI = true;
                }
            }

            if(res.data.events !== undefined) {
                for(var i = 0 ; i < res.data.events.length ; i++) {
                    res.data.events[i].startsAt = new Date(res.data.events[i].startsAt);
                    res.data.events[i].endsAt = new Date(res.data.events[i].endsAt);
                    res.data.events[i].yesterday = new Date(res.data.events[i].yesterday);
                    res.data.events[i].tomorrow = new Date(res.data.events[i].tomorrow);
                }

                $scope.events = res.data.events;
            }

            $scope.reponse = {
              annonce: $scope.annonce,
              dates: $scope.dates
            }
        }
    });

    //Charge les cellules qui sont associées au tableau d'évènements
    $scope.cellModifier = function(cell) {
        var current = new Date();

        if(cell.date._d.getTime() < current.getTime()){
            cell.cssClass = 'odd-cell-lock';
        }

        else {
            if(cell.badgeTotal > 0 && cell.events.length > 0) {
                for (var i = 0; i < cell.events.length; i++) {
                    if (cell.events[i].valide && !cell.events[i].occupe && !cell.events[i].demande) {
                        cell.cssClass = 'odd-cell';
                    }

                    else if (cell.events[i].valide && cell.events[i].occupe && !cell.events[i].demande) {
                        cell.cssClass = 'odd-cell-lock-occupe-details';
                    }

                    else if (cell.events[i].valide && !cell.events[i].occupe && cell.events[i].demande) {
                        cell.cssClass = 'odd-cell-demande';
                    }

                    else {
                        cell.cssClass = 'odd-cell-valide';
                    }
                }
            }
        }
    };

    $scope.toggle = function($event, field, event) {
        $event.preventDefault();
        $event.stopPropagation();
        event[field] = !event[field];
    };

    $scope.viewChangeClicked = function(date, nextView) {
        return $scope.viewChangeEnabled;
    };

    $scope.timeSpanClicked = function(date) {
        var current = new Date();

        if(current.getTime() <= date.getTime()) {
            if ($scope.remplacant && $scope.annonceInstalle) {
                for (var i = 0; i < $scope.events.length; i++) {
                    if ($scope.events[i].startsAt.getTime() == date.getTime()) {
                        if ($scope.events[i].occupe) {
                            $scope.interdictionDeja = true;
                        }

                        else {
                            $scope.interdictionDeja = false;
                        }
                    }
                }

                if (!$scope.interdictionDeja) {
                    var before = $scope.events[0].yesterday;
                    var after = $scope.events[$scope.events.length - 1].tomorrow;

                    if (before.getTime() <= date.getTime() && after.getTime() >= date.getTime()) {
                        for (var i = 0; i < $scope.events.length; i++) {
                            if ($scope.events[i].startsAt.getTime() == date.getTime()) {
                                if ($scope.events[i].demande) {
                                    $scope.events[i].demande = false;

                                    if ($scope.dates.length == 1) {
                                        $scope.confirmation = false;
                                    }

                                    for (var j = 0; j < $scope.dates.length; j++) {
                                        if ($scope.dates[j].time == date.getTime()) {
                                            $scope.dates.splice(j, 1);
                                        }
                                    }
                                }

                                else {
                                    $scope.events[i].demande = true;
                                    $scope.confirmation = true;
                                    $scope.dates.push({
                                        jour: date.getDate(),
                                        mois: monthNames[date.getMonth()],
                                        annee: date.getFullYear(),
                                        time: date.getTime()
                                    });

                                    if ($scope.dates.length > 0) {
                                        verifTri();
                                    }
                                }
                            }
                        }
                    }
                }

            }

            else {
                if ($scope.annonceInstalle) {
                    $scope.interdiction = true;
                }
            }
        }
    }

    //Sélection de plusieurs cellules
    $scope.rangeSelected = function(startDate, endDate) {
        var current = new Date();

        if(current.getTime() <= startDate.getTime()) {
            if($scope.remplacant && $scope.annonceInstalle) {
                var before = $scope.events[0].yesterday;
                var after = $scope.events[$scope.events.length - 1].tomorrow;
                var tmpStartDate = new Date(startDate);
                var daysCurrentMonth = 32 - new Date(tmpStartDate.getFullYear(), tmpStartDate.getMonth(), 32).getDate();
                var daysNextMonth = 32 - new Date(endDate.getFullYear(), endDate.getMonth(), 32).getDate();

                if (before.getTime() <= startDate.getTime() && after.getTime() >= endDate.getTime()) {
                    if (endDate.getDate() > startDate.getDate()) {
                        var nbDays = endDate.getDate() - startDate.getDate() + 1;
                    }

                    else {
                        var nbDays = endDate.getDate() + (daysCurrentMonth - startDate.getDate()) + 1;
                    }

                    for (var i = 0; i < nbDays; i++) {
                        if (startDate.getDate() + i > daysCurrentMonth) {
                            var date = new Date(tmpStartDate.setDate((startDate.getDate() + i) - daysCurrentMonth));

                            if (date.getDate() >= 2 && date.getDate() < startDate.getDate()) {
                                date.setMonth(date.getMonth() + 1);
                            }
                        }

                        else {
                            var date = new Date(tmpStartDate.setDate(startDate.getDate() + i));
                        }

                        for (var j = 0; j < $scope.events.length; j++) {
                            if ($scope.events[j].startsAt.getTime() == tmpStartDate.getTime()) {
                                if ($scope.events[j].demande) {
                                    $scope.events[j].demande = false;

                                    if ($scope.dates.length == 1) {
                                        $scope.confirmation = false;
                                    }

                                    for (var m = 0; m < $scope.dates.length; m++) {
                                        if ($scope.dates[m].time == tmpStartDate.getTime()) {
                                            $scope.dates.splice(m, 1);
                                        }
                                    }
                                }

                                else {
                                    $scope.events[j].demande = true;
                                    $scope.confirmation = true;
                                    $scope.dates.push({
                                        jour: tmpStartDate.getDate(),
                                        mois: monthNames[tmpStartDate.getMonth()],
                                        annee: tmpStartDate.getFullYear(),
                                        time: tmpStartDate.getTime()
                                    });

                                    if ($scope.dates.length > 0) {
                                        verifTri();
                                    }
                                }
                            }
                        }
                    }
                }
            }

            else {
                if ($scope.annonceInstalle) {
                    $scope.interdiction = true;
                }
            }
        }
    }

    $scope.creationReponse = function(reponse) {
        if($scope.remplacant && $scope.annonceInstalle) {
            $scope.load = true;

            $http.post($location.path(), reponse).then(function(data) {
                if(data.data.succes) {
                    $scope.formulaire = false;
                    $scope.succesMsg = data.data.succesMsg;
                    $scope.succes = true;

                    $timeout(function() {
                        $scope.load = false;
                        $location.path('/');
                    }, 3000);
                }

                else {
                    $scope.formulaire = false;
                    $scope.erreurMsg = data.data.errors;

                    $timeout(function() {
                        $scope.formulaire = true;
                        $scope.load = false;
                        $scope.erreur = !data.data.succes;
                    }, 3000);
                }
            });
        }
    }

    $scope.priseDeContact = function(message) {
        if($scope.installe && !$scope.annonceInstalle) {
            $scope.load = true;

            $scope.dates.push($scope.annonce.dateDebut);
            $scope.dates.push($scope.annonce.dateFin);

            $http.post($location.path(), message).then(function(data) {
                if(data.data.succes) {
                    $scope.formulaire = false;
                    $scope.succesMsg = data.data.succesMsg;
                    $scope.succes = true;

                    $timeout(function() {
                        $scope.load = false;
                        $location.path('/');
                    }, 3000);
                }

                else {
                    $scope.formulaire = false;
                    $scope.erreurMsg = data.data.errors;

                    $timeout(function() {
                        $scope.formulaire = true;
                        $scope.load = false;
                        $scope.erreur = !data.data.succes;
                    }, 3000);
                }
            });
        }
    }
});

routeAppControllers.controller('profilCalendrierCtrl', function($scope, $http, $timeout, $location, $uibModal, $window, $sce) {
    // Variables
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.admin = false;
    $scope.load = false;
    $scope.erreur = false;
    $scope.calendarView = 'month';
    $scope.viewDates = {
      viewDate: moment().startOf('month').toDate(),
      viewDate2: moment().startOf('month').toDate().setMonth(moment().startOf('month').toDate().getMonth() + 1),
      viewDate3: moment().startOf('month').toDate().setMonth(moment().startOf('month').toDate().getMonth() + 2)
    };
    $scope.events = [];
    $scope.site2 = false;
    $scope.site3 = false;
    $scope.viewChangeEnabled = false;
    $scope.calendrier = true;
    $scope.liste = false;
    $scope.periodesOk = false;
    $scope.notFound = false;
    var tmp, tmpDateDebut, tmpDateFin;
    var monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    $scope.players = [];

    $scope.onPlayerReady = function(API) {
        $scope.players.push(API);
    };

    $scope.stopPlayer = function() {
        for(var i = 0 ; i < $scope.players.length ; i++) {
            $scope.players[i].stop();
        }
    };

    $scope.profilInstalleAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Installe.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    $scope.profilRemplacantAide = {
        sources: [
            {src: $sce.trustAsResourceUrl("/videos/Tuto_Profil_Remplacant.mp4"), type: "video/mp4"}
        ],
        theme: "/videogular-themes-default/videogular.min.css"
    };

    //Fonctions de tri
    var trierEvents = function() {
        for(var j = 0 ; j < $scope.events.length-1 ; j++) {
            if($scope.events[j].startsAt.getTime() > $scope.events[j+1].startsAt.getTime()) {
                tmp = $scope.events[j];
                $scope.events[j] = $scope.events[j+1];
                $scope.events[j+1] = tmp;
            }
        }
    }

    var verifTri = function() {
        for(var i = 0 ; i < $scope.events.length-1 ; i++) {
            if($scope.events[i].startsAt.getTime() > $scope.events[i+1].startsAt.getTime()) {
                trierEvents();
                verifTri();
            }
        }
    }

    $scope.$watch('viewDates.viewDate', function() {
      $scope.viewDates.viewDate2 = new Date($scope.viewDates.viewDate);
      $scope.viewDates.viewDate2 = $scope.viewDates.viewDate2.setMonth($scope.viewDates.viewDate2.getMonth() + 1);

      $scope.viewDates.viewDate3 = new Date($scope.viewDates.viewDate);
      $scope.viewDates.viewDate3 = $scope.viewDates.viewDate3.setMonth($scope.viewDates.viewDate3.getMonth() + 2);
    }, true);

    //GET - les informations du calendrier
    $http.get($location.path()).then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.statutConnexion) {
            if(res.data.installe) {
                $scope.installe = true;
                $scope.idInstalle = res.data.membre._id;

                if(res.data.annonces !== "") {
                  $scope.periodesOk = true;

                  for(var i = 0 ; i < res.data.annonces.periodes.length ; i++) {
                      tmpDateDebut = new Date(res.data.annonces.periodes[i].dateDebut);
                      tmpDateFin = new Date(res.data.annonces.periodes[i].dateFin);
                      res.data.annonces.periodes[i].dateDebut = tmpDateDebut.getDate()+" "+monthNames[tmpDateDebut.getMonth()]+" "+tmpDateDebut.getFullYear();
                      res.data.annonces.periodes[i].dateFin = tmpDateFin.getDate()+" "+monthNames[tmpDateFin.getMonth()]+" "+tmpDateFin.getFullYear();
                  }

                  $scope.annoncesGet = res.data.annonces;
                  $scope.totalAnnonces = res.data.annonces.periodes.length;
                }

                else {
                  $scope.periodesOk = false;
                  $scope.totalAnnonces = 0;
                }

                for(var i = 0 ; i < res.data.events.length ; i++) {
                    res.data.events[i].startsAt = new Date(res.data.events[i].startsAt);
                    res.data.events[i].endsAt = new Date(res.data.events[i].endsAt);
                    res.data.events[i].yesterday = new Date(res.data.events[i].yesterday);
                    res.data.events[i].tomorrow = new Date(res.data.events[i].tomorrow);
                }

                $scope.events = res.data.events;
                $scope.idSite1 = res.data.membre.sites[0];

                if(res.data.membre.sites.length == 2) {
                    $scope.idSite2 = res.data.membre.sites[1];
                    $scope.site2 = true;
                }

                else if(res.data.membre.sites.length == 3) {
                    $scope.idSite2 = res.data.membre.sites[1];
                    $scope.idSite3 = res.data.membre.sites[2];
                    $scope.site2 = true;
                    $scope.site3 = true;
                }
            }

            else if(res.data.admin) {
                $scope.admin = true;
            }

            else {
                $scope.remplacant = true;

                if(res.data.notFound) {
                    $scope.notFound = true;
                }

                else {
                    $scope.idRemplacant = res.data.membre._id;

                    for(var i = 0 ; i < res.data.events.length ; i++) {
                        res.data.events[i].startsAt = new Date(res.data.events[i].startsAt);
                        res.data.events[i].endsAt = new Date(res.data.events[i].endsAt);
                        res.data.events[i].yesterday = new Date(res.data.events[i].yesterday);
                        res.data.events[i].tomorrow = new Date(res.data.events[i].tomorrow);
                    }

                    $scope.events = res.data.events;

                    if(res.data.annonces !== "") {
                      $scope.periodesOk = true;

                      for(var i = 0 ; i < res.data.annonces.periodes.length ; i++) {
                          tmpDateDebut = new Date(res.data.annonces.periodes[i].dateDebut);
                          tmpDateFin = new Date(res.data.annonces.periodes[i].dateFin);
                          res.data.annonces.periodes[i].dateDebut = tmpDateDebut.getDate()+" "+monthNames[tmpDateDebut.getMonth()]+" "+tmpDateDebut.getFullYear();
                          res.data.annonces.periodes[i].dateFin = tmpDateFin.getDate()+" "+monthNames[tmpDateFin.getMonth()]+" "+tmpDateFin.getFullYear();
                      }

                      $scope.annoncesGet = res.data.annonces;
                      $scope.totalAnnonces = res.data.annonces.periodes.length;
                    }

                    else {
                      $scope.periodesOk = false;
                      $scope.totalAnnonces = 0;
                    }
                }
            }
        }
    });

    $scope.toggle = function($event, field, event) {
        $event.preventDefault();
        $event.stopPropagation();
        event[field] = !event[field];
    }

    $scope.viewChangeClicked = function(date, nextView) {
        return $scope.viewChangeEnabled;
    }

    //Charge les cellules qui sont associées au tableau d'évènements
    $scope.cellModifier = function(cell) {
        var current = new Date();

        if(!$scope.notFound) {
            if(cell.date._d.getTime() < current.getTime()){
                cell.cssClass = 'odd-cell-lock';
            }

            else if(cell.badgeTotal > 0 && cell.events.length > 0) {
                for(var i = 0 ; i < cell.events.length ; i++) {
                    if(cell.events[i].valide && !cell.events[i].occupe && !cell.events[i].demande) {
                      cell.cssClass = 'odd-cell';
                    }

                    else if(cell.events[i].valide && cell.events[i].occupe && !cell.events[i].demande) {
                      cell.cssClass = 'odd-cell-occupe';
                    }

                    else if(cell.events[i].valide && !cell.events[i].occupe && cell.events[i].demande) {
                      cell.cssClass = 'odd-cell-demande';
                    }

                    else {
                      cell.cssClass = 'odd-cell-valide';
                    }
                }
            }
        }

        else {
            cell.cssClass = 'odd-cell-lock';
        }
    };

    //Sélection d'une seule cellule
    $scope.timeSpanClicked = function(date) {
        var tmpDate = new Date(date);
        var double = false;
        var current = new Date();

        if(!$scope.notFound) {
            if(current.getTime() <= date.getTime()) {
                var before = new Date(tmpDate.setDate(date.getDate()-1));
                var after = new Date(tmpDate.setDate(date.getDate()+1));

                if(date.getDate() == 1) {
                    after.setMonth(after.getMonth() + 1);
                }

                for(var i = 0 ; i < $scope.events.length ; i++) {
                    if($scope.events[i].startsAt.getTime() == date.getTime()) {
                        if($scope.events[i].occupe) {
                            $scope.events.splice(i,1);
                            double = true;
                        }

                        else {
                            $scope.events[i].occupe = true;
                            $scope.events[i].valide = true;
                            $scope.events[i].demande = false;
                            double = true;
                        }
                    }
                }

                if(!double) {
                    $scope.events.push({
                      title: 'Remplacement possible',
                      valide: false,
                      occupe: false,
                      demande: false,
                      startsAt: date,
                      endsAt: date,
                      yesterday: before,
                      tomorrow: after,
                      remplacant: "",
                      color: {
                        primary: '#e3bc08',
                        secondary: '#fdf1ba'
                      },
                      allDay: true
                    });
                }
            }
        }
    }

    //Sélection de plusieurs cellules
    $scope.rangeSelected = function(startDate, endDate) {
        var tmpStartDate = new Date(startDate);
        var tmpEndDate = new Date(endDate);
        var daysCurrentMonth = 32 - new Date(tmpStartDate.getFullYear(), tmpStartDate.getMonth(), 32).getDate();
        var daysNextMonth = 32 - new Date(tmpEndDate.getFullYear(), tmpEndDate.getMonth(), 32).getDate();
        var double = false;
        var current = new Date();

        console.log("tmpStartDate :", tmpStartDate);
        console.log("tmpEndDate :", tmpEndDate);

        if(!$scope.notFound) {
            if(current.getTime() <= startDate.getTime()) {
                if(endDate.getDate() > startDate.getDate()) {
                    var nbDays = endDate.getDate() - startDate.getDate() + 1;
                }

                else {
                    var nbDays = endDate.getDate() + (daysCurrentMonth - startDate.getDate()) + 1;
                }

                for(var i = 0 ; i < nbDays ; i++) {
                    if(startDate.getDate() + i > daysCurrentMonth) {
                        var date = new Date(tmpStartDate.setDate((startDate.getDate()+i) - daysCurrentMonth));

                        if(date.getDate() >= 2 && date.getDate() < startDate.getDate()) {
                            date.setMonth(date.getMonth() + 1);
                        }
                    }

                    else {
                        var date = new Date(tmpStartDate.setDate(startDate.getDate() + i));
                    }

                    var before = new Date(tmpStartDate.setDate(date.getDate() - 1));
                    var after = new Date(tmpStartDate.setDate(date.getDate() + 1));

                    if(date.getDate() == 1) {
                        after.setMonth(after.getMonth() + 1);

                        if(i == 0) {
                          tmpStartDate.setMonth(after.getMonth());

                            if(after.getMonth() == 0) {
                                tmpStartDate.setFullYear(after.getFullYear());
                            }
                        }
                    }

                    if(date.getDate() >= 2 && date.getDate() < startDate.getDate()) {
                        after.setMonth(after.getMonth() + 1);
                        before.setMonth(before.getMonth() + 1);
                    }

                    console.log("before :", before);
                    console.log("after :", after);

                    for(var j = 0 ; j < $scope.events.length ; j++) {
                        if($scope.events[j].startsAt.getTime() == date.getTime()) {
                            if($scope.events[j].occupe) {
                                $scope.events.splice(j,1);
                                double = true;
                            }

                            else {
                                $scope.events[j].occupe = true;
                                $scope.events[j].valide = true;
                                $scope.events[j].demande = false;
                                double = true;
                            }
                        }
                    }

                    if(!double) {
                        $scope.events.push({
                          title: 'Remplacement possible',
                          valide: false,
                          occupe: false,
                          demande: false,
                          startsAt: date,
                          endsAt: date,
                          yesterday: before,
                          tomorrow: after,
                          remplacant: "",
                          color: {
                            primary: '#e3bc08',
                            secondary: '#fdf1ba'
                          },
                          allDay: true
                        });
                    }
                }
            }
        }
    };

    $scope.validerCalendar = function() {
        if(!$scope.notFound) {
            $scope.annonces = [];
            verifTri();

            for(var i = 0 ; i < $scope.events.length ; i++) {
                if(!$scope.events[i].occupe) {
                    $scope.events[i].valide = true;
                }
            }

            //Concaténation des évènements
            if($scope.events.length > 1) {
                for(var i = 0 ; i < $scope.events.length-1 ; i++) {
                    if(($scope.events[i].tomorrow.getTime() != $scope.events[i+1].startsAt.getTime())) {
                        if($scope.annonces.length == 0) {
                            $scope.annonces.push({dateDebut: $scope.events[0].startsAt, dateFin: $scope.events[i].endsAt});
                            tmp = $scope.events[i+1].startsAt;

                            if((i+1) == $scope.events.length - 1) {
                                $scope.annonces.push({dateDebut: $scope.events[i+1].startsAt, dateFin: $scope.events[i+1].endsAt});
                            }
                        }

                        else {
                            $scope.annonces.push({dateDebut: tmp, dateFin: $scope.events[i].endsAt});


                            if((i+1) == $scope.events.length - 1) {
                                $scope.annonces.push({dateDebut: $scope.events[i+1].startsAt, dateFin: $scope.events[i+1].endsAt});
                            }

                            else {
                                tmp = $scope.events[i+1].startsAt;
                            }
                        }
                    }

                    else {
                        if($scope.annonces.length == 0) {
                            if(i == $scope.events.length-2) {
                                $scope.annonces.push({dateDebut: $scope.events[0].startsAt, dateFin: $scope.events[i+1].endsAt});
                            }
                        }

                        else {
                            if(i == $scope.events.length-2) {
                                $scope.annonces.push({dateDebut: tmp, dateFin: $scope.events[i+1].endsAt});
                            }
                        }
                    }
                }
            }

            else if($scope.events.length == 1) {
                $scope.annonces.push({dateDebut: $scope.events[0].startsAt, dateFin: $scope.events[0].endsAt});
            }


            var retour = {
              evenements: $scope.events,
              annonces: $scope.annonces
            };

            //POST - Calendrier
            $http.post($location.path(), retour).then(function(data) {
                $scope.load = true;

                if(data.data.succes) {
                    $timeout(function() {
                        $scope.load = false;
                        $window.location.reload();
                    }, 1000);
                }

                else {
                    $scope.erreurMsg = data.data.errors;
                    $timeout(function() {
                        $scope.load = false;
                        $scope.erreur = !data.data.succes;
                    }, 1000);
                }
            });
        }
    };

    $scope.showCalendrier = function() {
        if(!$scope.notFound) {
            $scope.calendrier = true;
            $scope.liste = false;
        }
    };

    $scope.showListe = function() {
        if(!$scope.notFound) {
            $scope.calendrier = false;
            $scope.liste = true;
        }
    };
});

routeAppControllers.controller('signalerAnnonceCtrl', function($scope, $http, $location, $timeout) {
    $scope.notFound = false;
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.succes = false;
    $scope.error = false;
    $scope.load = false;

    $http.get($location.path()).then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(!res.data.notFound) {
            $scope.annonce = {};
            $scope.nationalites = res.data.nationalites.nationalites;

            if($scope.connecte) {
                if(res.data.installe) {
                    $scope.installe = true;
                    $scope.annonce.nomSignaleur = res.data.membre.nom;
                    $scope.annonce.prenomSignaleur = res.data.membre.prenom;
                    $scope.annonce.adresseSignaleur = res.data.membre.adresseMembre;
                    $scope.annonce.villeSignaleur = res.data.membre.villeMembre;
                    $scope.annonce.codePostalSignaleur = res.data.membre.codePostalMembre;
                    $scope.annonce.professionSignaleur = res.data.specialite.typeSpecialite;
                    $scope.idSite1 = res.data.sites[0];
                }

                else {
                    $scope.remplacant = true;
                    $scope.annonce.nomSignaleur = res.data.membre.nom;
                    $scope.annonce.prenomSignaleur = res.data.membre.prenom;
                    $scope.annonce.adresseSignaleur = res.data.membre.adresseMembre;
                    $scope.annonce.villeSignaleur = res.data.membre.villeMembre;
                    $scope.annonce.codePostalSignaleur = res.data.membre.codePostalMembre;
                    $scope.annonce.professionSignaleur = res.data.specialite.typeSpecialite;
                }
            }
        }

        else {
            $scope.notFound = true;

            if(res.data.installe) {
                $scope.installe = true;
                $scope.idSite1 = res.data.sites[0];
            }

            else {
                $scope.remplacant = true;
            }
        }
    });

    $scope.signalerAnnonce = function(annonce) {
        $http.post($location.path(), annonce).then(function(data) {
            $scope.load = true;

            if(data.data.succes) {
                $scope.succes = true;
                $scope.succesMsg = data.data.succesMsg;

                $timeout(function() {
                    $scope.load = false;
                    $location.path("/");
                }, 5000);
            }

            else {
                $scope.error = true;
                $scope.erreurMsg = data.data.errors;

                $timeout(function() {
                    $scope.load = false;
                }, 1000);
            }
        });
    };
});

routeAppControllers.controller('signalerMembreCtrl', function($scope, $http, $location, $timeout) {
    $scope.notFound = false;
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.succes = false;
    $scope.error = false;
    $scope.load = false;

    $http.get($location.path()).then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(!res.data.notFound) {
            $scope.membre = {};
            $scope.nationalites = res.data.nationalites.nationalites;

            if($scope.connecte) {
                if (res.data.installe) {
                    $scope.installe = true;
                    $scope.membre.nomSignaleur = res.data.membre.nom;
                    $scope.membre.prenomSignaleur = res.data.membre.prenom;
                    $scope.membre.adresseSignaleur = res.data.membre.adresseMembre;
                    $scope.membre.villeSignaleur = res.data.membre.villeMembre;
                    $scope.membre.codePostalSignaleur = res.data.membre.codePostalMembre;
                    $scope.membre.professionSignaleur = res.data.specialite.typeSpecialite;
                    $scope.idSite1 = res.data.sites[0];
                }

                else {
                    $scope.remplacant = true;
                    $scope.membre.nomSignaleur = res.data.membre.nom;
                    $scope.membre.prenomSignaleur = res.data.membre.prenom;
                    $scope.membre.adresseSignaleur = res.data.membre.adresseMembre;
                    $scope.membre.villeSignaleur = res.data.membre.villeMembre;
                    $scope.membre.codePostalSignaleur = res.data.membre.codePostalMembre;
                    $scope.membre.professionSignaleur = res.data.specialite.typeSpecialite;
                }
            }
        }

        else {
            $scope.notFound = true;

            if(res.data.installe) {
                $scope.installe = true;
                $scope.idSite1 = res.data.sites[0];
            }

            else {
                $scope.remplacant = true;
            }
        }
    });

    $scope.signalerMembre = function(membre) {
        $http.post($location.path(), membre).then(function(data) {
            $scope.load = true;

            if(data.data.succes) {
                $scope.succes = true;
                $scope.succesMsg = data.data.succesMsg;

                $timeout(function() {
                    $scope.load = false;
                    $location.path("/");
                }, 5000);
            }

            else {
                $scope.error = true;
                $scope.erreurMsg = data.data.errors;

                $timeout(function() {
                    $scope.load = false;
                }, 1000);
            }
        });
    };
});

routeAppControllers.controller('signalerReponseCtrl', function($scope, $http, $location, $timeout) {
    $scope.notFound = false;
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.succes = false;
    $scope.error = false;
    $scope.load = false;

    $http.get($location.path()).then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(!res.data.notFound) {
            $scope.reponse = {};

            if($scope.connecte) {
                if (res.data.installe) {
                    $scope.installe = true;
                    $scope.nationalites = res.data.nationalites.nationalites;
                    $scope.reponse.nomSignaleur = res.data.membre.nom;
                    $scope.reponse.prenomSignaleur = res.data.membre.prenom;
                    $scope.reponse.adresseSignaleur = res.data.membre.adresseMembre;
                    $scope.reponse.villeSignaleur = res.data.membre.villeMembre;
                    $scope.reponse.codePostalSignaleur = res.data.membre.codePostalMembre;
                    $scope.reponse.professionSignaleur = res.data.specialite.typeSpecialite;
                    $scope.idSite1 = res.data.sites[0];
                }

                else {
                    $scope.remplacant = true;
                }
            }
        }

        else {
            $scope.notFound = true;

            if(res.data.installe) {
                $scope.installe = true;
                $scope.idSite1 = res.data.sites[0];
            }

            else {
                $scope.remplacant = true;
            }
        }
    });

    $scope.signalerReponse = function(reponse) {
        $http.post($location.path(), reponse).then(function(data) {
            $scope.load = true;

            if(data.data.succes) {
                $scope.succes = true;
                $scope.succesMsg = data.data.succesMsg;

                $timeout(function() {
                    $scope.load = false;
                    $location.path("/");
                }, 5000);
            }

            else {
                $scope.error = true;
                $scope.erreurMsg = data.data.errors;

                $timeout(function() {
                    $scope.load = false;
                }, 1000);
            }
        });
    };
});

routeAppControllers.controller('signalerSiteCtrl', function($scope, $http, $location, $timeout) {
    $scope.notFound = false;
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.succes = false;
    $scope.error = false;
    $scope.load = false;

    $http.get($location.path()).then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(!res.data.notFound) {
            $scope.site = {};
            $scope.nationalites = res.data.nationalites.nationalites;

            if($scope.connecte) {
                if (res.data.installe) {
                    $scope.installe = true;
                    $scope.site.nomSignaleur = res.data.membre.nom;
                    $scope.site.prenomSignaleur = res.data.membre.prenom;
                    $scope.site.adresseSignaleur = res.data.membre.adresseMembre;
                    $scope.site.villeSignaleur = res.data.membre.villeMembre;
                    $scope.site.codePostalSignaleur = res.data.membre.codePostalMembre;
                    $scope.site.professionSignaleur = res.data.specialite.typeSpecialite;
                    $scope.idSite1 = res.data.sites[0];
                }

                else {
                    $scope.remplacant = true;
                    $scope.site.nomSignaleur = res.data.membre.nom;
                    $scope.site.prenomSignaleur = res.data.membre.prenom;
                    $scope.site.adresseSignaleur = res.data.membre.adresseMembre;
                    $scope.site.villeSignaleur = res.data.membre.villeMembre;
                    $scope.site.codePostalSignaleur = res.data.membre.codePostalMembre;
                    $scope.site.professionSignaleur = res.data.specialite.typeSpecialite;
                }
            }
        }

        else {
            $scope.notFound = true;

            if(res.data.installe) {
                $scope.installe = true;
                $scope.idSite1 = res.data.sites[0];
            }

            else {
                $scope.remplacant = true;
            }
        }
    });

    $scope.signalerSite = function(site) {
        $http.post($location.path(), site).then(function(data) {
            $scope.load = true;

            if(data.data.succes) {
                $scope.succes = true;
                $scope.succesMsg = data.data.succesMsg;

                $timeout(function() {
                    $scope.load = false;
                    $location.path("/");
                }, 5000);
            }

            else {
                $scope.error = true;
                $scope.erreurMsg = data.data.errors;

                $timeout(function() {
                    $scope.load = false;
                }, 1000);
            }
        });
    };
});

routeAppControllers.controller('avisCtrl', function($scope, $http, $location, $timeout) {
    $scope.notFound = false;
    $scope.installe = false;
    $scope.remplacant = false;
    $scope.succes = false;
    $scope.error = false;
    $scope.load = false;
    $scope.stars = {};

    $http.get($location.path()).then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if(res.data.installe) {
            $scope.installe = true;
            $scope.idSite1 = res.data.sites[0];
        }

        else {
            $scope.remplacant = true;
        }

        $scope.stars = {
            nombre: 5,
            rating: 0,
            hover: true,
            space: "around",
            size: "large",
            position: "right",
            type: "icon"
        };
    });

    $scope.changeText = function(event) {
        $scope.stars.rating = event.rating;
    };

    $scope.donnerAvis = function(avis) {
        avis.rating = $scope.stars.rating;

        $http.post($location.path(), avis).then(function(data) {
            $scope.load = true;

            if(data.data.succes) {
                $scope.succes = true;
                $scope.succesMsg = data.data.succesMsg;

                $timeout(function() {
                    $scope.load = false;
                    $location.path("/");
                }, 5000);
            }

            else {
                $scope.error = true;
                $scope.erreurMsg = data.data.errors;

                $timeout(function() {
                    $scope.load = false;
                }, 1000);
            }
        });
    };
});

routeAppControllers.controller('forbiddenCtrl', function($scope, $http) {
    $scope.admin = false;
    $scope.installe = false;
    $scope.remplacant = false;

    // Fonction get pour récupérer les informations
    $http.get('/accueil').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if($scope.connecte) {
            $scope.admin = res.data.admin;
            $scope.installe = res.data.installe;
            $scope.remplacant = res.data.remplacant;
        }
    });
});

routeAppControllers.controller('alreadyloggedinCtrl', function($scope, $http) {
    $scope.admin = false;
    $scope.installe = false;
    $scope.remplacant = false;

    // Fonction get pour récupérer les informations
    $http.get('/accueil').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion

        if($scope.connecte) {
            $scope.admin = res.data.admin;
            $scope.installe = res.data.installe;
            $scope.remplacant = res.data.remplacant;
        }
    });
});

routeAppControllers.controller('adminCtrl', function($scope, $http) {
    $scope.admin = false;
    $scope.installe = false;
    $scope.remplacant = false;

    // Fonction get pour récupérer les informations
    $http.get('/accueil').then(function(res) {
        $scope.pageTitle = "1Rempla - "+res.data.title;
        $scope.title = res.data.title;
        $scope.connecte = res.data.statutConnexion;

        if($scope.connecte) {
            $scope.admin = res.data.admin;
            $scope.installe = res.data.installe;
            $scope.remplacant = res.data.remplacant;
        }
    });
});
