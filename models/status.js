const dynamo = require('./dynamo');

module.exports = {

	// Save a new status to our DynamoDB 'statuses' table
	createStatus : function(status, callback) {
		var newStatus = new dynamo.Status({
			creatorid : status.creatorid,
			recieverid : status.recieverid,
			content : status.content,
			creationdate : status.creationdate,
			photo : status.photo,
			type : status.type,
			likes : status.likes
		});

		newStatus.save(function(err) {
			if (err) {
				callback(err);
			} else {
				callback(null);
			}
		});
	},
	
	findById: function(statusid, callback) {
		dynamo.Status.query('statusid').eq(statusid).exec(function (err, statuses) {
			if (statuses.count == 0) {
				callback(null, "Status wasn't found!");
			} else if (statuses.count != 0) {
				callback(statuses[0], null);
			}
		});
	},
	
	findByCreationDate: function(creationdate, callback) {
		dynamo.Status.query('creationdate').eq(creationdate).exec(function (err, statuses) {
			if (statuses.count == 0) {
				callback(null, "Status wasn't found!");
			} else if (statuses.count != 0) {
				callback(statuses[0], null);
			}
		});
	}

};