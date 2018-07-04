var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var Hogan = require('hogan.js');
var fs = require('fs');

var envoiMail = {};

var transport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: '1rempla.contact@gmail.com',
    pass: '1Remplacont'
  }
});

envoiMail.envoiMailCreationCompte = function(user) {

  var sexe = user.genre;
  if(sexe == "Femme"){
    sexe = "Mme ";
  }
  else if(sexe == "Homme"){
    sexe = "Mr ";
  }
  else{
    sexe="";
  }

  var template = fs.readFileSync('./views/partials/mails/envoiMailCreationCompte.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: user.adresseMail,
    subject: 'Création d\'un compte - 1REMPLA',
    html: compiledTemplate.render({nom: user.nom, prenom: user.prenom, sexe: sexe, token: user.tokenValidation})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailValidationCompte = function(user) {
    var sexe = user.genre;
    if(sexe == "Femme"){
      sexe = "Mme ";
    }
    else if(sexe == "Homme"){
      sexe = "Mr ";
    }
    else{
      sexe="";
    }

    var template = fs.readFileSync('./views/partials/mails/envoiMailValidationCompte.html', 'utf-8');
    var compiledTemplate = Hogan.compile(template);

    var mailOptions = {
        from: 'nepasrepondre@1rempla.fr',
        to: user.adresseMail,
        subject: 'Validation de votre compte - 1REMPLA',
        html: compiledTemplate.render({nom: user.nom, prenom: user.prenom, sexe: sexe})
    };

    transport.sendMail(mailOptions);
};

envoiMail.envoiMailCreationAnnonce = function(site, user) {

  var sexe = user.genre;
  if(sexe == "Femme"){
    sexe = "Mme ";
  }
  else if(sexe == "Homme"){
    sexe = "Mr ";
  }
  else{
    sexe="";
  }

  var template = fs.readFileSync('./views/partials/mails/envoiMailCreationAnnonce.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: user.adresseMail,
    subject: 'Création d\'annonce - 1REMPLA',
    html: compiledTemplate.render({nom: user.nom, prenom: user.prenom, sexe: sexe})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailCreationDisponibilite = function(user) {

  var sexe = user.genre;
  if(sexe == "Femme"){
    sexe = "Mme ";
  }
  else if(sexe == "Homme"){
    sexe = "Mr ";
  }
  else{
    sexe="";
  }

  var template = fs.readFileSync('./views/partials/mails/envoiMailCreationDisponibilite.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: user.adresseMail,
    subject: 'Création de disponibilité - 1REMPLA',
    html: compiledTemplate.render({nom: user.nom, prenom: user.prenom, sexe: sexe})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailReponseAnnonceInstalle = function(user, dateD, dateF) {

  var sexe = user.genre;
  if(sexe == "Femme"){
    sexe = "Mme ";
  }
  else if(sexe == "Homme"){
    sexe = "Mr ";
  }
  else{
    sexe="";
  }

  var template = fs.readFileSync('./views/partials/mails/envoiMailReponseAnnonceInstalle.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: user.adresseMail,
    subject: 'Réponse à votre annonce - 1REMPLA',
    html: compiledTemplate.render({nom: user.nom, prenom: user.prenom, sexe: sexe, dateD: dateD, dateF: dateF})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailReponseAnnonceRemplacant = function(remplacant, installe, dateD, dateF) {

  var sexe = remplacant.genre;
  if(sexe == "Femme"){
    sexe = "Mme ";
  }
  else if(sexe == "Homme"){
    sexe = "Mr ";
  }
  else{
    sexe="";
  }

  var sexeI = installe.genre;
  if(sexeI == "Femme"){
    sexeI = "Mme ";
  }
  else if(sexeI == "Homme"){
    sexeI = "Mr ";
  }
  else{
    sexeI="";
  }

  var template = fs.readFileSync('./views/partials/mails/envoiMailReponseAnnonceRemplacant.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: remplacant.adresseMail,
    subject: 'Réponse à l\'annonce - 1REMPLA',
    html: compiledTemplate.render({nom: remplacant.nom, prenom: remplacant.prenom, sexe: sexe, nomI: installe.nom, prenomI: installe.prenom, sexeI: sexeI, dateD: dateD, dateF: dateF})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailReponseReponsePositive = function(remplacant, installe) {

  var sexe = remplacant.genre;
  if(sexe == "Femme"){
    sexe = "Mme ";
  }
  else if(sexe == "Homme"){
    sexe = "Mr ";
  }
  else{
    sexe="";
  }

  var sexeI = installe.genre;
  if(sexeI == "Femme"){
    sexeI = "Mme ";
  }
  else if(sexeI == "Homme"){
    sexeI = "Mr ";
  }
  else{
    sexeI="";
  }

  var template = fs.readFileSync('./views/partials/mails/envoiMailReponseReponsePositive.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: remplacant.adresseMail,
    subject: 'Réponse positive - 1REMPLA',
    html: compiledTemplate.render({nom: remplacant.nom, prenom: remplacant.prenom, sexe: sexe, nomI: installe.nom, prenomI: installe.prenom, sexeI: sexeI})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailReponseReponseNegative = function(remplacant, installe) {

  var sexe = remplacant.genre;
  if(sexe == "Femme"){
    sexe = "Mme ";
  }
  else if(sexe == "Homme"){
    sexe = "Mr ";
  }
  else{
    sexe="";
  }

  var sexeI = installe.genre;
  if(sexeI == "Femme"){
    sexeI = "Mme ";
  }
  else if(sexeI == "Homme"){
    sexeI = "Mr ";
  }
  else{
    sexeI = "";
  }

  var template = fs.readFileSync('./views/partials/mails/envoiMailReponseReponseNegative.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: remplacant.adresseMail,
    subject: 'Réponse négative - 1REMPLA',
    html: compiledTemplate.render({nom: remplacant.nom, prenom: remplacant.prenom, sexe: sexe, nomI: installe.nom, prenomI: installe.prenom, sexeI: sexeI})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailPriseDeContact = function(message, remplacant, installe) {

  var sexe = remplacant.genre;
  if(sexe == "Femme"){
    sexe = "Mme ";
  }
  else if(sexe == "Homme"){
    sexe = "Mr ";
  }
  else{
    sexe="";
  }

  var sexeI = installe.genre;
  if(sexeI == "Femme"){
    sexeI = "Mme ";
  }
  else if(sexeI == "Homme"){
    sexeI = "Mr ";
  }
  else{
    sexeI="";
  }

  if(message != "") {
    var template = fs.readFileSync('./views/partials/mails/envoiMailPriseDeContactAvecM.html', 'utf-8');
    var compiledTemplate = Hogan.compile(template);

    var mailOptions = {
      from: 'nepasrepondre@1rempla.fr',
      to: remplacant.adresseMail,
      subject: 'Prise de contact - 1REMPLA',
      html: compiledTemplate.render({nom: remplacant.nom, prenom: remplacant.prenom, sexe: sexe, nomI: installe.nom, prenomI: installe.prenom, sexeI: sexeI, idI: installe.id, message: message})
    };
  }

  else {
    var template = fs.readFileSync('./views/partials/mails/envoiMailPriseDeContact.html', 'utf-8');
    var compiledTemplate = Hogan.compile(template);

    var mailOptions = {
      from: 'nepasrepondre@1rempla.fr',
      to: remplacant.adresseMail,
      subject: 'Prise de contact - 1REMPLA',
      html: compiledTemplate.render({nom: remplacant.nom, prenom: remplacant.prenom, sexe: sexe, nomI: installe.nom, prenomI: installe.prenom, sexeI: sexeI, idI: installe.id})
    };
  }

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailConfirmationPriseDeContact = function(message, installe, remplacant) {

  var sexe = installe.genre;
  if(sexe == "Femme"){
    sexe = "Mme ";
  }
  else if(sexe == "Homme"){
    sexe = "Mr ";
  }
  else{
    sexe="";
  }

  var sexeR = remplacant.genre;
  if(sexeR == "Femme"){
    sexeR = "Mme ";
  }
  else if(sexeR == "Homme"){
    sexeR = "Mr ";
  }
  else{
    sexeR="";
  }


  if(message != "") {
    var template = fs.readFileSync('./views/partials/mails/envoiMailConfirmationPriseDeContactAvecM.html', 'utf-8');
    var compiledTemplate = Hogan.compile(template);
    var mailOptions = {
      from: 'nepasrepondre@1rempla.fr',
      to: installe.adresseMail,
      subject: 'Confirmation d\'une prise de contact - 1REMPLA',
      html: compiledTemplate.render({nom: installe.nom, prenom: installe.prenom, sexe: sexe, nomR: remplacant.nom, prenomR: remplacant.prenom, sexeR: sexeR, message: message})
    };
  }

  else {
    var template = fs.readFileSync('./views/partials/mails/envoiMailConfirmationPriseDeContact.html', 'utf-8');
    var compiledTemplate = Hogan.compile(template);
    var mailOptions = {
      from: 'nepasrepondre@1rempla.fr',
      to: installe.adresseMail,
      subject: 'Confirmation d\'une prise de contact - 1REMPLA',
      html: compiledTemplate.render({nom: installe.nom, prenom: installe.prenom, sexe: sexe, nomR: remplacant.nom, prenomR: remplacant.prenom, sexeR: sexeR})
    };
  }

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailSuppressionCompte = function(user) {

  var sexe = user.genre;
  if(sexe == "Femme"){
    sexe = "Mme ";
  }
  else if(sexe == "Homme"){
    sexe = "Mr ";
  }
  else{
    sexe="";
  }

  var template = fs.readFileSync('./views/partials/mails/envoiMailSuppressionCompte.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: user.adresseMail,
    subject: 'Suppression de votre compte - 1REMPLA',
    html: compiledTemplate.render({nom: user.nom, prenom: user.prenom, sexe: sexe})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailOubliMdp = function(token, user) {

  var sexe = user.genre;
  if(sexe == "Femme"){
    sexe = "Mme ";
  }
  else if(sexe == "Homme"){
    sexe = "Mr ";
  }
  else{
    sexe="";
  }

  var template = fs.readFileSync('./views/partials/mails/envoiMailOubliMdp.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: user.adresseMail,
    subject: 'Mot de passe oublié - 1REMPLA',
    html: compiledTemplate.render({token: token})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailMdpReinit = function(user) {

  var sexe = user.genre;
  if(sexe == "Femme"){
    sexe = "Mme ";
  }
  else if(sexe == "Homme"){
    sexe = "Mr ";
  }
  else{
    sexe="";
  }

  var template = fs.readFileSync('./views/partials/mails/envoiMailMdpReinit.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: user.adresseMail,
    subject: 'Récupération de Mot de Passe - 1REMPLA',
    html: compiledTemplate.render({nom: user.nom, prenom: user.prenom, sexe: sexe})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailSignalisationMembreAnnonce = function(user, id, raison, precision, infosSupp) {

  var sexe = user.genre;
  if(sexe == "Femme"){
    sexe = "Mme ";
  }
  else if(sexe == "Homme"){
    sexe = "Mr ";
  }
  else{
    sexe="";
  }

  if(precision == "" || precision == undefined || precision == null){
    precision = "Aucune";
  }
  if(infosSupp == "" || infosSupp == undefined || infosSupp == null){
    infosSupp = "Aucunes";
  }


  var template = fs.readFileSync('./views/partials/mails/envoiMailSignalisationMembreAnnonce.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: user.adresseMail,
    subject: 'Signalisation d\'une annonce - 1REMPLA',
    html: compiledTemplate.render({id: id, nom: user.nom, prenom: user.prenom, sexe: sexe, raison: raison, precision: precision, infosSupp: infosSupp})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailSignalisationAnnonce1Rempla = function(id, raison, precision, infosSupp, signaleur) {

  if(precision == "" || precision == undefined || precision == null){
    precision = "Aucune";
  }
  if(infosSupp == "" || infosSupp == undefined || infosSupp == null){
    infosSupp = "Aucunes";
  }

  var template = fs.readFileSync('./views/partials/mails/envoiMailSignalisationAnnonce1Rempla.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: 'tom.le.jeune@outlook.fr',
    subject: 'Signalisation d\'une annonce - 1REMPLA',
    html: compiledTemplate.render({id: id, raison: raison, precision: precision, infosSupp: infosSupp, signaleur: signaleur})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailSignalisationMembreMembre = function(user, raison, precision, infosSupp) {

  var sexe = user.genre;
  if(sexe == "Femme"){
    sexe = "Mme ";
  }
  else if(sexe == "Homme"){
    sexe = "Mr ";
  }
  else{
    sexe="";
  }

  if(precision == "" || precision == undefined || precision == null){
    precision = "Aucune";
  }
  if(infosSupp == "" || infosSupp == undefined || infosSupp == null){
    infosSupp = "Aucunes";
  }

  var template = fs.readFileSync('./views/partials/mails/envoiMailSignalisationMembreMembre.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: user.adresseMail,
    subject: 'Signalisation d\'un membre - 1REMPLA',
    html: compiledTemplate.render({nom: user.nom, prenom: user.prenom, sexe: sexe, raison: raison, precision: precision, infosSupp: infosSupp})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailSignalisationMembre1Rempla = function(id, raison, precision, infosSupp, signaleur) {

  if(precision == "" || precision == undefined || precision == null){
    precision = "Aucune";
  }
  if(infosSupp == "" || infosSupp == undefined || infosSupp == null){
    infosSupp = "Aucunes";
  }

  var template = fs.readFileSync('./views/partials/mails/envoiMailSignalisationMembre1Rempla.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: 'maellabe@gmail.com',
    subject: 'Signalisation d\'un membre - 1REMPLA',
    html: compiledTemplate.render({id: id, raison: raison, precision: precision, infosSupp: infosSupp, signaleur: signaleur})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailSignalisationReponseMembre = function(user, id, raison, precision, infosSupp) {

  var sexe = user.genre;
  if(sexe == "Femme"){
    sexe = "Mme ";
  }
  else if(sexe == "Homme"){
    sexe = "Mr ";
  }
  else{
    sexe="";
  }

  if(precision == "" || precision == undefined || precision == null){
    precision = "Aucune";
  }
  if(infosSupp == "" || infosSupp == undefined || infosSupp == null){
    infosSupp = "Aucunes";
  }

  var template = fs.readFileSync('./views/partials/mails/envoiMailSignalisationReponseMembre.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: user.adresseMail,
    subject: 'Réponse suite à signalisation - 1REMPLA',
    html: compiledTemplate.render({id: id, nom: user.nom, prenom: user.prenom, sexe: sexe, raison: raison, precision: precision, infosSupp: infosSupp})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailSignalisationReponse1Rempla = function(id, raison, precision, infosSupp, signaleur) {

  if(precision == "" || precision == undefined || precision == null){
    precision = "Aucune";
  }
  if(infosSupp == "" || infosSupp == undefined || infosSupp == null){
    infosSupp = "Aucunes";
  }

  var template = fs.readFileSync('./views/partials/mails/envoiMailSignalisationReponse1Rempla.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: 'maellabe@gmail.com',
    subject: 'Réponse suite à signalisation - 1REMPLA',
    html: compiledTemplate.render({id: id, raison: raison, precision: precision, infosSupp: infosSupp, signaleur: signaleur})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailSignalisationSiteMembre = function(user, id, raison, precision, infosSupp) {

  var sexe = user.genre;
  if(sexe == "Femme"){
    sexe = "Mme ";
  }
  else if(sexe == "Homme"){
    sexe = "Mr ";
  }
  else{
    sexe="";
  }

  if(precision == "" || precision == undefined || precision == null){
    precision = "Aucune";
  }
  if(infosSupp == "" || infosSupp == undefined || infosSupp == null){
    infosSupp = "Aucunes";
  }

  var template = fs.readFileSync('./views/partials/mails/envoiMailSignalisationSiteMembre.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: user.adresseMail,
    subject: 'Signalisation d\'un site - 1REMPLA',
    html: compiledTemplate.render({nom: user.nom, prenom: user.prenom, sexe: sexe, raison: raison, precision: precision, infosSupp: infosSupp})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailSignalisationSite1Rempla = function(id, raison, precision, infosSupp, signaleur) {

  if(precision == "" || precision == undefined || precision == null){
    precision = "Aucune";
  }
  if(infosSupp == "" || infosSupp == undefined || infosSupp == null){
    infosSupp = "Aucunes";
  }

  var template = fs.readFileSync('./views/partials/mails/envoiMailSignalisationSite1Rempla.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: 'maellabe@gmail.com',
    subject: 'Signalisation d\'un site - 1REMPLA',
    html: compiledTemplate.render({id: id, raison: raison, precision: precision, infosSupp: infosSupp, signaleur: signaleur})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailContactDemandeur = function(nom, prenom, adresseMail, message) {

  var template = fs.readFileSync('./views/partials/mails/envoiMailContactDemandeur.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: adresseMail,
    subject: 'Contact - 1REMPLA',
    html: compiledTemplate.render({nom: nom, prenom: prenom, message: message})
  };

  transport.sendMail(mailOptions);
};

envoiMail.envoiMailContact1Rempla = function(nom, prenom, adresseMail, message) {

  var template = fs.readFileSync('./views/partials/mails/envoiMailContact1Rempla.html', 'utf-8');
  var compiledTemplate = Hogan.compile(template);

  var mailOptions = {
    from: 'nepasrepondre@1rempla.fr',
    to: 'maellabe@gmail.com',
    subject: 'Contact - 1REMPLA',
    html: compiledTemplate.render({nom: nom, prenom: prenom, adresseMail: adresseMail, message: message})
  };

  transport.sendMail(mailOptions);
};

module.exports = envoiMail;
