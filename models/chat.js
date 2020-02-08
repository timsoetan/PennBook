const dynamo = require('./dynamo');

module.exports = {
		// Stores a chat for a roomid in our 'chats' table
		addMessage: function (roomid, member, message, callback) {
			var newMessage = new dynamo.Chat({
				roomid: roomid,
				memberid: member,
				message: message,
				creationdate: Date.now()
			});
	
			newMessage.save(function (err, data) {
				if (err) {
					callback(err, data);
				} else {
					callback(err, data);
				}
			})
		},
		
		// Gets the chat for a roomid from our 'chats' table
		getChat: function (roomid, callback) {
			dynamo.Chat.query('roomid').eq(roomid).exec(function (err, data) {
				if (err) {
					callback(err, data)
				} else {
					callback(null, JSON.stringify(data))
				}
			});
		},
};