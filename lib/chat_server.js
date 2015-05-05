// Socket.io based server side functionality

//Custom Node module that supplies logic to handle Socket.io based server-side functionalityvar
var socketio = require('socket.io');

// Variables and holders to hold chat state
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

// This function is invoked in './server.js', 'listen'
// Starts Socket.IO server, limits verbosity of Socketi.IO logging to the console
// esablishes how each incoming connection should be handled

exports.listen = function(server) {
  // Start Socket.IO server, allowing it 'piggingback' on HTTP server on same TCP/IP connection
  io = socketio.listen(server);
  io.set('log level',1);

  // Define how each connection will be handled
  io.sockets.on('connection', function(socket) {

    // Assign guessNumber by invoke assignGuestNames
    guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);

    // Place user in Lobby room when they connect
    joinRoom(socket,'Lobby');

    // Handle user messages, name-change attemps, and room creation/changes
    handleMessageBroadcasting(socket,nickNames);
    handleNameChangeAttempts(socket,nickNames,namesUsed);
    handleRoomJoining(socket);

    // Provide user with list of occupied rooms on request
    socket.on('rooms', function(){
      socket.emit('rooms', io.sockets.manager.rooms);
    });

    // Define cleanup logic for when user disconnects
    handleClientDisconnection(socket,nickNames,namesUsed);

  });

};

// Define the individual helper functions that will handle the application's needs

// Handles the naming of new users
function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
  // Generate new guest name;
  var name = "Guest" + guestNumber;
  // Associate guess name with client connection ID
  nickNames[socket.id] = name;
  // Let user know their guest name
  socket.emit('nameResult',{
    success: true,
    name: name
  });
  // Now that a name is generated, put it into the nameUsed array
  namesUsed.push(name);
  return guestNumber + 1;
};

// Handles a user joining a chat room.

// require a call to the join method of a socket object
// The application then communicates related details to the user and other users in the same room
// what users are in the room and let sthese toher usesr know that the user is now present.

function joinRoom(socket,room) {
  // Make user join room
  socket.join(room);
  //  User is now in the room
  currentRoom[socket.id] = room;
  // Let user know they are in the room
  socket.emit('joinResult',{room: room});
  // Let other users in room know that a user has joined
  socket.broadcast.to(room).emit('message',{
    text: nickNames[socket.id] + " has joined " + room + '.'
  });

  // Determine what other users are in the same room as a user
  var usersInRoom = io.sockets.clients(room);
  // If other users exist, summarize who they are.
  if ( usersInRoom.length > 1) {
  // Loop over all users in room
    var usersInRoomSummary = " Users currently in " + room + ": ";
    for (var index in usersInRoom) {
  // Get user id
      var userSocketId = usersInRoom[index].id;
  // check if user that we are looping over is not our user
      if (userSocketId != socket.id) {
  // If index greater then zero, add a comma
        if (index > 0) {
          usersInRoomSummary += ", ";
        }
  // add name to string
        usersInRoomSummary  += nickNames[userSocketId];
      }
    }
  // Put a period, and emit message to users in room
    usersInRoomSummary += ".";
    socket.emit('message',{text: usersInRoomSummary});
  }
}


// Handles request by users to change their names
// From the application's perspective, the users aren't allowed to change their name
// to anything begining with Guest or to use a nmae that's already in use.

// handleNameChangeAttempts(socket,nickNames,namesUsed);

function handleNameChangeAttempts(socket,nickNames,namesUsed) {
  // Add listener for nameAttempt events
  socket.on('nameAttempt',function(name) {
  // Don't allow nicknames to being with Guest
    if (name.indexOf('Guest') === 0) {
      socket.emit('nameResult',{
        success: false,
        message: "Names cannot being with 'Guest'"
      });
    } else {
  // If name isn't already registered, register it
      if (namesUsed.indexOf(name) == -1) {
  // Get current users previous name and get index
        var previousName = nickNames[socket.id];
        var previousNameIndex = namesUsed.indexOf(previousName);
  // Add new name to namesUsed array
        namesUsed.push(name);
        nickNames[socket.id] = name;
  // Remove previous name to make room available to other clients
        delete namesUsed[previousNameIndex];
  // Emit name change
        socket.emit('nameResult',{
          success: true,
          name: name
        });
  // Broadcast to everyone in room of name change
        socket.broadcast.to(currentRoom[socket.id]).emit('message',{
          text: previousName + " is now known as " + name + "."
        });
      } else {
  // Send error to client if name is already registered
        socket.emit("nameResult",{
          success: false,
          message: "That name is already in use."
        });
      }
    }
  });
}



// The user emits an event that indicates the room where the message is to be sent and the message text.
// socketIO broadcast function is used to relay the message

// Handles how a chat message is sent from a user is handled.
function handleMessageBroadcasting(socket) {
  // Listen for the message event from client
  socket.on('message', function(message) {
  // Broadcast to other users in a room of a chat messsage
    socket.broadcast.to(message.room).emit('message', {
      text: nickNames[socket.id] + ": " + message.text
    });
  });
};


// Handles how a user joines an existing room or if it doesn't yet exist yet, join it
// NewRoom property is sent from the client

function handleRoomJoining(socket) {
  // Listens for join event
  socket.on('join', function(room) {
  // leave function from socket
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket,room.newRoom);
  });
}


// Removing a users nickname from nickNames and namesUsed when the user leaves the chat application

// Handling User Disconnections
function handleClientDisconnection(socket) {
  // Listens for disconnect event
  socket.on("disconnect",function(){
    var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
  // Deletes names from nickName and used name list
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  });
}





