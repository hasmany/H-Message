///////////////////////////
// Application Server Logic
///////////////////////////

//////////
// MODULES
//////////

// Built in http module provides HTTP server and client functionality
var http = require('http');
// Built in fs module provides filesystem-related functionality
var fs = require('fs');
// Built in path module provides filesystem path-related functionality
var path = require('path');
// Add-on mime module provides abiilty to derive a MIME type based on a filename extension
var mime = require('mime');

// Cache object is where the contents of cached files are stored.
var cache = {};

///////////////////
// Helper functions
///////////////////

// Handle sending of 404 error a file is requested that doesn't exist.
function send404(response) {
  response.writeHead(404,{'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found.');
  resonse.end();
}

// Handling serving of file data
// Write HTTP headers and tehn sends the contents fo the file.
function sendFile(response, filePath, fileContents) {
  response.writeHead(200, {"Content-type": mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents);
}
