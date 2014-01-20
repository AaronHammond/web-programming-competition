

var User = require('../models/User');
var passport = require('../util/passport');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};



/*
 * user/preferences
 */
exports.viewPreferences = function(req, res){
	console.log(req.user);
	res.render('userPreferences', {msg: req.flash('error')});
}

/*
 * user/login
 *
 */
exports.viewLogin = function(req, res){
	res.render('userLogin', { msg: req.flash('error') });
}

exports.doLogin = passport.authenticate('local', {successRedirect: '/map',
        failureRedirect: '/user/login',
        failureFlash: true});

/*
 * user/register
 *
 */

 exports.viewRegister = function(req, res){
 	res.render('userRegister', { msg: req.flash('error') });
 }

 exports.doRegister = function(req, res){
	User.findOne({username: req.param('username')}, function(user, err) {
	
		if(user){
			req.flash('error', 'An account with that username already exists!');
			return res.redirect('/user/register');
		}
	
		user = new User({	username: req.param('username'),
							password: req.param('password')});
		user.save(function (err, doc){
			if(err){
	    		req.flash('error', err);
	    		return res.redirect('/user/register');
			}

			req.login(doc, function(err){
			    if(err){
			        req.flash('error', 'Your account was created. Please log in.');
			        return res.redirect('/user/login');
			    }

	    		return res.redirect('/user/preferences');
			});
		});
	});
 }