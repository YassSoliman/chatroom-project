var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = {};
var SecretCode = new Date().getTime();
app.use(express.static("public"));
app.set("view engine", "ejs");
var User = require('./Object/User');
const PORT = process.env.PORT || 5000

var history = [];
var UsersOnline = []
var number = 0;

app.get("/", function (req, res) {
	res.render('index');
});

function IsNewUser(user){
	return !UsersOnline.some((userIndex)=>user.isEqual(userIndex));
}
io.on('connection', function (socket) {
    var newUser = true;
	socket.emit('load history', history);
	socket.on('new user', function (data) {

		var user = new User(data.Username,socket.id,SecretCode,data.token);
		if(IsNewUser(user)){
			UsersOnline.push(user);
			socket.username = data.Username;
			newUser = false;
			socket.broadcast.emit('user connected', {
				username: socket.username
			});

			socket.emit('Session',user.MakeSession());
		}else{
			UsersOnline = UsersOnline.filter((user) => user.id !== socket.id);
		}
		UsersOnline.push(user);

		
	});

	socket.on('disconnect', function () {
        if (!newUser) {
            UsersOnline = UsersOnline.filter((user) => user.id !== socket.id);
            socket.broadcast.emit('user disconnect', {
            	username: socket.username
            });
        }
	});

	socket.on('chat message', function (data) {
		var msg = data.message;
        if (msg[0] !== '/') {

			socket.broadcast.emit('chat message', data);
			history.push(data)

			if (history.length > 20) {
				history.shift();
			}
		} else {
			var commandList = ["/help","/list","/username","/msg"];
			// Store the command in a variable
			var command = msg.split(' ')[0];
			// Verify which command the user input
			switch (command) {
				case '/help':
					socket.emit('server message', 'Commands available : '+commandList.toString());
					break;
				case '/list':
					socket.emit('server message', "The users online are : " + UsersOnline.map((user)=>user.username).toString());
					break;
				case '/username':
				    var newUsername = msg.split(' ').filter((word) => word !== '/username').join(' '); 
				    if(newUsername.trim()){
				    	var msg = "Name has been changed to : " + newUsername;
					    UsersOnline = UsersOnline.filter((user) => user.id !== socket.id);
						var user = {
							username:newUsername,
							id:socket.id
						};
						UsersOnline.push(user);
						socket.username = newUsername;
					    socket.emit('name change', newUsername);
						socket.emit('server message', msg);
				    } else {
				    	socket.emit('server message', "Sorry good sir, invalid username");
				    }				    
					break;
				case '/msg':
					var userToMessage = msg.split(' ')[1];
					userToMessage = UsersOnline.find((user)=>user.username==userToMessage);
					if(userToMessage){
						var whisperMessage = msg.split(' ').slice(2).join(' ');
						socket.to(userToMessage.id).emit('chat message',{
							message: whisperMessage,
							username: socket.username,
							color: data.color
						});
					}else{
						socket.emit('server message', 'No user found');
					}
				break;
				default:
					socket.emit('server message', 'No command found type "/help" for a list of commands');
					break;
			}
		}
	});
	socket.on('image',function(data){
		socket.broadcast.emit('chat message',data)
	});
	/*socket.on('user typing', function(data){
		if(data.typing){
			socket.broadcast.emit('user typing', socket.username);
		} else {
			socket.broadcast.emit('stop typing', socket.username);
		}
	});
*/
});

http.listen(PORT, function () {
	console.log(`Server started on ${ PORT }`);
});
