'use strict';
const Utils = require('./utilities.js');
const hstatus = require('hapi-status'); //HTTP Status codes 
  
function API_Ping(request,reply) {
 
	var reqResponse = {
		'body' : 'pong', 
		'details' : 'success'
	};
	return hstatus.ok(reply, reqResponse);
 	
}
   
exports.API_Ping = API_Ping;






