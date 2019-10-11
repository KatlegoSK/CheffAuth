'use strict';
const Hapi = require('hapi'); //REST API framework
const Inert = require('inert'); //handler methods for static files
const Vision = require('vision'); //decorates req and resp interfaces
const Blipp = require('blipp'); //display routes table on startup in console
const Boom = require('boom'); //http error status codes
const corsHeaders = require('hapi-cors-headers');
const Scooter = require('scooter'); //user agent info
const fs = require('fs');
var Utils = require('./path_handlers/utilities.js');
var Routes = require('./routes'); //cors support

var port = process.env.PORT || 8084;
// var host = process.env.HOST || 'localhost';

var server = new Hapi.Server();
server.connection({
	port: (port),
    routes: { cors: true } 
});  

// setup swagger options
var swaggerOptions = {
    info: {
        version: '1',
        title: 'Technical Dev',
        description: 'Development'
    },
   
	securityDefinitions: {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
            'x-keyPrefix': 'Bearer '
        }
    },
    security: [{ 'Bearer': [] }],
	schemes: ['http', 'https']
};


// register plug-ins
server.register([
    Inert,
    Vision,
    Blipp,
	Scooter,
    {
        register: require('hapi-swagger'),
        options: swaggerOptions
    },
	{
		    register: require('disinfect'),
			options: {
				disinfectQuery: true,
				disinfectParams: true,
				disinfectPayload: true
			}
	},
	{
		    register: require('hapi-geo-locate'),
			    options: {
					enabledByDefault: false
				}
	},
	{
			register: require('hapi-response-time')
	},
	{
		register: require('mrhorse'),
		options: {
			policyDirectory: __dirname + '/policies'
		} 
	}, 
	{
		register: require('therealyou')
	},
	{
	  register: require('hapijs-status-monitor'),
	  options: {
		title: 'API Health Monitor',
		path: '/techDev/api/status',
		routeConfig: {
		  auth: false
		}
	}},
	{
	 register: require('hapi-auth-bearer-token') 
	},
	{
	  register: require('hapi-server-session'),
	  options: {
		cache : {
		 expiresIn: 100000	
		},  
		cookie: {
		  isSecure: false,
		},
	  },
	},	
    ], function (err) {

        server.start(function(){
            console.log('Server running at:', server.info.uri);
			
        });
    });

		// Create a validation function for strategy
		
	var validate = function (token, callback) {
	console.log(token)
	var tokenList = ['test', 'd294b4b6-4d65-4ed8-808e-26954168ff48', 'c194b4b6-4d65-4ed8-808e-26954168ff48', 'a294b4b6-4d65-4ed8-808e-26954168ff48'];
	var tokenFound = false; 
	
		for (var i = 0; i < tokenList.length; i++) { 
			if (token == tokenList[i]){
				tokenFound = true 
			}
		}	
		
		if (tokenFound){
				callback(null, true, { token: 'Bearer d294b4b6-4d65-4ed8-808e-26954168ff48' })	
		} else {
				callback(null, false)	
		}

	};
	 server.auth.strategy('simple', 'bearer-access-token', {
			validateFunc: validate
	});
 
    //Adds cors support
server.ext('onPreResponse', corsHeaders);

server.ext('onPreResponse', (request, reply) => {
var req_id = Utils.generateGUIDv1();
  if(!request.response.isBoom){
		var checkResp = String(request.response.source)
		if (checkResp.indexOf('</div>') == -1 ){
			if (request.response.hasOwnProperty('statusCode')) {
				var theStatusCode = request.response.statusCode;
				if (theStatusCode == 200){
					        
					request.response
					.header('request_id', req_id)
					.header('request_cost', 1)
					.header('available_credit', 100)
					
				}
				else {
					request.response
					.header('request_id', req_id)
					.header('request_cost', 0)
					.header('available_credit', 100)				
				}
			}
		}
	}
 
  reply.continue()
});

// add routes
server.route(Routes);
 