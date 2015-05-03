

// Client-side JavaScript is needed to handle the following functionality:
// Sending a user's messages and name/room change request to the server
// Displaying other uses' messages and the list of avilable rooms(DOM manipulation)

// Chat Class
var Chat = function(socket) {
  this.socket = socket;
};

// Handles sending chat messages:

Chat.prototype.sendMessage = function(room,text) {
  // Create message object
  var message = {
    room: room,
    text: text,
  };
  // Emit socket, with message object
  this.socket.emit('message',{message: message});
};

// Handles function to change rooms:

Chat.prototype.changeRoom = function(room) {
// Emit name of room
  this.socket.emit('join',{
    newRoom: room
  });
};

// Function for processing a chat command
// Two chat commands are recognized
// 1.) join for creating a room
// 2.) nick for changing one's nickname

Chat.prototype.processCommand = function(command) {
  // Change string into an array with a space delimiter
  var words = command.split(' ');
  // Parse command form first word ( confusing, seems to omit the first letter? )
  var command = words[0].substring(1, words[0].length).toLowerCase();
  // Why is messagse false?
  var messagse = false;
  // Switch for the first word from command
  switch(command) {
    case 'join':
  // Remove first word form words ( 'join', in this case)
      words.shift();
  // Change array back into a string with a space as a delimiter
      var room = words.join(' ');
  // Call changeRoom function passing in room string
      this.changeRoom(room);
      break;
    case 'nick':
  // Remove first word from words( 'nick', in this case)
      words.shift();
  // Change array back into a string with a space as a delimiter
      var name = word.join(' ');
  // Emit a event called nameAttempt to server
      this.socket.emit('nameAttempt',name);
      break;
    default:
      message = "Unrecognized command.";
      break;
  }
  return message;
};

