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
  if (message.chartAt(0) == '/') {
    systemMessage = chatApp.processCommand(message);
    if (systemMessage) {
  // systemMessage will return false to break out
      $('#messages').append(divSystemContentElement(systemMessage));
    }
  } else {
  // Broadcast noncommand input to other users
    chapApp.sendMessage($('#room').text(),message);
    $('#messages').append(divEscapedContentElement(message));
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

  socket.on('nameResult', function(result){
    var message;

    if (result.success) {
      message = "You are now known as " + result.name + ".";
    } else {
      message = result.message;
    }
    $('#messages').append(divSystemContentElement(message));
  });

  socket.on('joinResult',function(result) {
    $('#room').text(result.room);
    $('#messages').append(divSystemContentElement('Room changed.'));
  });

  socket.on('message', function(message)  {

  });

});


