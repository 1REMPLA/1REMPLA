var appAngular = angular.module('appAngular', ['ngRoute', 'routeAppControllers', 'routeAppDirectives', 'routeAppServices', 'mwl.calendar','ui.bootstrap', 'vcRecaptcha', 'duScroll', 'thatisuday.ng-image-gallery', 'textAngular', 'uiGmapgoogle-maps', "ngSanitize", "com.2fdevs.videogular", "com.2fdevs.videogular.plugins.controls", "com.2fdevs.videogular.plugins.overlayplay", "com.2fdevs.videogular.plugins.poster", "info.vietnamcode.nampnq.videogular.plugins.youtube", "checklist-model", "star-rating"]);

appAngular.config(['$routeProvider', '$interpolateProvider', function config($routeProvider, $interpolateProvider) {
  $interpolateProvider.startSymbol('{[{');
  $interpolateProvider.endSymbol('}]}');

  var checkLoggedin = function($q, $timeout, $http, $location, $rootScope) {
    var deferred = $q.defer();

    $http.get($location.path()).success(function(user) {
      if (!user.notLoggedIn && !user.admin) {
        deferred.resolve();
      }

      else if(!user.notLoggedIn && user.admin) {
        deferred.reject();
        $location.url('/administrateur');
      }

      else {
        deferred.reject();
        $location.url('/forbidden');
      }
    });

    return deferred.promise;
  };

  var checkNotLoggedin = function($q, $timeout, $http, $location, $rootScope) {
    var deferred = $q.defer();

    $http.get($location.path()).success(function(user) {
      if (!user.loggedIn && !user.admin && typeof(user) != "string") {
        deferred.resolve();
      }

      else if((!user.loggedIn && user.admin) || typeof(user) == "string") {
        deferred.reject();
        $location.url('/administrateur');
      }

      else {
        deferred.reject();
        $location.url('/alreadyloggedin');
      }
    });

    return deferred.promise;
  };

  var checkLoggedinInstalle = function($q, $timeout, $http, $location, $rootScope) {
    var deferred = $q.defer();

    $http.get($location.path()).success(function(user) {
      if (user.installe && !user.admin && !user.notLoggedIn) {
        deferred.resolve();
      }

      else if(user.admin) {
        deferred.reject();
        $location.url('/administrateur');
      }

      else {
        deferred.reject();
        $location.url('/forbidden');
      }
    });

    return deferred.promise;
  };

  var checkLoggedinRemplacant = function($q, $timeout, $http, $location, $rootScope) {
    var deferred = $q.defer();

    $http.get($location.path()).success(function(user) {
      if (!user.installe && !user.admin && !user.notLoggedIn) {
        deferred.resolve();
      }

      else if(user.admin) {
        deferred.reject();
        $location.url('/administrateur');
      }

      else {
        deferred.reject();
        $location.url('/forbidden');
      }
    });

    return deferred.promise;
  };

  var checkLoggedinAdmin = function($q, $timeout, $http, $location, $rootScope) {
      var deferred = $q.defer();

      $http.get($location.path()).success(function(user) {
          if (!user.admin) {
              deferred.resolve();
          }

          else {
              deferred.reject();
              $location.url('/administrateur');
          }
      });

      return deferred.promise;
  };

  $routeProvider
      .when('/', {
        templateUrl: 'partials/index',
        controller: 'accueilCtrl'
      })

      .when('/a-propos',{
          templateUrl: 'partials/aPropos',
          controller: 'aproposCtrl'
      })

      .when('/mentions-legales',{
          templateUrl: 'partials/mentionsLegales',
          controller: 'mentionsLegalesCtrl'
      })

      .when('/conditions-generales-d-utilisation', {
          templateUrl: 'partials/cgu',
          controller: 'cguCtrl'
      })

      .when('/connexion', {
        templateUrl: 'partials/membres/authentification/connexion',
        controller: 'connexionCtrl',
        resolve: {
          loggedin: checkNotLoggedin
        }
      })

      .when('/connexion/motDePasseOublie', {
          templateUrl: 'partials/membres/authentification/motDePasseOublie',
          controller: 'motDePasseOublieCtrl',
          resolve: {
            loggedin: checkNotLoggedin
          }
      })

      .when('/reinitialisationMdp/:token', {
          templateUrl: 'partials/membres/authentification/reinitialisationMdp',
          controller: 'reinitialisationMdpCtrl',
          resolve: {
            loggedin: checkNotLoggedin
          }
      })

      .when('/validation/:token', {
          templateUrl: 'partials/membres/authentification/validation',
          controller: 'validationCtrl',
          resolve: {
            loggedin: checkNotLoggedin
          }
      })

      .when('/inscription', {
        templateUrl: 'partials/membres/authentification/inscription',
        controller: 'inscriptionCtrl',
        resolve: {
          loggedin: checkNotLoggedin
        }
      })

      .when('/profil/public', {
          templateUrl: 'partials/membres/profil/public',
          controller: 'profilPublicCtrl',
          resolve: {
            loggedin: checkLoggedin
          }
      })

      .when('/profil/general', {
          templateUrl: 'partials/membres/profil/general',
          controller: 'profilGeneralCtrl',
          resolve: {
            loggedin: checkLoggedin
          }
      })

      .when('/profil/calendrier/:id', {
          templateUrl: 'partials/membres/profil/calendrier',
          controller: 'profilCalendrierCtrl',
          resolve: {
            loggedin: checkLoggedinInstalle
          }
      })

      .when('/profil/disponibilite', {
          templateUrl: 'partials/membres/profil/disponibilite',
          controller: 'profilCalendrierCtrl',
          resolve: {
            loggedin: checkLoggedinRemplacant
          }
      })

      .when('/profil/motDePasse', {
          templateUrl: 'partials/membres/profil/motDePasse',
          controller: 'profilMdpCtrl',
          resolve: {
            loggedin: checkLoggedin
          }
      })

      .when('/profil/sites', {
          templateUrl: 'partials/membres/profil/sites/sites',
          controller: 'profilSitesCtrl',
          resolve: {
            loggedin: checkLoggedinInstalle,
          }
      })

      .when('/profil/sites/creation', {
          templateUrl: 'partials/membres/profil/sites/creation',
          controller: 'profilSitesCreationCtrl',
          resolve: {
            loggedin: checkLoggedinInstalle,
          }
      })

      .when('/profil/sites/id/:id', {
          templateUrl: 'partials/membres/profil/sites/profil',
          controller: 'profilSitesDetailsCtrl',
          resolve: {
            loggedin: checkLoggedinInstalle,
          }
      })

      .when('/profil/zonesDisponibilite', {
          templateUrl: 'partials/membres/profil/zonesDisponibilite',
          controller: 'profilZonesGeoCtrl',
          resolve: {
            loggedIn: checkLoggedinRemplacant
          }
      })

      .when('/profil/sites/id/:id/modification', {
          templateUrl: 'partials/membres/profil/sites/modification',
          controller: 'profilSitesModificationCtrl',
          resolve: {
            loggedin: checkLoggedinInstalle,
          }
      })

      .when('/profil/photo', {
          templateUrl: 'partials/membres/profil/photo',
          controller: 'profilPhotoCtrl',
          resolve: {
            loggedin: checkLoggedin
          }
      })

      .when('/profil/reponses', {
          templateUrl: 'partials/membres/profil/reponses',
          controller: 'profilReponsesCtrl',
          resolve: {
            loggedin: checkLoggedin,
          }
      })

      .when('/profil/suppression', {
          templateUrl: 'partials/membres/profil/suppression',
          controller: 'profilSuppressionCtrl',
          resolve: {
            loggedin: checkLoggedin
          }
      })

      .when('/annonces/recherche', {
          templateUrl: 'partials/annonces/recherche',
          controller: 'rechercheAnnoncesInstallesCtrl'
      })

      .when('/annonces/rechercheRemplacants', {
          templateUrl: 'partials/annonces/rechercheRemplacants',
          controller: 'rechercheAnnoncesRemplacantsCtrl'
      })

      .when('/annonces/:id', {
          templateUrl: 'partials/annonces/details',
          controller: 'detailsAnnoncesCtrl'
      })

      .when('/forbidden', {
          templateUrl: 'partials/membres/securite/forbidden',
          controller: 'forbiddenCtrl'
      })

      .when('/alreadyloggedin', {
          templateUrl: 'partials/membres/securite/alreadyloggedin',
          controller: 'alreadyloggedinCtrl'
      })

      .when('/administrateur', {
          templateUrl: 'partials/membres/securite/administrateur',
          controller: 'adminCtrl'
      })

      .when('/remplacant/:id', {
          templateUrl: 'partials/profils/remplacant',
          controller: 'detailsRemplacantCtrl',
          resolve: {
            loggedin: checkLoggedin
          }
      })

      .when('/annonces/:id', {
          templateUrl: 'partials/annonces/details',
          controller: 'detailsAnnoncesCtrl'
      })

      .when('/signaler/annonce/:id', {
          templateUrl: 'partials/signaler/annonce',
          controller: 'signalerAnnonceCtrl',
          resolve: {
              loggedIn: checkLoggedinAdmin
          }
      })

      .when('/signaler/membre/:id', {
          templateUrl: 'partials/signaler/membre',
          controller: 'signalerMembreCtrl',
          resolve: {
              loggedIn: checkLoggedinAdmin
          }
      })

      .when('/signaler/reponse/:id', {
          templateUrl: 'partials/signaler/reponse',
          controller: 'signalerReponseCtrl',
          resolve: {
              loggedIn: checkLoggedinAdmin
          }
      })

      .when('/signaler/site/:id', {
          templateUrl: 'partials/signaler/site',
          controller: 'signalerSiteCtrl',
          resolve: {
              loggedIn: checkLoggedinAdmin
          }
      })

      .when('/contact', {
          templateUrl: 'partials/contact',
          controller: 'contactCtrl',
          resolve: {
              loggedIn: checkLoggedinAdmin
          }
      })

      .when('/votre-avis', {
          templateUrl: 'partials/avis',
          controller: 'avisCtrl',
          resolve: {
              loggedIn: checkLoggedin
          }
      })

      .otherwise({
        redirectTo: '/'
      });
}]);

