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
  response.end();
}

// Handling serving of file data
// Write HTTP headers and tehn sends the contents fo the file.
function sendFile(response, filePath, fileContents) {
  response.writeHead(200, {"Content-type": mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents);
}

// Common for Node applicaton to cache frequently used data in memory
// Our chat application will cache static files to memory, only reading them from the disk first time, page is loaded

// Handles Caching, and serving files
function serveStatic(response, cache, absPath) {
  // If file is found in the cache, serve it
  if (cache[absPath]) {
    sendFile(response,absPath, cache[absPath]);
  // If file is nout in cache
  } else {
  // Check if file exists via callback function
    fs.exists(absPath, function(exists) {
      if (exists) {
  // If file exists, read file from disk
        fs.readFile(absPath, function(err,data) {
  // Error Handling
          if (err) {
            send404(response)
          } else {
  // Set read file to cache, and serv file
            cache[absPath] = data;
            sendFile(response,absPath,data);
          }
        });
  // If file does not exist, display error message
      } else {
        send404(response);
      }
    });
  }
}

// Instantiate HTTP server

// Create HTTP server, using anonymous function to define pre-requst behavior
var server = http.createServer(function(request, response) {
  var filePath = false;

  // Determine file served by default aka /
  if (request.url == '/') {
    filePath = "public/index.html";
  } else {
  // Translate URL path to relative file path
  // (public is where our files are stored)
    filePath = "public" + request.url;
  }
  // Abs path appends './', the root of our application
  var absPath = "./" + filePath;
  // Serve files based on absPath
  serveStatic(response,cache,absPath);
});

// Starts the HTTP Server
server.listen(3000,function(){
  console.log("Server listening on port 3000.");
});



