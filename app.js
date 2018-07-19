var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", function(req, res){
	res.render('index');
});

io.on('connection', function(socket){
	// console.log('A user connected');
	socket.on('disconnect', function(){
		// console.log('A user disconnected');
	});
	socket.on('chat message', function(msg){
		// console.log('message: ' + msg);
		io.emit('chat message', msg);
	});
});

http.listen(3000, function(){
	console.log("Server started on *:3000");
});