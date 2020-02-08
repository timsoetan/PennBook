$(document).ready(function() {     

	populateUserInfo();
	
	// Refresh feed
	window.setInterval(function(){
		  getNewsFeed();
		}, 5000);
        
	// Refresh online friends
	window.setInterval(function(){
		  getOnlineFriends();
		}, 5000);
	
    // Live Search
    $('#search-box').keyup(function() {
    	var params = $('#search-box').val();

        if (params.replace(/\s/g, "") != "") {
        	$.post('/search', {
                search: params
            },
            	function(results) {
                	if (typeof(results) == 'string') {
                		console.log(results);
                	} else {
                		$('#autocompleteTest').empty();
                		display(results);
                	}
            });
          } else {
            $('#autocompleteTest').empty();
          }
    });
});

function getNewsFeed() {
	$.post('/newsfeed', function(newsFeed) {
		for (var i = 0; i < newsFeed.length; i++) {
		    if (newsFeed[i].type == ("Status Update")) {
		    	if (!document.getElementById("post-" + newsFeed[i].typeid)) {
		      $.post('/fetchstatus', {
		          id: newsFeed[i].typeid
		        },
		        function(status) {
		          if (typeof(status) == 'string') {
		            console.log(response);
		          } else {
		           $.post('/fetchuser', {
					id : status.creatorid
				}, function(user1) {
					$.post('/fetchuser', {
						id : status.recieverid
					}, function(user2) {
						createStatus(status, user1, user2, 0);
					});
				});
		          }
		        });
		    	}
		    }
		  } 
	});
}

// Loads the currently logged in user's friend recommendations
function getRecommendations() {
	var recommendedFriends = []
	
    $.get('/friendReccomendations', function(recommendations) {
    		for (var i = 0; i < recommendations.length; i++) {
    			if (recommendations[i][0] == uuid) {
    				recommendedFriends = recommendations[i][1].split(",");
    				break;
    			} else {
    				continue;
    			}
    		}
    		
    		// Display the friend recommendations
    		for (var i = 0; i < recommendedFriends.length; i++) {
    			displayRecommendation(recommendedFriends[i]);
    		}
    });
}

// Display the recommended friend
function displayRecommendation(recommendedFriend) {
        var userid = recommendedFriend.replace("$", "");
	$.post('/fetchuser', {
		id : userid
	}, function(friend) {
		if (friend) {
				var main = document.getElementById("friendrecommendations");
			  	var a = document.createElement("a");
			  	a.className = "pennbook-friend-user-link";
			  	a.href = "/" + friend.firstname.replace(/\s/g, "") + "." + friend.lastname.replace(/\s/g, "") + "/" + friend.uuid;
			  
			  	var div = document.createElement("div");
			  	div.className = "d-flex bd-highlight";
			  	
			  	var div2 = document.createElement("div");
			  	div2.className = "p-2 flex-fill bd-highlight";
			  	div2.style.width = "100%";
			  	div2.style.position = "relative";
			  	
			  	var img = document.createElement("img");
			  	img.className = "pennbook-user-profileimg";
			  	img.src = friend.profileimageurl;
			  	
			  	var span = document.createElement("span");
			  	span.className = "card-text";
			  	span.innerHTML = friend.fullname;
			  	
			  	a.append(img);
			  	a.append(span);
			  	div2.append(a);
			  	div.append(div2);
			  	main.append(div);
		}
	});
}


// Searches for user's in Pennbook
function search() {
	var params = $('#search-box').val();

    if (params.replace(/\s/g, "") != "") {
    	$.post('/search', {
            search: params
        },
        	function(results) {
            	if (typeof(results) == 'string') {
            		console.log(results);
            	} else {
            		$('#autocompleteTest').empty();
            		display(results);
            	}
        });
      } else {
        $('#autocompleteTest').empty();
      }
}


// Diplays results from search
function display(results) {
	var main = document.getElementById('autocompleteTest');

    for (var i = 0; i < results.length; i++) {
    	var a = document.createElement("a");
        a.className = "pennbook-post-user-link";
        a.href = "/" + results[i].firstname.replace(/\s/g, "") + "." + results[i].lastname.replace(/\s/g, "") + "/" + results[i].uuid;
        
        var li = document.createElement("li");
        li.style.width = "100%";
        li.style.height = "40px";
        li.style.background = "#E0ECF9";
        li.style.color = "#0666D0";
        li.style.padding = "10px";
        li.innerHTML = results[i].fullname;

        if (i == results.length - 1) {
        	li.style.borderBottomLeftRadius = "10px";
            li.style.borderBottomRightRadius = "10px";
        }

        var hr = document.createElement("hr");
        hr.style.width = "92%";

        a.append(li);
        if (i != results.length - 1) {
            a.append(hr);
        }
        
        main.append(a);
    }
}

