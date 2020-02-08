const express = require('express');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('../models/user');
const Room = require('../models/room');
const Chat = require('../models/chat');
const Notification = require('../models/notification');
const Friends = require('../models/friends');
const async = require('async');

var loggedin = function(req) {
	return !!(req.session && req.session.user);
}

/*
 * Logs the user into Pennbook using supplied credentials from login form
 */
var login = function(req, res) {
	var email = req.body.email;
	const password = req.body.password;
	
	// Check if all fields are empty
	if (email === "" && password === "") {
		res.json("No information entered!");
		return;
	}
	
	// Email validation
	if (email === "") {
		res.json("Email address can't be empty!");
		return;
	}  else if (email.includes("gmail")) {
		email = gmailParser(email);
	} else if (!validEmail(email)) {
		res.json("Invalid email adress!");
		return;
	}
	
	// Password validation
	if (password === "") {
		res.json("Password can't be empty!");
		return;
	}
	
	// Authenticate user based on supplied credentials
	User.authenticateUser(email, password, function(authenticated, err) {
		if (!authenticated) {
			// User not found based on supplied credentials
			res.json(err);
			return;
		} else {
			User.findUserByEmail(email, function (user, err) {
				if (user) {
					/*
					 * Save user information to session, let AJAX call know to
					 * redirect webpage
					 */					
					user.online = true;
					User.updateUser(user, {}, function(err) {
						if (err) {
							res.json("Error registering your account!")
							return;
						}
					
						req.session.user = omitPassword(user);
						res.json(301);
						return;
					});
				}
			})
		}
	});
};

/*
 * Signs the user up for Pennbook using supplied credentials from signup form
 */
var register = function(req, res) {
	const firstname = req.body.firstname;
	const lastname = req.body.lastname;
	var email = req.body.email;
	const password = req.body.password;
	const birthdate = req.body.birthdate;
	const affiliation = req.body.affiliation;
	
	// Check if all fields are empty
	if (firstname.trim() === "" && lastname.trim() === "" && email === ""
		&& password === "" && !birthdate && affiliation === "") {
		res.json("No information entered!");
		return;
	}
	
	// Name validation
	if (firstname.trim() === "") {
		res.json("First name can't be empty!");
		return;
	} else if (!validName(firstname.trim())) {
		res.json("Invalid first name!");
		return;
	} else if (lastname.trim() === "") {
		res.json("Last name can't be empty!");
		return;
	} else if (!validName(lastname.trim())) {
		res.json("Invalid last name!");
		return;
	}
	
	// Email validation
	if (email === "") {
		res.json("Email address can't be empty!");
		return;
	} else if (email.length < 7 || email.length > 254) {
		res.json("Email address must be between 7-254 characters long!");
		return;
	}  else if (email.includes("gmail")) {
		email = gmailParser(email);
	} else if (!validEmail(email)) {
		res.json("Invalid email adress!");
		return;
	}
	
	// Password validation
	if (password === "") {
		res.json("Password can't be empty!");
		return;
	} else if (password.length < 8) {
		res.json("Password must be a least 8 characters long!");
		return;
	} else if (!sufficientPasswordDifficulty(password)) {
		res.json("Pasword must be contain at least one uppercase letter, a number, and a special character!");
		return;
	}
	
	// Affiliation validation
	if (affiliation === "") {
		res.json("Affiliation can't be empty!");
		return;
	} 
	
	// Date validation
	if (!birthdate) {
		res.json("Date can't be empty!");
		return;
	}
	
	// Check if user exists with supplied email
	User.findUserByEmail(email, function(user, err) {
		if (err) { // User does not exist, create new account with supplied
					// information
			// Hash the password
			bcrypt.hash(password, saltRounds, function(err, hash) {
				User.createUser(
					firstname, 
					lastname,
					birthdate, 
					email, 
					hash,
					affiliation, 
					function(err) {
						if (err) {
							res.json("There was an error creating your account!")
							return;
						} else {
							User.findUserByEmail(email, function (user, err) {
								if (user) {
									/*
									 * Save user information to session, let
									 * AJAX call know to redirect webpage
									 */
									user.online = true;
									User.updateUser(user, {}, function(err) {
										if (err) {
											res.json("Error registering your account!")
											return;
										}
									
										req.session.user = omitPassword(user);
										res.json(301);
										return;
									});
								};
							});
						}
					});
				});
		} else { 
			res.json("That email is already in use!")
			return
		}
	});
};

/*
 * Logs a user out of Pennbook
 */
var logout = function(req, res) {
	req.session.user.online = false;
	User.updateUser(req.session.user, {}, function(err) {
		if (err) {
			res.json("There was an error logging out!")
			return;
		}
		
		req.session.destroy();
		res.redirect('/');
		return;
	});
}

