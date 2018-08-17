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
  var isTyping = $('#isTyping');
  var typing = false;
  var Session = {};
// Appends message to current client
  function sendMessage(){
    var message = $('#m').val();
    if(message.trim() || imageData){
      $('#m').val('');
      let time = new Date();
      var messageData = {time: time, username: username, message: message, color: color}
      if(sendingImage){
        messageData.img = imageData;
      }
      insertMessage(messageData);
      socket.emit('chat message', messageData);
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
      socket.emit('new user', {Username:username});
    }
  };

// Send message to other clients
  function insertMessage(data){
    data.time = new Date(data.time);
    let time = data.time.toLocaleTimeString();
    var dateTag = $('<span class="date">').text(time);  
    var userTag = $('<span class="username">').css("color", color).text(data.username);
    var contentTag = $('<span class="content">').text(data.message);
    var result = $('<li>').append('[',dateTag,'] ',userTag,' : ',contentTag);
    chat.append(result);
    if(data.img && data.message[0]!=='/'){
      sendImage(data.img);
    }
  };

  $('#UsernameInput').submit(function(evt){
      if(!username){
        setUsername();
      }
      return false
  });

  $("#messages").bind("DOMNodeInserted",function(){
    chat[0].scrollTop = chat[0].scrollHeight;
  });

  $('#ChatInput').submit(function(){
    sendMessage();
    socket.emit('user typing', {username: username, typing: false});
    typing = false;
    return false
  });

  // User is typing function
  $('input[id="m"]').keydown(function(){
    if(!typing){
      socket.emit('user typing', {username: username, typing: true});
      typing = true;
    }
  });

  $('input[id="m"]').focusout(function(){
    if(typing){
      socket.emit('user typing', {username: username, typing: false});
      typing = false;
    }
  });

  function showIsTyping(data){
    var user = $('<span class="username">').css("color", color).attr("id", data).text(data + ' is typing... ');
    isTyping.append(user);
    isTyping.fadeIn(200);
  };
  function stopIsTyping(username){
    var id = '#' + username;
    if($('#isTyping .username').length == 1){
      isTyping.fadeOut(200, function(){
        $(id).remove();
      });
    } else {
      $(id).remove();
    }
    
  };

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
  socket.on('user typing', function(data){
    showIsTyping(data);
  });
  socket.on('stop typing', function(data){
    stopIsTyping(data);
  });
  socket.on('disconnect', function(){
    announce("You have disconnected");
  });
  socket.on('reconnect', function(){
    announce("You have reconnected!");
    if(username){
        socket.emit('new user', Session);
    }
  });
  socket.on('Session',function(session){
    Session = session;
  });
});