// <---- Various functions for populating a user's info --------->
function populateUserInfo() {
        updateName();
        updateProfileImg();
        updateProfileLinks();
        setupStatusUpdate();
        populateNewsFeed();
        loadRequests();
        getOnlineFriends();
        getRecommendations();
}

// Fetches the current logged in user's friends who are currently online
function getOnlineFriends() {
	$.post('/onlinefriends', function(friends) {
		for (var i = 0; i < friends.length; i++) {
			if (uuid == friends[i].friendoneid) {
				loadOnlineFriend(friends[i].friendtwoid);
			} else {
				loadOnlineFriend(friends[i].friendoneid);
			}
		}
	});
}

// Place the friends into the online friends column
function loadOnlineFriend(friendid) {
	$.post('/fetchuser', {
		id : friendid
	}, function(friend) {
		if (friend) {
			if (friend.online && !document.getElementById("friend-" + friendid)) {
				var main = document.getElementById("onlinefriends");
			  	
			  	var a = document.createElement("a");
			  	a.className = "pennbook-friend-user-link";
			  	a.href = "/" + friend.firstname.replace(/\s/g, "") + "." + friend.lastname.replace(/\s/g, "") + "/" + friend.uuid;
			  
			  	var div = document.createElement("div");
			  	div.className = "d-flex bd-highlight";
			  	div.id = "friend-" + friendid;
			  	
			  	var div2 = document.createElement("div");
			  	div2.className = "p-2 flex-fill bd-highlight";
			  	div2.style.width = "100%";
			  	div2.style.position = "relative";
			  	
			  	var img = document.createElement("img");
			  	img.className = "pennbook-user-profileimg";
			  	img.src = friend.profileimageurl;
			  	
			  	var span = document.createElement("span");
			  	span.className = "card-text";
			  	span.innerHTML = friend.fullname;
			  	
			  	var online = document.createElement("span");
			  	online.className = "dot";
			  	online.style.height = "10px";
			  	online.style.width = "10px";
			  	online.style.borderRadius = "50%";
			  	online.style.backgroundColor = "#3CB371";
			  	online.style.display = "inline-block";
			  	online.style.float = "right";
			  	online.style.marginTop = "8px";
			  	
			  	a.append(img);
			  	a.append(span);
			  	div2.append(a);
			  	div2.append(online);
			  	div.append(div2);
			  	main.append(div);
			} else if (friend.online && document.getElementById("friend-" + friendid)) {
				return;
			} else if (!friend.online && document.getElementById("friend-" + friendid)) {
				document.getElementById("friend-" + friendid).remove();
			} else if (!friend.online && !document.getElementById("friend-" + friendid)) {
				return;
			}
		}
	});
}

// Updates the appropriate name fields based on the current logged in user
function updateName() {
  var name = document.getElementsByClassName("pennbook-user-name");

  for (var i = 0; i < name.length; ++i) {
    name[i].innerHTML = user.fullname;
  }

  var statusHint = document.getElementById("message");
  statusHint.placeholder = "What's on your mind, " + user.firstname + "?"
};

// Updates the appropriate user profile image fields based on the current logged
// in user
function updateProfileImg() {
  var currUserProfileImg = document.getElementsByClassName("pennbook-curruser-profileimg")


  for (var i = 0; i < currUserProfileImg.length; ++i) {
    currUserProfileImg[i].src = profileimageurl;
  }

};

// Updates links back to current logged in user's profile page
function updateProfileLinks() {
  var currUserProfileLinks = document.getElementsByClassName("pennbook-curruser-profile")

  for (var i = 0; i < currUserProfileLinks.length; ++i) {
    currUserProfileLinks[0].href = "/" + user.firstname.replace(/\s/g, "") + "." + user.lastname.replace(/\s/g, "") + "/" + user.uuid;
  }

  var navBarLink = document.getElementById("nav-bar-profile-link");

  navBarLink.href = "/" + user.firstname.replace(/\s/g, "") + "." + user.lastname.replace(/\s/g, "") + "/" + user.uuid;
};

// Sets up status update container for post on homepage
function setupStatusUpdate() {
  var statusUpdateForm = document.getElementsByName("status-update-form");

  statusUpdateForm[0].id = uuid;
};