/*
 * Finds a user in Pennbook by their id
 */
var fetch_user = function(req, res) {
	User.findUserById(req.body.id, function(user, err) {
		if (user) {
			res.json(omitPassword(user));
			return;
		}
	})
}

/*
 * Takes the search parameter from the searchbar and finds users by their name
 */
var search = function(req, res) {
	var searchResults = [];
	var search = req.body.search;
	
	var sanitizedSearch = search.toLowerCase().replace(/\s/g, "");
	
	User.searchUsersByName(sanitizedSearch, function(users, err) {
		if (err) {
			res.json("No user's found!");
			return;
		}
		
		for (var i = 0; i < users.length; i++) {
			searchResults.push(omitPassword(users[i]));
		} 
		
		res.json(searchResults);
		return;
	});
}

/*
 * Redirects the current user to a profile of a user on Pennbook
 */
var profile = function(req, res) {
	// Check if user is logged in
	if (!loggedin(req)) {
		res.redirect('/');
		return;
	}
	
	var uuid = req.params.uuid;
	
	if (uuid == req.session.user.uuid) {
		Notification.loadProfileFeed(uuid, function(err, feed) {
			if (err) {
				console.log(err);
				return;
			}
			
			Friends.getAllFriendsOfUser(uuid, function(err, friends) {
				if (err) {
					console.log(err);
					return;
				}
				
				User.findUserById(req.session.user.uuid, function(user, err) {
					if (user) {
						res.render('main_profile.ejs', { user : JSON.stringify(omitPassword(user)), feed : JSON.stringify(feed), friends : JSON.stringify(friends) });
						return;
					}
				});
			});
		});
	} else {
		// Check to see how to load the profile being redirected to
		areFriends(uuid, req, function (err, checkFriends) {
			if (err) {
				console.log(err);
				return;
			} else {
				Notification.loadProfileFeed(uuid, function(err, feed) {
					if (err) {
						conosle.log(err);
						return;
					}
					
					User.findUserById(uuid, function(user, err) {
						if (err) {
							res.json("That user doesn't exist");
							return;
						}
						
						Friends.getAllFriendsOfUser(uuid, function(err, friends) {
							if (err) {
								console.log(err);
								return;
							}
							
							if (!checkFriends) {
								res.render('other_profile.ejs', 
										{ 
									user : JSON.stringify(omitPassword(user)),
									currUser : JSON.stringify(req.session.user),
									feed : JSON.stringify(feed), 
									friends : JSON.stringify(friends), 
									mssg : "Not Friends" });
								return;
							} else {
								res.render('other_profile.ejs', 
										{ 
									user : JSON.stringify(omitPassword(user)), 
									currUser : JSON.stringify(req.session.user),
									feed : JSON.stringify(feed), 
									friends : JSON.stringify(friends), 
									mssg : "Friends" });
								return;
							}
						});
					});
				});
			}
		});
	}
}

var update_profile = function (req, res) {
	var interest = req.body.interest;
	
	// Check if empty
	if (interest === "") {
		res.json("You didn't enter an interest!");
		return;
	}
	
	// Check for non-aplphabet characters
	if (!checkInput(interest)) {
		res.json("Your interest contains illegal characters!");
		return;
	}
	
	if (req.session.user.interests.includes("empty")) {
		req.session.user.interests = [interest];
	} else {
		req.session.user.interests.push(interest);
	}
	
	User.updateUser(req.session.user, {}, function(err) {
		if (err) {
			res.json("There was an error adding your interest!")
			return;
		}
		
		User.findUserById(req.session.user.uuid, function(user, err) {
			// Package the new interests array and code to the AJAX call
			var pkg = {
					code : 212,
					interests : user.interests
			}
			
			res.json(pkg);
			return;
		});
	});
}

/*
* This renders the index ejs
*/
var chat = function(req, res) {
	var friends = []; 
	Friends.getAllFriendsOfUser(req.session.user.uuid, function(err, friends) {
		if (err) {
			console.log(err);
			res.render('index.ejs', { user : JSON.stringify(req.session.user), fullname : req.session.user.fullname, friends: [], pic: req.session.user.profileimageurl});
			return;
		}

		else {
			console.log(friends)
			res.render('index.ejs', { user : JSON.stringify(req.session.user), fullname : req.session.user.fullname, friends: JSON.stringify(friends), pic: req.session.user.profileimageurl});
		}
	});
	
};

