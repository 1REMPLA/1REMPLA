var express = require('express');
var router = express.Router();
var verifRequete = require('../config/verifRequete');

// GET, POST, ... partials pages.
router.use('/membres/authentification/:name', verifRequete, function(req, res, next) {
  res.render('partials/membres/authentification/' + req.params.name);
});

router.use('/membres/profil/sites/:name', verifRequete, function(req, res, next) {
  res.render('partials/membres/profil/sites/' + req.params.name);
});

router.use('/membres/profil/:name', verifRequete, function(req, res, next) {
  res.render('partials/membres/profil/' + req.params.name);
});

router.use('/membres/securite/:name', verifRequete, function(req, res, next) {
  res.render('partials/membres/securite/' + req.params.name);
});

router.use('/signaler/:name', verifRequete, function(req, res, next) {
  res.render('partials/signaler/' + req.params.name);
});

router.use('/annonces/:name', verifRequete, function(req, res, next) {
  res.render('partials/annonces/' + req.params.name);
});

router.use('/profils/:name', verifRequete, function(req, res, next) {
  res.render('partials/profils/' + req.params.name);
});

router.use('/:name', verifRequete, function(req, res, next) {
  res.render('partials/' + req.params.name);
});

module.exports = router;