/*
 * AJAX call to populate the user's profile feed
 */ 
function populateNewsFeed() {
  for (var i = 0; i < feed.length; i++) {
    if (feed[i].type == ("Status Update")) {
      $.post('/fetchstatus', {
          id: feed[i].typeid
        },
        function(status) {
          if (typeof(status) == 'string') {
            console.log(response);
          } else {
           $.post('/fetchuser', {
			id : status.creatorid
		}, function(user1) {
			$.post('/fetchuser', {
				id : status.recieverid
			}, function(user2) {
				createStatus(status, user1, user2, 0);
			});
		});
          }
        });
    }
  }
}

/*
 * AJAX call to make a post to Pennbook homepage
 */
function updateStatus() {
	var userid = uuid;
	
	var status = {
			creatorid : userid,
			recieverid : userid,
			content : $('textarea#message').val(),
			creationdate : new Date(),
			photo : "empty",
			type : "public",
			likes : []
	}
	
	$.post('/updatestatus', {
		status
	}, function(response) {
		if (typeof (response) == 'string') {
			showSnackbar(response, "snackbar")
		} else if (response.code == 212) {
			$.post('/fetchuser', {
				id : response.status.creatorid
			}, function(user1) {
				$.post('/fetchuser', {
					id : response.status.recieverid
				}, function(user2) {
					console.log(user2);
					createStatus(response.status, user1, user2, 0)
					$('textarea#message').val("");
					showSnackbar("Your status has been updated!", "successsnackbar");
				});
			});
		}
	});
};

/*
 * Builds display for loaded status update
 */
function createStatus(newStatus, statusCreator, statusReciever, type) {
  	var statusid = newStatus.statusid;
    var creationdate = newStatus.creationdate;
    var content = newStatus.content;
    var creatorid = newStatus.creatorid;
    var recieverid = newStatus.recieverid;

    var main = document.getElementById('update-status-box');
    var tmpl = document.getElementById('template');

    var status = tmpl.content.cloneNode(true);

    	status.querySelector('.gedf-card').id = "post-" + statusid;
		status.querySelector('.pennbook-post-name').innerText = statusCreator.fullname;
    	status.querySelector('.pennbook-post-creator-link').href = "/" + statusCreator.firstname.replace(/\s/g, "") + "." + statusCreator.lastname.replace(/\s/g, "") + "/" + statusCreator.uuid;
    	status.querySelector('.pennbook-post-user-image-link').href = "/" + statusCreator.firstname.replace(/\s/g, "") + "." + statusCreator.lastname.replace(/\s/g, "") + "/" + statusCreator.uuid;
    	status.querySelector('.pennbook-post-profile-img').src = statusCreator.profileimageurl;
    	status.querySelector('.divider').id = "status-" + statusid;
    	status.querySelector('.divider').style.maxHeight = "100px";
    	status.querySelector('.divider').style.overflow = "auto";
    	status.querySelector('.divider').scrollTop = status.querySelector('.divider').scrollHeight
    	status.querySelector('.pennbook-post-time').innerText = getRelativeDate(new Date(), new Date(creationdate));
    	status.querySelector('.pennbook-post-content').innerText = content;
    	status.querySelector('.form-control').id = statusid + "";
    	status.querySelector('.btn-primary').onclick = function(){comment(statusid, creatorid); return false;};
	
	if (statusCreator.uuid != statusReciever.uuid) {
    	status.querySelector('.pennbook-post-reciever-name').innerText = statusReciever.fullname;
    	status.querySelector('.pennbook-post-reciever-link').href = "/" + statusReciever.firstname.replace(/\s/g, "") + "." + statusReciever.lastname.replace(/\s/g, "") + "/" + statusReciever.uuid;
    } else {
    	status.querySelector('.pennbook-post-reciever-name').remove();
    	status.querySelector('.pennbook-post-reciever-link').remove();
    	status.querySelector('.fa-caret-right').remove();
    }
	
	// Load comments on status
	$.post('/loadcomments', {
		statusid
	}, function(comments) {
		for (var i = 0; i < comments.length; i++) {
			createComment(comments[i], statusid);
		}
	});

    if (type == 1) {
      main.appendChild(status);
    } else {
      $(status).insertAfter("#main");
    }
 } 