appAngular.factory('sessionInjector', ['SessionService', function(SessionService) {
    var sessionInjector = {
        request: function(config) {
            config.headers['x-session-token'] = SessionService.token[Math.floor(Math.random()*35)];
            config.headers.Authorization = "Basic "+SessionService.token[Math.floor(Math.random()*35)];

            return config;
        }
    };

    return sessionInjector;
}]);

appAngular.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('sessionInjector');
}]);

appAngular.config(['calendarConfig', function(calendarConfig) {

    // Use either moment or angular to format dates on the calendar. Default angular. Setting this will override any date formats you have already set.
    calendarConfig.dateFormatter = 'moment';

    // This will configure times on the day view to display in 24 hour format rather than the default of 12 hour
    calendarConfig.allDateFormats.moment.date.hour = 'HH:mm';

    // This will configure the day view title to be shorter
    calendarConfig.allDateFormats.moment.title.day = 'ddd D MMM';

    // This will set the week number hover label on the month view
    calendarConfig.i18nStrings.weekNumber = 'Semaine {week}';

    // This will display all events on a month view even if they're not in the current month. Default false.
    calendarConfig.displayAllMonthEvents = true;

    // Make the week view more like the day view, ***with the caveat that event end times are ignored***.
    calendarConfig.showTimesOnWeekView = true;

}]);

appAngular.factory('calendarEventTitle', function(calendarDateFilter, calendarTruncateEventTitleFilter) {

  function yearView(event) {
    return event.title + ' (' + calendarDateFilter(event.startsAt, 'datetime', true) + ')';
  }

  function monthView(event) {
    return event.title;
  }

  function monthViewTooltip(event) {
    return calendarDateFilter(event.startsAt, 'time', true) + ' - ' + event.title;
  }

  function weekView(event) {
    return event.title;
  }

  function weekViewTooltip(event) {
    return event.title;
  }

  function dayView(event) {
    return event.allDay ? event.title : calendarTruncateEventTitleFilter(event.title, 20, event.height);
  }

  function dayViewTooltip(event) {
    return event.title;
  }

  return {
    yearView: yearView,
    monthView: monthView,
    monthViewTooltip: monthViewTooltip,
    weekView: weekView,
    weekViewTooltip: weekViewTooltip,
    dayView: dayView,
    dayViewTooltip: dayViewTooltip
  };

});
