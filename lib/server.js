/*
*
*/

// Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config');
var handlers = require('./handlers');

// Container for server
var server = {};

// Initialize server with express js
server = express();

// Body parser
server.use(bodyParser.json()); 
server.use(express.json());
server.use(bodyParser.urlencoded({extended: false})); 

// Route to request handlers
server.use('/', handlers);

// Define route for handling for api not available
server.use('*',function(req,res){
    var method = req.method;        
    res.status(404).json({Error : 'Requested resource not found',
                          Method : method,
    });
});


// Init script (called from index.js)
server.init = function(){
    console.log("port is "+ config.httpPort);
    server.listen(config.httpPort,function(){
        
        console.log(`App Started on PORT ${config.httpPort}`);
    });
}

// Export the module
module.exports = server;