$(function() {
  var socket = io();
  var username;
  var chatroom = $('#chatroom');
  var login = $('#login');

  function sendMessage(){
    var message = $('#m').val();
    if(message.trim()){
      $('#m').val('');
      $('#m')[0].scrollTop = $('#m')[0].scrollHeight;
      $('#messages').append($('<li>').text(username+' : '+message));
      socket.emit('chat message', message);
    }
  };

  function log(msg){
    $('#messages').append($('<li>').text(msg));
    $('#messages').scrollTop($('#messages')[0].scrollHeight);

  };

  function setUsername(){
    username = $('#username').val();
    if(username.trim()){
      login.fadeOut();
      chatroom.fadeIn();
      socket.emit('new user', username);
    }
  }

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
    log(data.username + " : " + data.message);
  });
  socket.on('user connected', function(data){
    log(data.username + ' has connected!');
  });
  socket.on('load history', function(data){
    if(Array.isArray(data)){
      data.forEach((line)=>log(line.username + " : " + line.message))
    }
  });
  socket.on('user disconnect', function(data){
    log(data.username + ' has disconnected!');
  });
  socket.on('server message', function(message){
    log(message);
  });
});