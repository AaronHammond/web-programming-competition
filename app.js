
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var map = require('./routes/map');
var data = require('./routes/data');
var http = require('http');
var path = require('path');
var passport = require('./util/passport');
var flash = require('connect-flash');
var mongoose = require('mongoose');
var app = express();



var connStr = 'mongodb://localhost:27017/6470';
mongoose.connect(connStr, function(err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});


// App Configuration
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.cookieParser() );
app.use(express.session({ secret: '6470', key: 'express.sid'}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.errorHandler());

app.use(app.router);

// index

app.get('/', routes.index);

//user

app.get('/user/login', user.viewLogin);
app.post('/user/login', user.doLogin);

app.get('/user/register', user.viewRegister);
app.post('/user/register', user.doRegister);

app.get('/user/preferences', user.viewPreferences);

app.get('/user/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

//map
app.get('/map', map.viewMap);

// data

app.get('/data/restaurants', data.getRestaurants);
app.get('/data/bars', data.getBars);
app.get('/data/parks', data.getParks);



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
