const dynamo = require('./dynamo');

module.exports = {
		// Creates a comment in our 'comments' table in DynamoDB
		createComment : function(statusid, commentorid, content, callback) {
			var newComment = new dynamo.Comment({
				statusid : statusid,
				commentorid : commentorid,
				content : content,
				creationdate : new Date()
			});

			newComment.save(function(err) {
				if (err) {
					callback(err);
				} else {
					callback(null);
				}
			});
		},
		
		// Checks is a friendrequest exists between two users
		loadCommentsByStatusId : function(statusid, callback) {
			dynamo.Comment.query('statusid').eq(statusid).ascending()
				.exec(function (err, comments) {
					if (err) {
						console.log(err);
					} else if (comments.count == 0) {
						callback(null, []);
					} else if (comments.count != 0) {
						callback(null, comments);
					}
				});
		}
		
};