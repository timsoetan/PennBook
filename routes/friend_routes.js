const async = require('async');
const Friends = require('../models/friends');
const User = require('../models/user');
const FriendRequest = require('../models/friend-request');

var loggedin = function(req) {
	return !!(req.session && req.session.user);
}

var send_request = function(req, res) {
	var requesterid = req.session.user.uuid;
	var recieverid = req.body.id;
	
	FriendRequest.createFriendRequest(requesterid, recieverid, function (err, sent) {
		if (err) {
			console.log(err);
			return
		} 
		
		// Package the alert and code to the AJAX call
		var pkg = {
				code : 212,
				alert : "Your friend request was sent!"
		}
		
		res.json(pkg);
		return;
	});
}

var check_request = function(req, res) {
	var requesterid = req.session.user.uuid;
	var recieverid = req.body.id;
	
	if (recieverid == requesterid) {
		FriendRequest.findByUserIds(req.body.id2, req.body.id, function (err, sent) {
			if (err) {
				console.log(err);
				return
			} 
			
			if (sent) {
				res.json(true);
				return;
			} else {
				res.json(null);
				return;
			}
		});
	} else {
	FriendRequest.findByUserIds(requesterid, recieverid, function (err, sent) {
		if (err) {
			console.log(err);
			return
		} 
		
		if (sent) {
			res.json(true);
			return;
		} else {
			res.json(null);
			return;
		}
	});
	}
}

var fetch_requests = function(req, res) {
	var uuid = req.body.userid;
	
	FriendRequest.findSentRequests(uuid, function(err, requests) {
		if (requests) {
			res.json(requests);
			return;
		} else {
			res.json([]);
			return;
		}
	});
}

var accept_request = function(req, res) {
	var friendship = {
			friendoneid : req.body.requesterid,
			friendtwoid : req.body.recieverid,
			creationdate : new Date()
	}
	
	Friends.createFriends(friendship, function(err) {
		if (!err) {
			FriendRequest.deleteRequest(req.body.requesterid, req.body.recieverid, function (err, deleted) {
				if (deleted) {
					res.json(true);
					return;
				} else {
					res.json(false);
					return;
				}
			});
		} else {
			res.json("There was an error accepting this request!");
			return;
		}
	});
}

var deny_request = function(req, res) {
	FriendRequest.deleteRequest(req.body.requesterid, req.body.recieverid, function (err, deleted) {
		if (deleted) {
			res.json(true);
			return;
		} else {
			res.json(false);
			return;
		}
	});
}

var visualizer = function(req, res) {
	// Check if user is logged in
	if (!loggedin(req)) {
		res.redirect('/');
		return;
	}
	
	res.render('friendvisualizer.ejs');
	return;
}

var friend_visualization = function(req, res) {
	// Check if user is logged in
	if (!loggedin(req)) {
		res.redirect('/');
		return;
	}
	
	var uuid = req.session.user.uuid;
	
	// Establish the current logged in user as our root node
	User.findUserById(uuid, function(user, err) {
		var userName = user.fullname;
		var children = [];
		
		// Find all the user's friends
		Friends.getAllFriendsOfUser(uuid, function(err, friendships) {
			if (err) {
				console.log(err);
				return;
			}
			
			var friends = [];
			
			// Parse the friendid from the friends model
			async.each(friendships, function(friendship, next) {
				var friendid = friendship.friendoneid;
				
				if (friendid == uuid) {
					friends.push(friendship.friendtwoid);
					next();
				} else {
					friends.push(friendid);
					next();
				}
			},
			function(err) {
				if (err) {
					console.log(err);
					return;
				}
				// Get the user model's for all of the root node's friends
				async.each(friends, function(idOfFriend, next) {
						User.findUserById(idOfFriend, function(friend, err) {
							var friendName = friend.fullname;
							var childrenOfFriend = [];
							
							
							// Now get all the friends of the root nodes friends
							Friends.getAllFriendsOfUser(idOfFriend, function(err, friendFriendships) {
								if (err) {
									console.log(err);
									return;
								}
								
								// Check if the the root node and friend have a
								// mutual friendship
								async.each(friendFriendships, function(friendFriendship, then) {
									var childId = friendFriendship.friendoneid;
									
									if (childId == idOfFriend) {
										childId = friendFriendship.friendtwoid;
									}
									
									if (friends.includes(childId)) {
											User.findUserById(childId, function(childOfFriend, err) {
												var childOfFriendName = childOfFriend.fullname;
												
												// Build the child node
												var childNode = {
													"id": childId,
													"name": childOfFriendName,
													"data": {},
													"children": []
												}
												
												childrenOfFriend.push(childNode);
												then();
											});
									} else {
										then();
									}
								}, function(err) {
									if (err) {
										console.log(err);
										return;
									}
									
									// Build the node for the root's friend
									var friendNode = {
										"id": idOfFriend,
										"name": friendName,
										"data": {},
										"children": childrenOfFriend								
									}
									
									
									children.push(friendNode);
									next();
								});
							});
						});
				},
				function(err) {
					if (err) {
						console.log(err);
						return;
					}
					
					// Build the root node of the network
					var rootNode = {
						"id": uuid,
						"name": userName,
						"data": {},
						"children": children					
					};
					
					res.json(rootNode);
					return;
				});
			});
		});
	});
}

