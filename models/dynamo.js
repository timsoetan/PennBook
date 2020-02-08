const dynamo = require('dynamoose');
const shortId = require('shortid');
dynamo.AWS.config.loadFromPath('./config.json');

const Schema = dynamo.Schema;

/*
 * User model
 */
const userSchema = new Schema({
	uuid: {
	    type: String,
	    hashKey: true,
	    default: shortId.generate
	},
	email: {
		type: String,
		required: true,
		unique: true,
		index: {
			name: 'EmailIndex',
			global: true,
			rangeKey: 'uuid',
			project: true
		}
	},
	firstname: {
		type: String,
		trim: true,
		required: true,
		index: {
			name: 'NameIndex',
			global: true,
			rangeKey: 'lastname',
			project: true
		}
	},
	lastname: {
		type: String,
		trim: true,
		required: true
	},
	fullname: {
		type: String,
		trim: true,
		required: true
	},
	searchname: {
		type: String,
		trim: true,
		required: true
	},
	birthdate: {
		type: Date,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	affiliation: {
		type: String,
		required: true,
		index: {
			name: 'AfilliationIndex',
			global: true,
			rangeKey: 'lastname',
			project: true
		}
	},
	profileimageurl: {
		type: String,
		required: true
	},
	online: {
		type: Boolean,
		required: true
	},
	interests: {
		type: [String],
		required: true
	}
});

/*
 * Status schema
 */
const statusSchema = new Schema({
	statusid: {
	    type: String,
	    hashKey: true,
	    default: shortId.generate
	},
	creatorid: {
		type: String,
		required: true,
		index: {
			name: 'CreatorIdIndex',
			global: true,
			rangeKey: 'creationdate',
			project: true
		}
	},
	recieverid: {
		type: String,
		required: true,
		index: {
			name: 'RecieverIdIndex',
			global: true,
			rangeKey: 'creationdate',
			project: true
		}
	},
	content: {
		type: String,
		required: true
	},
	creationdate: {
		type: Date,
		required: true,
		rangeKey: true,
		index: {
			name: 'CreationDateIndex',
			global: true,
			rangeKey: 'creatorid',
			project: true
		}
	},
	photo: {
		type: String,
		required: true
	},
	type: {
		type: String,
		required: true
	},
	likes: [String]
});


/*
 *  Friend schema
 */
const friendsSchema = new Schema({
	friendshipid: {
	    type: String,
	    hashKey: true,
	    default: shortId.generate
	},
	friendoneid: {
	    type: String,
	    required: true,
	    index: {
			name: 'FriendOneIndex',
			global: true,
			rangeKey: 'creationdate',
			project: true
		}
	},
	friendtwoid: {
		type: String,
		required: true,
		rangeKey: true,
		index: {
			name: 'FriendTwoIndex',
			global: true,
			rangeKey: 'creationdate',
			project: true
		}
	},
	creationdate: {
		type: Date,
		required: true
	}
});

/*
 *  Friend Request schema
 */
const friendRequestSchema = new Schema({
	friendrequestid: {
	    type: String,
	    hashKey: true,
	    default: shortId.generate
	},
	requesterid: {
	    type: String,
	    required: true,
	    index: {
			name: 'FriendRequestRequesterIndex',
			global: true,
			rangeKey: 'creationdate',
			project: true
		}
	},
	recieverid: {
		type: String,
		required: true,
		index: {
			name: 'FriendRequestRecieverIndex',
			global: true,
			rangeKey: 'creationdate',
			project: true
		}
	},
	creationdate: {
		type: Date,
		required: true
	}
});

/*
 *  Comment schema
 */
const commentSchema = new Schema({
	commentid: {
	    type: String,
	    hashKey: true,
	    default: shortId.generate
	},
	statusid: {
	    type: String,
	    required: true,
	    index: {
			name: 'StatusIndex',
			global: true,
			rangeKey: 'creationdate',
			project: true
		}
	},
	commentorid: {
		type: String,
		required: true,
		index: {
			name: 'CommentorIndex',
			global: true,
			rangeKey: 'creationdate',
			project: true
		}
	},
	content: {
		type: String,
		required: true
	},
	creationdate: {
		type: Date,
		required: true
	},
	likes: [String]
});

/*
 *  Notification schema
 */
const notificationSchema = new Schema({
	notificationid: {
	    type: String,
	    hashKey: true,
	    default: shortId.generate
	},
	sourceid: {
	    type: String,
	    required: true,
	    index: {
			name: 'SourceIdIndex',
			global: true,
			rangeKey: 'creationdate',
			project: true
		}
	},
	recieverid: {
		type: String,
		required: true,
		index: {
			name: 'RecieverIdIndex',
			global: true,
			rangeKey: 'creationdate',
			project: true
		}
	},
	ownerid: {
		type: String,
		required: true,
		index: {
			name: 'OwnerIdIndex',
			global: true,
			rangeKey: 'creationdate',
			project: true
		}
	},
	creationdate: {
		type: Date,
		required: true
	},
	type: {
		type: String,
		required: true
	},
	typeid: {
		type: String,
		required: true
	}
});

/*
*  Room Schema
*/
const roomSchema = new Schema({
	roomid: {
		type: String,
		hashKey: true,
		default: shortId.generate
	},
	membersid: {
		type: String,
		required: true,
		rangeKey: true,
		index: {
			name: 'MemberIndex',
			global: true,
			rangeKey: 'roomid',
			project: true
		},	
	}
})

/*
  Chat Schema
*/
const chatSchema = new Schema({
	roomid: {
		type: String,
		required: true,
		hashKey: true	
	},
	message: {
		type: String,
		required: true,
	},
	memberid: {
		type: String,
		required: true
	},
	creationdate: {
		type: Date,
		required: true,
		rangeKey: true
	}
})

/*
 * Create tables in DynamoDB
 */
const User = dynamo.model('users', userSchema);
const Status = dynamo.model('statuses', statusSchema);
const Friends = dynamo.model('friends', friendsSchema);
const FriendRequest = dynamo.model('friendrequests', friendRequestSchema);
const Comment = dynamo.model('comments', commentSchema);
const Notification = dynamo.model('notifications', notificationSchema);
const Room = dynamo.model('rooms', roomSchema)
const Chat = dynamo.model('chat', chatSchema)

module.exports = {
		User: User,
		Status: Status,
		Friends: Friends,
		FriendRequest: FriendRequest,
		Notification: Notification,
		Comment: Comment,
		dynamo: dynamo,
		Room: Room,
		Chat: Chat
};