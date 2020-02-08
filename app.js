/*
 * Initialization for the general web application
 */
var express = require('express');
var session = require('express-session');
var home_routes = require('./routes/home_routes.js');
var user_routes = require('./routes/user_routes.js');
var status_routes = require('./routes/status_routes.js');
var friend_routes = require('./routes/friend_routes.js');
var app = express();

app.use(express.bodyParser());

app.use(express.logger("default"));

app.use(express.cookieParser());

app.use(express.session({
    secret: '1hcftunSGU',
    resave: true,
    saveUninitialized: true
}));

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/scripts'));

/*
 * Initialization for chat
 */
var server = require('http').createServer(app);
var io =  require('socket.io').listen(server);

var users = [];
var connections = [];
var sendUser = [];

app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
  app.use(function(req, res, next) {
    res.setHeader("Cache-Control", "no-cache must-revalidate");
    return next();
  });
};

/*
 *  Connections for socket io
 */
io.sockets.on('connection', function(socket) {
  var data = {
        firstname: socket.handshake.query.firstname,
        fullname: socket.handshake.query.fullname,
        email: socket.handshake.query.email,
        affiliation: socket.handshake.query.affiliation,
        uuid: socket.handshake.query.uuid,
        profileimageurl: socket.handshake.query.profileimageurl
  }
    connections.push(socket);
    //console.log("Connected: " + connections.length);
  sendUser.push(JSON.stringify(data));
  //console.log(data.fullname + " got pushed now length of send user is " + sendUser.length)
    data.socket = socket;
    users.push(data);
    //console.log(data.fullname + " got pushed now length is " + users.length)
  io.sockets.emit('users', sendUser);
  //console.log(users.length);

  /*
  *  When user disconnects
  */
  socket.on('disconnect', function(data) {
  //console.log("START  TO DISCONNECT")
    connections.splice(connections.indexOf(socket), 1);
    var index = (users.map(function(e) { return e.socket; }).indexOf(socket))
    if (index != -1) {
     var uuidSplit = users[index].uuid;
    }

    users.splice(users.map(function(e) { return e.socket; }).indexOf(socket), 1);
    //console.log("got user deleted now length of is " + users.length)
    
    for (i = 0; i < sendUser.length; i++) {
      var obj = JSON.parse(sendUser[i])
        //console.log(obj);
        if (obj.uuid == uuidSplit) {
          //console.log(i);
          sendUser.splice(i, 1);
            //console.log("got send user deleted now length of is " + sendUser.length)
            break;
        }
    }

    io.sockets.emit('users', sendUser);
  })

  /*
  for refreshing in page
  */
  socket.on('get users', function() {
    io.sockets.emit('users', sendUser);
  })
  
  /*
  *  When a request is sent to accept or reject
  * Format receiver id, receiver name (missing), receiver img (missing), sender id, sender name, sender image          
  */
  socket.on('chat request', function(data) {
    var dataString = data.split(",");
      for(i = 0; i < users.length; i++) {
        if (users[i].uuid == dataString[0]) { 
          io.to(users[i].socket.id).emit('request', dataString[0] + " " + users[i].fullname + " " + users[i].profileimageurl + " " + dataString[1] + " " + dataString[2] + " " + dataString[3] + " " + socket.id);
      }
      }
       
   });
  
  /*
  *  When requester gets the decision if other user has accepted
  * Format receiver id, receiver name (missing), receiver img (missing), sender id, sender name, sender image          
  */
  socket.on('accept', function(dataString) {
    var data = dataString.split(" ");
    //console.log(data);
    //console.log(data[data.length - 2]);
      io.to(data[data.length - 2]).emit('accept', dataString);
  });
  
  /*
  *  When requester gets the decision if other user has rejected
  * Format receiver id, receiver name (missing), receiver img (missing), sender id, sender name, sender image          
  */
  socket.on('reject', function(dataString) {
    var data = dataString.split(" ");
    io.to(data[data.length - 1]).emit('reject', dataString);
  });
  
  /*
  *  Send a message
  */
  socket.on('send message', function(data) {
    //console.log(JSON.parse(data));
    //socket.broadcast.emit('new message', {msg: data});
    socket.to(JSON.parse(data).roomid).emit('new message', {msg: JSON.parse(data).message});
  })

  /*
  *  Send a message to the whole group
  */
  socket.on('group send message', function(data) {
    //console.log(JSON.parse(data));
    //socket.broadcast.emit('new message', {msg: data});
    console.log((JSON.parse(data).fullname + ": " + JSON.parse(data).message))
    socket.to(JSON.parse(data).roomid).emit('new message', {msg: (JSON.parse(data).fullname + ": " + JSON.parse(data).message)});
  })
  
  /*
  *  Join a room
  */
  socket.on('join room', function(room) {
    socket.join(room);
  })

  /*
  * Leave a room
  */
  socket.on('leave room', function(room) {
    socket.leave(room);
  })

  /*
  * Send a group chat reques
  */
  socket.on('group chat request', function(data) {
  var dataString = data.split(",");
  for(i = 0; i < users.length; i++) {
        if (users[i].uuid == dataString[0]) { 
          io.to(users[i].socket.id).emit('group request', dataString[0] + " " + dataString[1] + " " + dataString[2] + " " + dataString[3] + " " + users[i].fullname + " " + socket.id);
      }
      }
  })

  /*
  * When a user accepts the group chat
  */
  socket.on('group accept', function(dataString) {
    var data = dataString.split(" ");
      //console.log("nn" + data);
    socket.to(data[3]).emit('group accept', dataString);
  });

  /*
  * When a user accepts the group chat
  */
  socket.on('group reject', function(dataString) {
    var data = dataString.split(" ");
    io.to(data[data.length - 1]).emit('group reject', dataString);
  });

})

