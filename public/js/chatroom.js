$(function() {
  var socket = io();
  var username;
  var chatroom = $('#chatroom');
  var login = $('#login');
  var chat = $('#messages');
  var colorPicker = $('#color');
  var color = colorPicker.val();
  var imagePicker = $('input:file');
  var sendingImage = false;
  var imageData;
// Appends message to current client
  function sendMessage(){
    var message = $('#m').val();
    if(message.trim()){
      $('#m').val('');
      insertMessage({username: username, message: message, color: color});
      socket.emit('chat message', message);
    }
  };

  $('input:file').change(function(event){
    var img = $(this)[0].files[0];
    var reader = new FileReader();
    reader.addEventListener("load", function(){
      sendingImage = true;
      imageData = reader.result;
    }, false);
    if(img){
      reader.readAsDataURL(img);
    }
  });

  function sendImage(data){
    var chatImage = $('<img>').attr("src", data).addClass('chatImage');
    var result = $('<li>').append(chatImage);
    chat.append(result);
    sendingImage = false;
    imageData = '';
    imagePicker.val('');
  }

  function announce(msg){
    chat.append($('<li>').addClass('announcement').text(msg));
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
  };

  $('#color').change(function(){
    color = colorPicker.val();
    socket.emit('change color', color);
  });

  $(document).keydown(function(evt){
    if(evt.keyCode === 13){
      if(username){
        sendMessage();
        if(sendingImage){
          socket.emit('image', imageData);
        }
      }else{
        setUsername();
      }
    }
  });

  $("#messages").bind("DOMNodeInserted",function(){
    chat[0].scrollTop = chat[0].scrollHeight;
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
    if(sendingImage){
      socket.emit('image', imageData);
    }
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
    sendImage(data);
  });
});