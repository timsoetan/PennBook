const async = require('async');
const Status = require('../models/status');
const Friends = require('../models/friends');
const Notification = require('../models/notification');
const User = require('../models/user');
const Comment = require('../models/comment');

var update_status = function(req, res) {
	var status = req.body.status;

	// Status text validation
	if (status.content.replace(/\s/g, "") === "") {
		res.json("Your status update is empty!");
		return;
	}

	// Update relevant information for status
	status.creatorid = req.session.user.uuid;
	status.recieverid = status.recieverid || status.creatorid;
	status.likes = [];

	validate(
			status,
			function(err, validated) {
				if (err) {
					res.json("There was an error validating your status!");
					return;
				} else if (!validated) {
					res.json("You cant't post a status update here!");
					return;
				}

				// Create the status
				Status
						.createStatus(
								status,
								function(err) {
									if (err) {
										res
												.json("There was an error creating your status!");
										return;
									}

									// Fetch newly published status
									Status
											.findByCreationDate(
													status.creationdate,
													function(publishedStatus,
															err) {
														if (publishedStatus) {
															status = publishedStatus;

															// Package the
															// status and code
															// to the AJAX call
															var pkg = {
																code : 212,
																status : publishedStatus
															}

															res.json(pkg);

															// Send the status
															// update to all of
															// a user's friends
															var friends = [];

															async
																	.waterfall(
																			[
																					function sendOriginalNotifs(
																							finished) {
																						async
																								.parallel(
																										[
																												function(
																														next) {
																													newNotification(
																															friends,
																															status.creatorid,
																															status,
																															res,
																															next);
																												},
																												function(
																														next) {
																													newNotification(
																															friends,
																															status.recieverid,
																															status,
																															res,
																															next);
																												} ],
																										function(
																												err,
																												notifications) {
																											finished(err);
																										});
																					},
																					function getNetwork(
																							finished) {
																						// Get
																						// all
																						// friends
																						// of
																						// the
																						// creator
																						Friends
																								.getAllFriendsOfUser(
																										status.creatorid,
																										function(
																												err,
																												friends) {
																											// Posting
																											// on
																											// own
																											// wall
																											if (status.creatorid === status.recieverid) {
																												return finished(
																														err,
																														friends);
																											}

																											Friends
																													.getAllFriendsOfUser(
																															status.recieverid,
																															function(
																																	err,
																																	additionalfriends) {
																																finished(
																																		err,
																																		friends
																																				.concat(additionalfriends));
																															});
																										});
																					},
																					function sendNotifsToNetowrk(
																							friends,
																							finished) {
																						async
																								.each(
																										friends,
																										function(
																												friend,
																												next) {
																											var mutualid = null;

																											if (friend.friendoneid == status.recieverid
																													&& friend.friendtwoid == status.creatorid) {
																												return;
																											} else if (friend.friendoneid == status.creatorid
																													&& friend.friendtwoid == status.recieverid) {
																												return;
																											} else if (friend.friendoneid == status.recieverid) {
																												mutualid = friend.friendtwoid;
																											} else if (friend.friendtwoid == status.recieverid) {
																												mutualid = friend.friendoneid;
																											}

																											newNotification(
																													friends,
																													mutualid,
																													status,
																													res,
																													next);
																										},
																										finished);
																					} ],
																			function(
																					err) {
																				if (err) {
																					console
																							.log(err);
																					console
																							.log("here");
																					return;
																				}
																			});
														}
													});
								});

				return;
			});
}

/*
 * Fetches a status based on it's id and sends it back to AJAX call
 */
var fetch_status = function(req, res) {
	Status.findById(req.body.id, function(status, err) {
		if (status) {
			res.json(status);
			return;
		}
	})
}

/*
 * Posts a comment on a given status
 */
var comment = function(req, res) {
	var statusCreatorId = req.body.creatorid;
	var statusid = req.body.statusid
	var commentorid = req.session.user.uuid;
	var content = req.body.content;

	// See if user's are friends
	if (statusCreatorId != commentorid) {
		Friends.findByUserIds(statusCreatorId, commentorid, function(err,
				friends) {
			if (err) {
				console.log(err);
				return;
			}
			console.log(friends);

			if (!friends) {
				User.findUserById(statusCreatorId, function(user, err) {
					if (user) {
						res.json("Become friends to post on " + user.firstname
								+ "'s statuses!");
						return;
					}
				});
			} else {
				// Comment text validation
				if (content.replace(/\s/g, "") === "") {
					res.json("Your comment is empty!");
					return;
				}

				Comment.createComment(statusid, commentorid, content, function(
						err) {
					if (!err) {
						res.json(212);
						return;
					} else {
						console.log(err);
					}
				});
			}
		});
	} else {

		// Comment text validation
		if (content.replace(/\s/g, "") === "") {
			res.json("Your comment is empty!");
			return;
		}

		Comment.createComment(statusid, commentorid, content, function(err) {
			if (!err) {
				res.json(212);
				return;
			} else {
				console.log(err);
			}
		});
	}
}

var load_comments = function(req, res) {
	var statusid = req.body.statusid;

	Comment.loadCommentsByStatusId(statusid, function(err, comments) {
		res.json(comments);
		return;
	});
}

var news_feed = function(req, res) {
	Notification.loadNewsFeed(req.session.user.uuid, function (err, feed) {
		if (err) {
			console.log(err);
			return;
		}
		
		res.json(feed);
		return;
	});
}

var status_routes = {
	update_status : update_status,
	fetch_status : fetch_status,
	load_comments : load_comments,
	comment : comment,
	news_feed : news_feed
};

module.exports = status_routes;

// <------- Helper Functions ------->
/*
 * Helps see if a status update is valid
 */
var validate = function(status, finished) {
	// Check if user is posting to their own wall
	if (status.creatorid === status.recieverid) {
		return async.nextTick(function() {
			finished(null, true);
		});
	} else {
		Friends.findByUserIds(status.creatorid, status.recieverid, function(
				err, friendships) {
			console.log(friendships);
			finished(err, friendships);
			return;
		});
	}
}

/*
 * Creates a notification
 */
var newNotification = function(friends, ownerid, status, res, finished) {
	if (friends.includes(ownerid)) {
		return async.nextTick(finished);
	}

	var notification = {
		sourceid : status.creatorid,
		recieverid : status.recieverid,
		ownerid : ownerid,
		creationdate : status.creationdate,
		type : "Status Update",
		typeid : status.statusid
	};

	friends.push(ownerid);

	Notification.createNotification(notification, finished);
}
