/*
* Handlers for static pages and APIs
*
*/

// Dependencies
var express     = require('express');
var isoHandler = require('./converter.js');

// Container for handler
var handlers = {};

handlers.router = express.Router();

// Message convert API - ISO8583 to JSON
handlers.router.get('/app/isotojson/read',isoHandler.convertMessage);        //Read

// export the router to be used by index.js
module.exports=handlers.router;
