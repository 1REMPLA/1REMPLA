var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var mongoose = require('mongoose');
var ids = require('./config/db.config/ids');
var helmet = require('helmet');

//Connection à la base de données
mongoose.connect('mongodb://'+ids.username+':'+ids.password+'@localhost:27017/1rempla-db');

mongoose.connection.on('connected', function() {
  console.log("Connecté à la base de données");
});

mongoose.connection.on('error', function(err) {
  console.log("Erreur de base de données : "+err);
});

var index = require('./routes/index');
var partials = require('./routes/partials');
var admin = require('./routes/admin');
var profil = require('./routes/profil');
var annonces = require('./routes/annonces');
var signaler = require('./routes/signaler');

var app = express();

require('./config/passport');

// View Engine Setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Body Parser Middleware
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'https://localhost:3000/');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('X-XSS-Protection', '1; mode = block');
    next();
});

app.use(helmet());
app.use(helmet.noCache());
app.use(helmet.expectCt());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

//Static Folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

//Express session
app.use(session({
  secret: 'lesecretdelapplication1Rempla',
  saveUninitialized: true,
  resave: true
}));

//Flash
app.use(flash());

//Passport Init
app.use(passport.initialize());
app.use(passport.session());

//Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.');
      var root    = namespace.shift();
      var formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Pages of the app
app.use('/', index);
app.use('/#!', index);
app.use('/partials', partials);
app.use('*', index);
app.use('/admin', admin);
app.use('/profil', profil);
app.use('/annonces', annonces);
app.use('/signaler', signaler);

// Catch 404 and Forward to Error Handler
app.use(function(req, res, next) {
  var err = new Error('Page non trouvée');
  err.status = 404;
  next(err);
});

// Error Handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('partials/error', {title: 'Page non trouvée'});
});

module.exports = app;
