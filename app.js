var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = {};

app.use(express.static("public"));
app.set("view engine", "ejs");

var history = [];
var UsersOnline = []


app.get("/", function (req, res) {
	res.render('index');
});

io.on('connection', function (socket) {
	var newUser = true;

	socket.on('new user', function (name) {
		if (newUser) {
			console.log(name);
			var user = {
				username:name,
				uuid:socket.id
			};
			UsersOnline.push(user)
			socket.username = name;
			socket.color = '#000002';
		}
		
		socket.broadcast.emit('user connected', {
			username: socket.username
		});
		socket.emit('load history', history);
	});

	socket.on('disconnect', function () {
		socket.broadcast.emit('user disconnect', {
			username: socket.username
		});
		UsersOnline = UsersOnline.filter((user) => user.uuid !== socket.id);
	});

	socket.on('change color', function (color) {
		socket.color = color;
	});

	socket.on('chat message', function (msg) {
		if (msg[0] !== '/') {
			socket.broadcast.emit('chat message', {
				message: msg,
				username: socket.username,
				color: socket.color
			});

			history.push({
				message: msg,
				username: socket.username,
				color: socket.color
			})
			if (history.length > 20) {
				history.shift();
			}
		} else {
			// Store the command in a variable
			var command = msg.split(' ')[0];
			// Verify which command the user input
			switch (command) {
				case '/help':
					socket.emit('server message', 'Commands available : "/help","/list","/username"');
					break;
				case '/list':
					socket.emit('server message', "The users online are : " + UsersOnline.map((user)=>user.username).toString());
					break;
				case '/username':
				    var newUsername = msg.split(' ').filter((word) => word !== '/username').join(' '); 
				    if(newUsername.trim()){
				    	var msg = "Name has been changed to : " + newUsername;
					    UsersOnline = UsersOnline.filter((user) => user.uuid !== socket.id);
						var user = {
							username:newUsername,
							uuid:socket.id
						};
						UsersOnline.push(user);
						socket.username = newUsername;
					    socket.emit('name change', newUsername);
						socket.emit('server message', msg);
				    } else {
				    	socket.emit('server message', "Sorry good sir, invalid username");
				    }				    
					break;
				default:
					socket.emit('server message', 'No command found type "/help" for a list of commands');
					break;
			}
		}


	});
});

http.listen(3000, function () {
	console.log("Server started on *:3000");
});