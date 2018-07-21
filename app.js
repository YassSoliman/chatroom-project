var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = {};

app.use(express.static("public"));
app.set("view engine", "ejs");

var history = [];
var UsersOnline = []


app.get("/", function(req, res){
	res.render('index');
});

io.on('connection', function (socket) {
	var newUser = true;

	socket.on('new user', function (name) {
		if (newUser) {
			console.log(name);
			UsersOnline.push(name)
			socket.username = name;
			socket.color = '#000002';
		}
		socket.broadcast.emit('user connected', {
			username: socket.username
		});
		socket.emit('load history',history);
	});

	socket.on('disconnect', function () {
		socket.broadcast.emit('user disconnect', {
			username: socket.username
		});
		UsersOnline.filter((user)=>user!==socket.username);


	socket.on('change color', function(color){
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
				username: socket.username
			})
			if (history.length > 20) {
				history.shift();
			}
		}else{
			//chat command
			switch(msg){
				case '/help':
				socket.emit('server message', 'Commands available: "/help","/list"');
				break;
				case '/list':
					socket.emit('server message', "The users online are :"+UsersOnline.toString());
				break;
				default:
					socket.emit('server message', 'No command found type "/help" for a list of commands');
				break;
			}
		}


});

http.listen(3000, function () {
	console.log("Server started on *:3000");
});