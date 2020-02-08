const express = require('express');
const Notification = require('../models/notification');

var loggedin = function(req) {
	return !!(req.session && req.session.user);
}

/*
 * Loads a the a user's home page of PennBook
 */
var home = function(req, res) {
	// Check if user is logged in
	if (!loggedin(req)) {
		res.redirect('/');
		return;
	}
	
	Notification.loadNewsFeed(req.session.user.uuid, function (err, feed) {
		if (err) {
			console.log(err);
			res.render('home.ejs', { user : JSON.stringify(req.session.user) });
			return;
		}
		
		res.render('home.ejs', { user : JSON.stringify(req.session.user), feed : JSON.stringify(feed) });
		return;
	});
};


var home_routes = {
	home : home
};

module.exports = home_routes;