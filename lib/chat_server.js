// Socket.io based server side functionality

//Custom Node module that supplies logic to handle Socket.io based server-side functionalityvar
var socketio = require('socket.io');

// Variables and holders
var io;
var guestNumber = 1;
var nickNames = {};
var currentRoom = {};

// This function is invoked in './server.js', 'listen'
// Starts Socket.IO server, limits verbosity of Socketi.IO logging to the console
// esablishes how each incoming connection should be handled

exports.listen = function(server) {
  // Start Socket.IO server, allowing it 'piggingback' on HTTP server on same TCP/IP connection
  io = socketio.listen(server);
  io.set('log level',1)

  // Define how each connection will be handled
  io.sockets.on('connections', function(socket) {

  // Assign guessNumber by invoke assignGuestNames
    guestNumber = assignGuestNames(socket, guestNumber, nickNames, namesUsed);

  // Place user in Lobby room when they connect
    joinRoom(socket,'Lobby');

  // Handle user messages, name-change attemps, and room creation/changes
    handleMessageBroadcasting(socket,nickNames);
    handleNameChangeAttempts(socket,nickNames,namesUsed);
    handleRoomJoining(socket);

  // Provide user with list of occupied rooms on request
    socket.on('rooms', function(){
      socket.emit('room', io.sockets.manager.rooms);
    });

  // Define cleanup logic for when user disconnects
    handleClientDisconnection(socket,nickNames,namesUsed);
  });

};

// Define the individual helper functions that will handle the application's needs

