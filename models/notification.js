const dynamo = require('./dynamo');

module.exports = {
		
	// Save a new notification to our DynamoDB 'notifications' table
	createNotification : function(notification, callback) {
		var newNotification = new dynamo.Notification({
			sourceid : notification.sourceid,
			recieverid : notification.recieverid,
			ownerid : notification.ownerid,
			creationdate : notification.creationdate,
			type : notification.type,
			typeid : notification.typeid
		});
		
		newNotification.save(function(err) {
			if (err) {
				callback(err);
			} else {
				callback(null);
			}
		});
	},
	
	loadNewsFeed : function (userid, callback) {
		dynamo.Notification.query('ownerid').eq(userid).ascending()
		.exec(function (err, feed) {
			if (err) {
				callback(err, null);
			}
			
			callback(null, feed);
		});
	},
	
	loadProfileFeed : function (userid, callback) {
		var profileFeed = [];
		
		dynamo.Notification.query('ownerid').eq(userid).filter('sourceid').eq(userid).filter('recieverid').not().eq(userid)
			.exec(function (err, feedpartone) {
				if (err) {
					console.log(err);
					callback(err, null);
				}
				
				dynamo.Notification.query('ownerid').eq(userid).filter('recieverid').eq(userid).filter('sourceid').not().eq(userid)
					.exec(function (err, feedparttwo) {
						if (err) {
							console.log(err);
							callback(err, null);
						}
						
						dynamo.Notification.query('ownerid').eq(userid).filter('recieverid').eq(userid).filter('sourceid').eq(userid)
						.exec(function (err, feedpartthree) {
							if (err) {
								console.log(err);
								callback(err, null);
							}
							
							profileFeed = feedpartone.concat(feedparttwo).concat(feedpartthree);
							profileFeed.sort((a, b) => (a.creationdate > b.creationdate) ? 1 : -1);
							callback(null, profileFeed);
						});
					});
			});
	}

};