// Helper function to create a comment
function createComment(comment, statusid) {
	var content = comment.content
	var commentorid = comment.commentorid
	
	$.post('/fetchuser', {
		id : commentorid
	}, function(commentor) {
		var a = document.createElement("a");
	    a.className = "pennbook-comment-user-link";
	    a.href = "/" + commentor.firstname.replace(/\s/g, "") + "." + commentor.lastname.replace(/\s/g, "") + "/" + commentor.uuid;
		  
	  	var div = document.createElement("div");
	  	div.className = "d-flex bd-highlight";
		  	
	  	var div2 = document.createElement("div");
	  	div2.className = "p-2 flex-fill bd-highlight";
		  	
	  	var img = document.createElement("img");
	  	img.className = "pennbook-user-profileimg";
	  	img.src = commentor.profileimageurl;
		  	
	  	var span = document.createElement("span");
	  	span.className = "card-text";
	  	span.innerHTML = commentor.fullname;
		  	
	  	var span2 = document.createElement("span");
	  	span2.className = "card-text";
	  	span2.style.display = "inline-block";
	  	span2.style.marginLeft = "10px";
	  	span2.style.fontSize = "13px";
	  	span2.innerHTML = content;
		  	
	  	a.append(img);
	  	a.append(span);
	  	div2.append(a);
	  	div2.append(span2);
	  	div.append(div2);
	  	document.getElementById("status-" + statusid).append(div);
	  	updateScroll(statusid);
	});
}

// Helper function to scroll to bottom when comment is added
function updateScroll(statusid){
    var element = document.getElementById("status-" + statusid);
    element.scrollTop = element.scrollHeight;
}


/*
 * AJAX call to load any potential friend requests recieved
 */
function loadRequests() {
	var userid = uuid;
	
	$.post('/fetchrequests', {
		userid
	}, function(requests) {
		displayRequests(requests);
	});
}

// Displays friend requests in dropdown menu
function displayRequests(requests) {
	// Check if there are no friend requests
	if (requests === undefined || requests.length == 0) {
	    var main = document.getElementById("friendrequests");
	    
	    var div = document.createElement("div");
	  	div.className = "d-flex bd-highlight";
	  	
	  	var div2 = document.createElement("div");
	  	div2.className = "p-2 flex-fill bd-highlight";
	  	
	  	var span = document.createElement("span");
	  	span.className = "card-text";
	  	span.style.paddingLeft = "17px";
	    span.style.color = "#606770";
	    span.style.fontWeight = "400";
	  	span.innerHTML = "No Friend Requests At This Time";
	  	
	  	div2.append(span);
	  	div.append(div2);
	  	main.append(div);
	} else {
		var main = document.getElementById("friendrequests");
		var badge = document.getElementById("requestsVal");
		var numRequests = document.createElement("span");
		
		numRequests.className = "badge badge-pill badge-danger";
		numRequests.setAttribute("id", "numRequests");
		numRequests.innerHTML = requests.length;
		
		badge.append(numRequests);
		
		requests.forEach(function(request) {
			$.post('/fetchuser', {
				 id : request.requesterid
			}, function(user) {
				
				  	var div = document.createElement("div");
				  	div.className = "d-flex bd-highlight";
				  	div.setAttribute("id", request.friendrequestid);
				  	
				  	var div2 = document.createElement("div");
				  	div2.className = "p-2 flex-fill bd-highlight";
				  	
				  	var a = document.createElement("a");
					a.className = "pennbook-friend-user-link";
					a.href = "/" + user.firstname.replace(/\s/g, "") + "." + user.lastname.replace(/\s/g, "") + "/" + user.uuid;
				  	
				  	var img = document.createElement("img");
				  	img.className = "pennbook-user-profileimg";
				  	img.src = user.profileimageurl;
				  	img.style.position = "absolute";
				  	
				  	var span = document.createElement("span");
				  	span.className = "card-text";
				  	span.innerHTML = user.fullname;
				  	span.style.position = "relative";
				  	span.style.display = "inline-block";
				  	span.style.width = "7em";
				  	span.style.marginLeft = "35px";
				  	
				  	var accept = document.createElement("button");
				  	accept.className = "btn";
				  	accept.style.position = "absolute";
				  	accept.style.right = "86px";
				  	accept.style.lineHeight = ".75";
				  	accept.style.width = "70px";
				  	accept.innerHTML = "Accept";
				  	accept.style.fontSize =  ".875rem";
				    accept.style.fontweight = "600";
				    accept.style.background = "#E7F5ED";
				    accept.style.color = "#3CB371";
				  	accept.onclick = function(){acceptRequest(user.uuid, uuid, request.friendrequestid, user.firstname); event.stopPropagation();};
				  	
				  	var deny = document.createElement("button");
				  	deny.className = "btn";
				  	deny.style.position = "absolute";
				  	deny.style.right = "8px";
				  	deny.style.lineHeight = ".75";
				  	deny.style.width = "70px";
				  	deny.innerHTML = "Deny";
				  	deny.style.fontSize =  ".875rem";
				    deny.style.fontweight = "600";
				    deny.style.background = "#FCE7E6";
				    deny.style.color = "#eb4034";
				  	deny.onclick = function(){denyRequest(user.uuid, uuid, request.friendrequestid); event.stopPropagation();};
				  
				  	a.append(img);
				  	a.append(span);
				  	div2.append(a);
				  	div2.append(accept);
				  	div2.append(deny);
				  	div.append(div2);
				  	main.append(div);
			});
		});
	}
}

