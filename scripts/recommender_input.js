var async = require('async');
const Friends = require('../models/friends');
const User = require('../models/user');
var fs = require('fs');

var file = "";

// Get all of the users in Pennbook
User.getAllUsers(function (err, users) {
	
	// For each user get their, friends, affiliations and interests
	async.each(users, function(user, next) {
			
		// User's affiliations
		file +=  "$" + user.uuid + "\t" +  "@" + user.affiliation.toLowerCase();
		
		var interests = "&["
		// Users's interests
		if (!user.interests.includes("empty")) {
			for (var i = 0; i < user.interests.length; i++) {
				if (i == user.interests.length - 1) {
					interests += user.interests[i].toLowerCase() + "]";
				} else {
					interests += user.interests[i].toLowerCase() + ",";
				}
			}
			file += "\t" + interests + "\n";
		} else {
			file += "\t" + "&[]" + "\n";
		}
		
		var friends = "*["
		// User's friends
		Friends.getAllFriendsOfUser(user.uuid, function(err, friendships) {
			if (friendships.count == 0) {
				file += "$" + user.uuid + "\t" + "[]" + "\n";
				next();
			}
			
			for (var i = 0; i < friendships.length; i++) {
				var friendid = friendships[i].friendoneid;
				
				if (friendid == user.uuid) {
					friendid = friendships[i].friendtwoid;
				}
				
				if (i == friendships.length - 1) {
					friends += "$" + friendid + "]"
					file += "$" + user.uuid + "\t" + friends + "\n";
					next();
				} else {
					friends += "$" + friendid + ","
				}
			}
		});
	},
	function(err) {
		var time = new Date().getTime();
		
		// Write the values to a file
		fs.writeFile("Pennbook-Recommendations-" + time + ".txt", file, function(err) {
			if (err) {
				console.log(err);
			}
		}); 	
  });
});