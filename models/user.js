const dynamo = require('./dynamo');
const bcrypt = require('bcrypt');

module.exports = {

	// Save a new user to our DynamoDB 'users' table
	createUser : function(firstname, lastname, birthdate, email, password,
			affiliation, callback) {
		var newUser = new dynamo.User({
			email : email,
			firstname : firstname,
			lastname : lastname,
			fullname : firstname + " " + lastname,
			searchname : firstname.toLowerCase().replace(/\s/g, "") + lastname.toLowerCase().replace(/\s/g, ""),
			birthdate : birthdate,
			password : password,
			affiliation : affiliation,
			profileimageurl : "/assets/deafultprofileimg.png",
			online : true,
			interests : ["empty"]
		});

		newUser.save(function(err) {
			if (err) {
				callback(err);
				console.log(err);
			} else {
				callback(null);
			}
		});
	},

	// Looks for a user in our 'users' table based on supplied email
	findUserByEmail : function(email, callback) {
		dynamo.User.query('email').eq(email).exec(function(err, user) {
			if (user.count == 0) {
				callback(null, "Email not found!")
			} else if (user.count != 0) {
				callback(user[0], null);
			}
		});
	},

	// Looks for a user in our 'users' table based on email, then checks that
	// supplied password compares to hash
	authenticateUser : function(email, password, callback) {
		dynamo.User
				.query('email')
				.eq(email)
				.exec(
						function(err, user) {
							if (user.count == 0) {
								callback(null,
										"No user was found with supplied credentials!");
							} else {
								bcrypt
										.compare(
												password,
												user[0].password,
												function(err, authenticated) {
													if (err) {
														callback(null,
																"There was an error trying to log in!");
													} else if (authenticated) {
														callback(authenticated,
																null);
													} else {
														callback(null,
																"No user was found with supplied credentials!");
													}
												});
							}
						});
	},

	// Looks for a user in our 'users' table based on supplied userid
	findUserById : function(userid, callback) {
		dynamo.User.query('uuid').eq(userid).exec(function(err, user) {
			if (err) {
				console.log(err);
			}
			
			if (user.count == 0) {
				callback(null, "User not found!")
			} else if (user.count != 0) {
				callback(user[0], null);
			}
		});
	},

	// Updates the information of a user in out 'users' table
	updateUser : function(user, params, callback) {
		dynamo.User.update(user, function(err) {
			if (err) {
				callback(err);
			} else {
				callback(null);
			}
		})
	},

	// Searches for names in our 'users' table that contain the search parameter
	searchUsersByName : function(search, callback) {
		dynamo.User.scan('searchname').beginsWith(search).limit(20).exec(
				function(err, users) {
					if (!err) {
						if (users.count == 0) {
							callback(null, "No users found!");
						} else if (users.count != 0) {
							callback(users, null);
						}
					}
				});
	},
	
	// Gets all the users signed up with Pennbook
	getAllUsers : function(callback) {
		dynamo.User.scan().consistent().exec(function(err, users) {
			if (!err) {
				callback(null, users);
			}
		});
	}

};