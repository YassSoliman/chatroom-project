$(function() {
  var socket = io();
  var username;
  var chatroom = $('#chatroom');
  var login = $('#login');
  var chat = $('#messages');
  var colorPicker = $('#color');
  var color = colorPicker.val();

  function sendMessage(){
    var message = $('#m').val();
    if(message.trim()){
      $('#m').val('');
      insertMessage({username: username, message: message});
      chat[0].scrollTop = chat[0].scrollHeight;
      socket.emit('chat message', message);
    }
  };

  function announce(msg){
    chat.append($('<li>').text(msg));
  };

  function setUsername(){
    username = $('#username').val();
    if(username.trim()){
      login.fadeOut();
      chatroom.fadeIn();
      socket.emit('new user', username);
    }
  };

  function insertMessage(data){
    var userTag = $('<span class="username">').text(data.username);
    var contentTag = $('<span class="content">').text(data.message);
    var result = $('<li>').append(userTag,' : ',contentTag);
    chat.append(result);
  };

  $('#color').change(function(){
    color = colorPicker.val();
    socket.emit('color change', color)
    console.log(color);
  });

  $(document).keydown(function(evt){
    if(evt.keyCode === 13){
      if(username){
        sendMessage();
      }else{
        setUsername();
      }
    }
  });

  $('form').on('keyup keypress', function(e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode === 13) { 
      e.preventDefault();
      return false;
    }
  });

  $('form').submit(function(){
    sendMessage();
    return false
  });

  socket.on('chat message', function(data){
    insertMessage(data);
  });
  socket.on('user connected', function(data){
    announce(data.username + ' has connected!');
  });
  socket.on('user disconnect', function(data){
    announce(data.username + ' has disconnected!');
  });
});