/*
* Finds the roomid or creates one
*/
var roomAccept = function(req, res) {
	var dataString = req.query.dataValue;
	var data = dataString.split(" ");
	//This is in format of reciever uuid + sender uuid
	var member = data[0] + "," + data[4];
	var memberReverse = data[4] + "," + data[0];
	
	Room.findRoom(member, function(err, data) {
		if (err) {
			console.log(err);
		} 
		//Check reverse member order
		else if (err == 0) {
			Room.findRoom(memberReverse, function(err, data) {
				if (err) {
					console.log(err);
				} 
				//Make a new room
				else if (err == 0) {
					Room.createRoom(member, function(err, data) {
						if (err) {
							return console.log(err);
						} else {
							var rData = {roomid: data.roomid}
							res.setHeader('Content-Type', 'text/plain');
							var send = JSON.stringify(rData);
				    		res.setHeader('Content-Length', send.length);
							res.end(send);
						}
					});
				}
				//Get the old room
				else {
					var rData = {roomid: JSON.parse(data).roomid}
					res.setHeader('Content-Type', 'text/plain');
					var send = JSON.stringify(rData);
				    res.setHeader('Content-Length', send.length);
					res.end(send);
				}
			});
		}
		//Get the old room
		else {
			var rData = {roomid: JSON.parse(data).roomid}
			res.setHeader('Content-Type', 'text/plain');
			var send = JSON.stringify(rData);
			res.setHeader('Content-Length', send.length);
			res.end(send);
		}
	});
}

/*
* Adds the message in database
*/
var addMessage = function(req, res) {
	var data = JSON.parse(req.body.data);
	var memberid = data.memberid;
	var roomid = data.roomid;
	var message = data.message;
	
	Chat.addMessage(roomid, memberid, message, function(err, data) {
		if (err) {
			return console.log(err);
		} else {
			res.json({ok: true})
		}
	});	
}

/*
* Gets the chat for the user
*/
var getChat = function(req, res) {
	console.log("roomid for chat is " + req.query.roomid);
	
	Chat.getChat(req.query.roomid, function(err, data) {
		if (err) {
			return console.log(err);
		} else {
			//console.log(JSON.parse(data)[0]);
			//var rData = {chat: data}
			res.setHeader('Content-Type', 'text/plain');
			var send = data
			res.setHeader('Content-Length', send.length);
			res.end(send);
			//console.log("DATA is " + JSON.parse(data).roomid);
		}
	});
}

/*
* Gets the user
*/
var user = function(req, res) {
	var rData = {user: req.session.user}
	res.setHeader('Content-Type', 'text/plain');
	var send = JSON.stringify(rData.user);
	res.setHeader('Content-Length', send.length);
	res.end(send);
}

var user_routes = {
	register : register,
	login : login,
	logout : logout,
	fetch_user : fetch_user,
	search : search,
	profile : profile,
	update_profile : update_profile,
	chat: chat,
	getRoom: roomAccept,
	addMessage: addMessage,
	getChat: getChat,
	user: user
};

module.exports = user_routes;

// <---------- Helper functions ---------->

/*
 * Helper function to validate names from input forms.
 */
function validName(name) {
	return name.match("^[A-Za-z0-9_ ]+$");
};

/*
 * Helper function to validate other inputs
 */
function checkInput(input) {
	return input.match(/^[a-zA-Z ]+$/);
}

/*
 * Helper function to validate email that are from Gmail. Prevents dot / plus
 * sign trick for spammers trying to create multiple accounts with the same
 * email or information for one user unintentionally being tied to multiple
 * accounts
 */
function gmailParser(gmail) {
	const regex = /(?:\.|\+.*)(?=.*?@gmail\.com)/g;
	const email = gmail;
	const subst = "";

	return email.replace(regex, subst);
};

/*
 * Helper function to validate general email inputs.
 */
function validEmail(email) {
	const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
			
	 if (regex.test(email)) {
	    return true;
	  }
	 
	 return false;
};

/*
 * Helper function to validate passwords inputs. Passwors must be at least 8
 * characters long, and contain at least one uppercase letter, one lowercase
 * letter, and one special character
 */
function sufficientPasswordDifficulty(password) {
	const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/gm;
	
	if(regex.test(password)) {
		return true;
	}
	
	return false;
};

/*
 * Stores the user in the session without revealing their hashed password
 */
function omitPassword(user) {
	var sessionUser = {
			uuid : user.uuid,
			email : user.email,
			firstname : user.firstname,
			lastname : user.lastname,
			fullname : user.fullname,
			birthdate : user.birthdate,
			affiliation : user.affiliation,
			profileimageurl : user.profileimageurl,
			online : user.online,
			interests : user.interests
	}
	
	return sessionUser;
}

/*
 * Helper function to check if a user is permitted to see a user's feed
 */
var areFriends = function (uuid, req, callback) {
	// If the user isn't going to their own profile, see if they are friends
	Friends.findByUserIds(uuid, req.session.user.uuid, function(err, friends) {
		if (err) {
			console.log(err);
			return;
		}
		
		callback(err, friends);
		return;
	});
}
