$(function() {
  var socket = io();
  var username;
  var chatroom = $('#chatroom');
  var login = $('#login');
  var chat = $('#messages');
  var colorPicker = $('#color');
  var color = colorPicker.val();
// Appends message to current client
  function sendMessage(){
    var message = $('#m').val();
    if(message.trim()){
      $('#m').val('');
      insertMessage({username: username, message: message, color: color});
      chat[0].scrollTop = chat[0].scrollHeight;
      socket.emit('chat message', message);
    }
    if(document.getElementById('img').files[0]){
      reader = new FileReader()
      reader.readAsDataURL(document.getElementById('img').files[0])
      socket.emit('image', reader.result);
    }
  };


  function announce(msg){
    chat.append($('<li>').addClass('announcement').text(msg));
    chat[0].scrollTop = chat[0].scrollHeight;
  };

  function setUsername(){
    username = $('#username').val();
    if(username.trim()){
      login.fadeOut();
      chatroom.fadeIn();
      socket.emit('new user', username);
    }
  };
  // Attempt at fixing the mobile undefined bug, didnt work but WIP
  // function resetUsername(){
  //   username = '';
  //   login.fadeIn();
  //   chatroom.fadeOut();
  // }
// Send message to other clients
  function insertMessage(data){
    var userTag = $('<span class="username">').css("color", data.color).text(data.username);
    var contentTag = $('<span class="content">').text(data.message);
    var result = $('<li>').append(userTag,' : ',contentTag);
    chat.append(result);
    chat[0].scrollTop = chat[0].scrollHeight;
  };

  $('#color').change(function(){
    color = colorPicker.val();
    socket.emit('change color', color);
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
  socket.on('load history', function(data){
    if(Array.isArray(data)){
      data.forEach((line)=>insertMessage(line))
    }
  });
  socket.on('user disconnect', function(data){
    announce(data.username + ' has disconnected!');
    // resetUsername();
  });
  socket.on('server message', function(message){
    announce(message);
  });
  socket.on('name change', function(name){
    username = name;
  });
  socket.on('image', function(data){
    var image = $('<img>').attr('src',data);
    chat.append(image);
  });
});