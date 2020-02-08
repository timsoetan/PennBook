const dynamo = require('./dynamo');

module.exports = {

	// Save a new friendship to our DynamoDB 'friends' table
	createFriends : function(friendship, callback) {
		var newFriendship = new dynamo.Friends({
			friendoneid : friendship.friendoneid,
			friendtwoid : friendship.friendtwoid,
			creationdate : friendship.creationdate
		});

		newFriendship.save(function(err) {
			if (err) {
				callback(err);
			} else {
				callback(null);
			}
		});
	},

	// Find a friendship in our 'friends' table by id
	findById : function(friendshipid, callback) {
		dynamo.Friends.query('friendshipid').eq(friendshipid).exec(
				function(err, friendships) {
					if (friendships.count == 0) {
						callback(null, "Friendship wasn't found!");
					} else if (friendships.count != 0) {
						callback(friendships[0], null);
					}
				})
	},

	// Finds a friendship in our 'friends' table given two user ids
	findByUserIds : function(userid1, userid2, callback) {
		dynamo.Friends.query('friendoneid').eq(userid1).filter('friendtwoid').eq(userid2)			
			.exec(function(err, friendship) {
				if (err) {
					console.log(err);
				} else if (friendship.count != 0) {
					callback(null, true);
					return;
				}
				
				dynamo.Friends.query('friendoneid').eq(userid2).filter('friendtwoid').eq(userid1)			
					.exec(function(err, friendship) {
						if (err) {
							console.log(err);
						} else if (friendship.count != 0) {
							callback(null, true);
							return;
						} else {
							callback(null, false);
						}
					});
		});
	},

	// Gets all of a user's friends
	getAllFriendsOfUser : function(userid, callback) {
		dynamo.Friends.query('friendoneid').eq(userid)
			.exec(function (err, tryFriends1) {
			if (!err) {
					dynamo.Friends.query('friendtwoid').eq(userid)
						.exec(function (err, tryFriends2) {
							if (!err) {
								var friendships = tryFriends1.concat(tryFriends2);
								
								if (friendships.length == 0) {
									callback(null, []);
								} else {
									callback(null, friendships);
								}
							} else {
								callback(err, null);
							}
						});
			} else {
				callback(err, null);
			}
		});
	},

};