var get_friends = function(req, res) {
	var currUuid = req.session.user.uuid;
	var nodeid = req.params.uuid;
	
	// Get the affiliation of the current user
	User.findUserById(currUuid, function(user, err) {
		if (err) {
			console.log(err);
			return;
		}
		
		var affiliation = user.affiliation;
		
		// Get all the friends of the current user
		Friends.getAllFriendsOfUser(currUuid, function(err, friendships) {
			if (err) {
				console.log(err);
				return;
			}
			
			var friends = [];
			
			// Parse the friendid from the friends model
			async.each(friendships, function(friendship, next) {
				var friendid = friendship.friendoneid;
				
				if (friendid == currUuid) {
					friends.push(friendship.friendtwoid);
					next();
				} else {
					friends.push(friendid);
					next();
				}
			},
			function(err) {
				if (err) {
					console.log(err);
					return;
				}
				
				// Get the friends of the user that was clicked
				Friends.getAllFriendsOfUser(nodeid, function(err, friendsFriendships) {
					
					var children = [];
					
					async.each(friendsFriendships, function(friendsFriendship, next) {
						var childId = friendsFriendship.friendoneid;
						
						if (childId == nodeid) {
							childId = friendsFriendship.friendtwoid;
						}
						
						// Check if the child is related to the root (affiliation / friends)
						User.findUserById(childId, function(child, err) {
							var childAffiliation = child.affiliation;
							var childName = child.fullname;
							
							if (childAffiliation == affiliation) {
									Friends.getAllFriendsOfUser(childId, function(err, childFriendships) {
										
										var childFriends = [];
										
										async.each(childFriendships, function(childFriendship, then) {
											var childFriendId = childFriendship.friendoneid;
											
											if (childFriendId == childId) {
												childFriendId = childFriendship.friendtwoid;
											}
											
											// See if root and child have a mutual friend
											if (friends.includes(childFriendId)) {
												User.findUserById(childFriendId, function(childFriend, err) {
													var childFriendName = childFriend.fullname;
												
													// Build node of friend
													var childFriendNode = {
														"id": childFriendId,
														"name": childFriendName,
														"data": {},
														"children": []
													}
													
													childFriends.push(childFriendNode);
													then();
												});	
											} else {
												then();
											}
										}, function(err) {
											if (err) {
												console.log(err);
												return;
											}
											
											// Build the node for child with same affiliation
											var childNode = {
												"id": childId,
												"name": childName,
												"data": {},
												"children": childFriends								
											}
											
											children.push(childNode);
											next();
										});
									});
								} else {
									next();
								}
							});
					}, function(err) {
						if (err) {
							console.log(err);
							return;
						}
						
						// Build the new node
						User.findUserById(nodeid, function(node, err) {
							var newNode = {
								"id": nodeid,
								"name": node.fullname,
								"data": [],
								"children": children
							};
							
							
							res.json(newNode);
							return;
						});
					});
				});
			});	
	  });
	});
}

var online_friends = function(req, res) {
	var uuid = req.session.user.uuid;
	
	Friends.getAllFriendsOfUser(uuid, function(err, friends) {
		if (err) {
			console.log(err);
			return;
		}
		
		res.json(friends);
		return;
	});
}

var friend_routes = {
		send_request : send_request,
		check_request : check_request,
		fetch_requests : fetch_requests,
		accept_request : accept_request,
		deny_request : deny_request,
		visualizer : visualizer,
		friend_visualization : friend_visualization,
		get_friends : get_friends,
		online_friends : online_friends
};

module.exports = friend_routes;