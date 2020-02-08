const dynamo = require('./dynamo');

module.exports = {
		// Creates a friend request in our 'friendrequests' table in DynamoDB
		createFriendRequest : function(requesterid, recieverid, callback) {
			var newFriendRequest = new dynamo.FriendRequest({
				requesterid : requesterid,
				recieverid : recieverid,
				creationdate : new Date()
			});

			newFriendRequest.save(function(err) {
				if (err) {
					callback(err);
				} else {
					callback(null);
				}
			});
		},
		
		// Checks is a friendrequest exists between two users
		findByUserIds : function(requesterid, recieverid, callback) {
			dynamo.FriendRequest.query('requesterid').eq(requesterid).filter('recieverid').eq(recieverid)
				.exec(function (err, sent) {
					if (err) {
						console.log(err);
					} else if (sent.count == 0) {
						callback(null, false);
					} else if (sent.count != 0) {
						callback(null, true);
					}
				});
		},
		
		// Find friend requests sent to a user
		findSentRequests : function(recieverid, callback) {
			dynamo.FriendRequest.query('recieverid').eq(recieverid)
			.exec(function (err, recieved) {
				if (err) {
					console.log(err);
				} else if (recieved.count == 0) {
					callback(null, false);
				} else if (recieved.count != 0) {
					callback(null, recieved);
				}
			});
		},
		
		// Delete friend request from 'friendrequests' table
		deleteRequest : function(requesterid, recieverid, callback) {
			dynamo.FriendRequest.query('recieverid').eq(recieverid).filter('requesterid').eq(requesterid)
			.exec(function (err, found) {
				if (err) {
					console.log(err);
				} else if (found.count == 0) {
					callback(null, false);
				} else if (found.count != 0) {
					found[0].delete(function(err) {
						if (!err) {
							callback(null, true);
						}
					})
				}
			});
		}
		
};