// Logic that interacts direclty with teh browser-based user interface using jQuery.
// First functionality you'll add will be to display text data.

// Two helper functions to display text data
// One will be untrusted text data, that is data from the user
// Other is trusted text, i.e. text from the server about name/room changes

// The idea is to prevent XXS

function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
  return $('<div></div>').html('<i>'+message+'</i>');
}

// Processing user input

function processUserInput(chatApp, socket) {
  // Get user input value
  var message = $('#send-message').val();
  var systemMessage;
  // If user input begins with slash, treat it as command
  if (message.charAt(0) == '/') {
    systemMessage = chatApp.processCommand(message);
    if (systemMessage) {
  // systemMessage will return false to break out
      $('#messages').append(divSystemContentElement(systemMessage));
    }
  } else {
  // Broadcast noncommand input to other users
    chatApp.sendMessage($('#room').text(),message);
  // Removed for now, use socket to display your text
  //  $('#messages').append(divEscapedContentElement(message));
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
  }
  // Clear messages
  $('#send-message').val('');
}

// Handles client-side initiaiton of Socket.IO event handling
var socket = io.connect();

$(document).ready(function(){
  // Instantiate Chat class
  var chatApp = new Chat(socket);

  // Listener for when nameResult is triggered
  socket.on('nameResult', function(result){
    var message;

    if (result.success) {
      message = "You are now known as " + result.name + ".";
    } else {
      message = result.message;
    }
    $('#messages').append(divSystemContentElement(message));
  });

  // Listener for when joinResult is triggered
  socket.on('joinResult',function(result) {
    $('#room').text(result.room);
    $('#messages').append(divSystemContentElement('Room changed.'));
  });

  // Listener for when message is triggered
  // Triggered when socket broadcast message to all in users in a room
  socket.on('message', function(message)  {
    // Display received messages from other users

    // Parse Name and message
    var nameLength = message.text.indexOf(':');
    var name = message.text.substr(0,nameLength);
    // Change the parse if the type is join
    if (message.type ==='join') {
      var msg = message.text;
    } else {
      var msg = message.text.substr(name.length+1,message.text.length);
    }
    // Get local time
    var time = new Date().toLocaleTimeString();
    // Create HTML elements
    var messageWrapper = $('<div class="chat-message group"></div>');
    var messageHeader = $('<div class="msg-header"></div>');
    var headerInfo = $('<div class="header-info group"></div>');
    var messageBody = $('<div class="group"></div>').text(msg);
    // Display header flushed left if socket is trigger users' own message
    if (message.type === "self" || !message.type) {
      var timeElement = $('<span class="time">'+time+'</span>');
      headerInfo.append('<div class="headerUserLogo"><div class="user-icon"></div>' + '<b>'+name+'</b>'+'</div>')
        .append(timeElement);
    // Display msg header flusehd right if socket is tirggered from other users
    } else if (message.type === "broadcast") {
      var timeElement = $('<span class="time timeRight">'+time+'</span>');
      headerInfo.append('<div class="headerBroadcastLogo"><div class="broadcast-icon"></div>' + '<b class="nameBroadcast">'+name+'</b>'+'</div>')
        .append(timeElement);
      messageBody.addClass('broadcast-text');
    }
    // Append to DOM
    messageHeader.append(headerInfo);
    messageWrapper.append(messageHeader);
    messageWrapper.append(messageBody);
    $('#messages').append(messageWrapper);
  });

  // Listener for when rooms is triggered
  // Display list of rooms available
  socket.on('rooms',function(rooms) {
  // Empty Dom element, to rebuild room list
    $('#room-list').empty();
    $("#mobile-room-list").empty();
  // Loop through rooms
    for (var room in rooms) {
      room = room.substring(1,room.length);
      if ( room!= '') {
        $('#room-list').append(divEscapedContentElement(room));
        $('#mobile-room-list').append(divEscapedContentElement(room));
      }
    }
  // Allow click of a room name to change to that room
    $('#room-list div').click(function(){
      chatApp.processCommand('/join ' + $(this).text());
      $('#send-message').focus();
    });

    $('#mobile-room-list div').click(function(){
      chatApp.processCommand('/join ' + $(this).text());
      $('#roomModal').modal('hide');
      $('#send-message').focus();

    });

  });

  // Request list of available rooms intermittently
  setInterval(function() {
    socket.emit('rooms');
  },1000);

  $('#send-message').focus();

  $('#send-form').submit(function() {
    processUserInput(chatApp,socket);
    return false;
  });

  // Scroll to bottom of chat-box automatically as text is added
  var $cont = $('.chat-box');
  $cont[0].scrollTop = $cont[0].scrollHeight;
  // For key up action
  $('#send-message').keyup(function(e) {
    if (e.keyCode == 13) {
      $cont[0].scrollTop = $cont[0].scrollHeight;
      $(this).val('');
    }
  });
  // For send-message click
  $("#send-button").on('click', function(e){
      $cont[0].scrollTop = $cont[0].scrollHeight;
      $(this).val('');
  });

});