// Accept a request
function acceptRequest(requesterid, recieverid, id, requestername) {
	$.post('/acceptrequest', {
		requesterid,
		recieverid
	}, function(success) {
		if (success) {
			updateStatusFriends(requesterid, recieverid, requestername);
			
			document.getElementById(id).remove();
			
			var numRequests = document.getElementById("numRequests");
			var newNumRequests = parseInt(numRequests.innerHTML) - 1;
			
			if (newNumRequests > 0) {
				numRequests.innerHTML = newNumRequests;
			} else {
				numRequests.remove();
				displayRequests([]);
			}
		}
	});
}

/*
 * AJAX call to make a post accepting a Friend request
 */
function updateStatusFriends(requesterid, recieverid, requestername) {
	var status = {
			creatorid : recieverid,
			recieverid : requesterid,
			content : user.firstname + " and " + requestername + " just became friends.",
			creationdate : new Date(),
			photo : "empty",
			type : "public",
			likes : []
	}
	
	$.post('/updatestatus', {
		status
	}, function(response) {
		if (typeof (response) == 'string') {
			showSnackbar(response, "snackbar")
		} else if (response.code == 212) {
			$.post('/fetchuser', {
				id : response.status.creatorid
			}, function(user1) {
				$.post('/fetchuser', {
					id : response.status.recieverid
				}, function(user2) {
					console.log(user2);
					createStatus(response.status, user1, user2, 0)
					showSnackbar("Your just added a new friend!", "successsnackbar");
				});
			});
		}
	});
};

// Deny a request
function denyRequest(requesterid, recieverid, id) {
	$.post('/denyrequest', {
		requesterid,
		recieverid
	}, function(success) {
		if (success) {
			document.getElementById(id).remove();
			
			var numRequests = document.getElementById("numRequests");
			var newNumRequests = parseInt(numRequests.innerHTML) - 1;
			
			if (newNumRequests > 0) {
				numRequests.innerHTML = newNumRequests;
			} else {
				numRequests.remove();
				displayRequests([]);
			}
		}
	});
}

/*
 * Shows snackbar that displays mesages recieved from AJAX calls
 */
function showSnackbar(response, type) {
	var snackbar = document.getElementById(type);

	snackbar.className = "show";
	snackbar.innerHTML = response;

	setTimeout(function() {
		snackbar.className = snackbar.className.replace("show", "");
	}, 3000);
};

/*
 * AJAX call to comment on a post
 */
function comment(statusid, creatorid) {
	var statusid = statusid
	var content = document.getElementById(statusid).value;
	var creatorid = creatorid;
	
	$.post('/comment', {
		statusid,
		content,
		creatorid
	}, function(comment) {
		if (typeof (comment) == 'string') {
			showSnackbar(comment, "snackbar")
		} else if (comment = 212) {
			var comment = {
					content : content,
					commentorid :  uuid
			}
			createComment(comment, statusid)
			showSnackbar("Your comment was posted!", "successsnackbar");
		}
	});
}

/*
 * Helper function to get relative time date stamp
 */
function getRelativeDate(current, previous) {

  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + ' Seconds Ago';
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + ' Minutes Ago';
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + ' Hours Ago';
  } else if (elapsed < msPerMonth) {
    return 'approximately ' + Math.round(elapsed / msPerDay) + ' Days Ago';
  } else if (elapsed < msPerYear) {
    return 'approximately ' + Math.round(elapsed / msPerMonth) + ' Months Ago';
  } else {
    return 'approximately ' + Math.round(elapsed / msPerYear) + ' Years Ago';
  }
}
