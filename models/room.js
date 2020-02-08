const dynamo = require('./dynamo');

module.exports = {
		// Creates a room for a user in our 'rooms' table based on members
		createRoom: function (membersid, callback) {
			var newRoom = new dynamo.Room({
				membersid: membersid,
			});
	
			newRoom.save(function (err, data) {
				if (err) {
					callback(err, data);
				} else {
					callback(err, data);
				}
			})
		},
		
		//Find user using the members id
		findRoom: function (membersid, callback) {
			dynamo.Room.query('membersid').eq(membersid).exec(function (err, user) {
				if (err) {
					callback(err, "membersid not found!")
				} else if (user.count == 0) {
					callback(0, user.count)
				} else {
					callback(null, JSON.stringify(user[0]))
				}
			});
		}
};