/*
 * Stores the user without revealing their hashed password
 */
function omitPassword(user) {
	var sessionUser = {
			uuid : user.uuid,
			email : user.email,
			firstname : user.firstname,
			lastname : user.lastname,
			fullname : user.fullname,
			birthdate : user.birthdate,
			affiliation : user.affiliation,
			profileimageurl : user.profileimageurl,
			online : user.online,
			interests : user.interests
	}
	
	return sessionUser;
}

var loggedin = function(req) {
	return !!(req.session && req.session.user);
}

/*
 *  Loads the homepage for Pennbook
 */
app.get('/', function(req, res) {
	// Check if user is logged in
	if (loggedin(req)) {
		res.redirect('/home');
	}
	
	res.render('welcome.ejs');
});

//<------ User Routes ------>
app.post('/login', user_routes.login);
app.post('/register', user_routes.register);
app.get('/logout', user_routes.logout);
app.post('/search', user_routes.search);
app.post('/fetchuser', user_routes.fetch_user);
app.post('/updateprofile', user_routes.update_profile);
app.get('/:firstname.:lastname/:uuid', user_routes.profile);
app.get('/chat', user_routes.chat);
app.get('/user', user_routes.user);
app.get('/getRoom', user_routes.getRoom);
app.post('/addMessage', user_routes.addMessage);
app.get('/getChat', user_routes.getChat);

//<------- Status Routes ----------->
app.post('/updatestatus', status_routes.update_status);
app.post('/fetchstatus', status_routes.fetch_status);
app.post('/comment', status_routes.comment);
app.post('/loadcomments', status_routes.load_comments);
app.post('/newsfeed', status_routes.news_feed);

//<------ Home Routes -------->
app.get('/home', home_routes.home);

//<-------- Friend Routes ------->
app.post('/sendrequest', friend_routes.send_request);
app.post('/checkrequest', friend_routes.check_request);
app.post('/fetchrequests', friend_routes.fetch_requests);
app.post('/acceptrequest', friend_routes.accept_request);
app.post('/denyrequest', friend_routes.deny_request);
app.get('/friendvisualizer', friend_routes.visualizer);
app.get('/friendvisualization', friend_routes.friend_visualization);
app.get('/getFriends/:uuid', friend_routes.get_friends);
app.post('/onlinefriends', friend_routes.online_friends);
const fs = require('fs');
const readline = require('readline');
var friendRecommends = [[]]; 
app.get('/friendReccomendations', function(req, res) {
    
    const readInterface = readline.createInterface({
      input: fs.createReadStream('output.txt'),
      //output: process.stdout,
      console: false
    });

    readInterface.on('line', function(line) {
      var arrayFriend = [];
      var user = line.split("\t")[0];
      var userTrim = user.substring(1, user.length);
      var friends = line.split("\t")[1];
      var friendsArray = friends.split(" ");


      for (i = 0; i < friendsArray.length; i++) {

        if (i == 0) {
          arrayFriend.push(userTrim);
        }
        
        if (i == friendsArray.length - 1) {
            var trim = friendsArray[i].substring(1, friendsArray[i].length)
            arrayFriend.push(trim);
        } else {
            var trim = friendsArray[i].substring(1, friendsArray[i].length - 1)
            arrayFriend.push(trim);
        }
        
      }

      friendRecommends.push(arrayFriend);     
    }).on('close', function() {
          for (i = 0; i < friendRecommends.length; i++) {
            for(j = 0; j < friendRecommends[i].length; j++) {
               console.log(i + friendRecommends[i][j]);
            }
          }
          
          res.json(friendRecommends);
          return;
    });

    


})

/* Run the server */
server.listen(80);

console.log("Pennbook listening to 8080");

console.log('Author: Team G42');

console.log('Server running on port 8080. Now open http://localhost:8080/ in your browser!');

