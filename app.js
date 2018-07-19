var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = {};

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", function(req, res){
	res.render('index');
});

io.on('connection', function(socket){
	var newUser = true;
	
	socket.on('new user', function(name){
		if(newUser){
			console.log(name);
			socket.username = name;
		}
		socket.broadcast.emit('user connected', {
			username: socket.username
		});
	});

	socket.on('disconnect', function(){
	});
	socket.on('chat message', function(msg){
		// console.log('message: ' + msg);
		socket.broadcast.emit('chat message', {
			message: msg,
			username: socket.username
		});
	});
});

http.listen(3000, function(){
	console.log("Server started on *:3000");
});