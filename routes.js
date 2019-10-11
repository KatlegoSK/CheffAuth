'use strict';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
//NPM Packages used in API
const Handlers = require('./path_handlers/roothandlers.js'); //Hapi Handlers
const systemEndpoints = require('./path_handlers/systemEndpoints.js'); //system path Handlers
const PromiseA = require('bluebird'); //Promises on all requests
const Joi = require('joi'); //Object validation framework
const https = PromiseA.promisifyAll(require('request')); //HTTP Request Lib including promises
const fs = require("fs"); //File system access
const async = require("async"); //enable async processing and flow control
const config = require('config'); //solution configurations goes in this file 
const hstatus = require('hapi-status'); //HTTP Status codes 
const ichefHandler = require('./path_handlers/ichefhandler');
module.exports = [
  
    { /*/System/API_Ping/*/
		method: 'GET',
		path: '/techDev/api/System/API_Ping/',
		config: {
		//    auth: {strategies:['simple']},
		   plugins: {
				disinfect: {
					disinfectQuery: true,
					disinfectParams: true,
					disinfectPayload: true
				},
				'hapi-geo-locate': {
					enabled: false
				},
				policies: ['isAdmin'],
				'hapi-swagger': {
					responses: {
						'200': {
							'description': 'Success with response data',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(200).required().description('HTTP Status Response Code. 200 - Successfull response with data.'),
									result: Joi.object().required().keys({
										body: Joi.string().required().default('Pong').description('API Result Body. Will contain the word - Pong, if successfull.'),
										details: Joi.string().required().default('success').description('API Result Details. Will contain the word - success, if successfull.')
									})
								}).label('Response 200')
						},
						'206': {
							'description': 'Success but no data found',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(206).required().description('HTTP Status Response Code. 206 - Successfull response with no data.'),
									result: Joi.object().required().keys({
										body: Joi.string().required().default('No Data').description('API Result Body. Will not contain data.'),
										details: Joi.string().required().default('No Data found for input parameters provided').description('API Result Details. Will not contain data.')
									})
								}).label('Response 200')
						},
						'400': {
							'description': 'Bad Request',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(400).required().description('HTTP Status Response Code. 400 - Bad Request.'),
									error: Joi.string().required().default('Bad Request').description('Bad Request.')
								}).label('Response 400')
						},
						'401': {
							'description': 'Unauthorized',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(401).required().description('HTTP Status Response Code. 401 - Unauthorized.'),
									error: Joi.string().required().default('Unauthorized').description('Unauthorized access attpempt.'),
									message: Joi.string().required().default('Missing authentication or Bad Token').description('Missing authentication. Credentials not provided or incorrect'),
									attributes: Joi.object().required().keys({
										error: Joi.string().required().default('Bad token').description('Token provided is not valid.')
									})
								}).label('Response 401')
						},						
						'500': {
							'description': 'Internal Server Error',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(500).required().description('HTTP Status Response Code. 500 - Internal Server Error.'),
									error: Joi.string().required().default('Internal Server Error').description('Internal Server Error.'),
									message: Joi.string().required().default('An internal server error occurred').description('An internal server error occurred')
								}).label('Response 500')
						}
					}
				},
			},
			handler:  systemEndpoints.API_Ping,
			description: 'API Heartbeat Monitoring',
			notes : 'Endpoint used for Heartbeat Monitoring. Monitoring will use this endpoint to check if the API is up and available.',
			tags: ['api'] 
		}
	},
	{ //Login/
		method: 'POST',
		path: '/techDev/api/loginFirebase/',
		config: {
		   plugins: {
			   	'hapi-swagger' : {
					payloadType : 'form',  
					validate: {
						payload : {
							email: Joi.string().required(),
							password : Joi.string().required()
						}
					},
					responses: {
						'200': {
							'description': 'Success with response data',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(200).required().description('HTTP Status Response Code. 200 - Successfull response with data.'),
									result: Joi.object().required().keys({
										body: Joi.string().required().default('Pong').description('API Result Body. Will contain the word - Pong, if successfull.'),
										details: Joi.string().required().default('success').description('API Result Details. Will contain the word - success, if successfull.')
									})
								}).label('Response 200')
						},
						'206': {
							'description': 'Success but no data found',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(206).required().description('HTTP Status Response Code. 206 - Successfull response with no data.'),
									result: Joi.object().required().keys({
										body: Joi.string().required().default('No Data').description('API Result Body. Will not contain data.'),
										details: Joi.string().required().default('No Data found for input parameters provided').description('API Result Details. Will not contain data.')
									})
								}).label('Response 200')
						},
						'400': {
							'description': 'Bad Request',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(400).required().description('HTTP Status Response Code. 400 - Bad Request.'),
									error: Joi.string().required().default('Bad Request').description('Bad Request.')
								}).label('Response 400')
						},
						'401': {
							'description': 'Unauthorized',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(401).required().description('HTTP Status Response Code. 401 - Unauthorized.'),
									error: Joi.string().required().default('Unauthorized').description('Unauthorized access attpempt.'),
									message: Joi.string().required().default('Missing authentication or Bad Token').description('Missing authentication. Credentials not provided or incorrect'),
									attributes: Joi.object().required().keys({
										error: Joi.string().required().default('Bad token').description('Token provided is not valid.')
									})
								}).label('Response 401')
						},						
						'500': {
							'description': 'Internal Server Error',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(500).required().description('HTTP Status Response Code. 500 - Internal Server Error.'),
									error: Joi.string().required().default('Internal Server Error').description('Internal Server Error.'),
									message: Joi.string().required().default('An internal server error occurred').description('An internal server error occurred')
								}).label('Response 500')
						}
					}
				},
				disinfect: {
					disinfectQuery: true,
					disinfectParams: true,
					disinfectPayload: true
				},
				'hapi-geo-locate': {
					enabled: false
				},
				policies: ['isAdmin'],
			},
			handler:  ichefHandler.onLogin,
			description: 'Auth Login',
			notes : 'Firebase Login',
			tags: ['api']
		}
	},
	{ //Register with Firebase/
		method: 'POST',
		path: '/techDev/api/registrationFirebase/',
		config: {
		   plugins: {
			   	'hapi-swagger' : {
					payloadType : 'form',  
					validate: {
						payload : {
							email: Joi.string().required(),
							password : Joi.string().required()
						}
					},
					responses: {
						'200': {
							'description': 'Success with response data',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(200).required().description('HTTP Status Response Code. 200 - Successfull response with data.'),
									result: Joi.object().required().keys({
										body: Joi.string().required().default('Pong').description('API Result Body. Will contain the word - Pong, if successfull.'),
										details: Joi.string().required().default('success').description('API Result Details. Will contain the word - success, if successfull.')
									})
								}).label('Response 200')
						},
						'206': {
							'description': 'Success but no data found',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(206).required().description('HTTP Status Response Code. 206 - Successfull response with no data.'),
									result: Joi.object().required().keys({
										body: Joi.string().required().default('No Data').description('API Result Body. Will not contain data.'),
										details: Joi.string().required().default('No Data found for input parameters provided').description('API Result Details. Will not contain data.')
									})
								}).label('Response 200')
						},
						'400': {
							'description': 'Bad Request',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(400).required().description('HTTP Status Response Code. 400 - Bad Request.'),
									error: Joi.string().required().default('Bad Request').description('Bad Request.')
								}).label('Response 400')
						},
						'401': {
							'description': 'Unauthorized',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(401).required().description('HTTP Status Response Code. 401 - Unauthorized.'),
									error: Joi.string().required().default('Unauthorized').description('Unauthorized access attpempt.'),
									message: Joi.string().required().default('Missing authentication or Bad Token').description('Missing authentication. Credentials not provided or incorrect'),
									attributes: Joi.object().required().keys({
										error: Joi.string().required().default('Bad token').description('Token provided is not valid.')
									})
								}).label('Response 401')
						},						
						'500': {
							'description': 'Internal Server Error',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(500).required().description('HTTP Status Response Code. 500 - Internal Server Error.'),
									error: Joi.string().required().default('Internal Server Error').description('Internal Server Error.'),
									message: Joi.string().required().default('An internal server error occurred').description('An internal server error occurred')
								}).label('Response 500')
						}
					}
				},
				disinfect: {
					disinfectQuery: true,
					disinfectParams: true,
					disinfectPayload: true
				},
				'hapi-geo-locate': {
					enabled: false
				},
				policies: ['isAdmin'],
			},
			handler:  ichefHandler.onRegister,
			description: 'Auth Registration',
			notes : 'Firebase Registration',
			tags: ['api']
		}
	},
	{ //Password Reset/
		method: 'POST',
		path: '/techDev/api/passwordReset/',
		config: {
		   plugins: {
			   	'hapi-swagger' : {
					payloadType : 'form',  
					validate: {
						payload : {
							email: Joi.string().required()
						}
					},
					responses: {
						'200': {
							'description': 'Success with response data',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(200).required().description('HTTP Status Response Code. 200 - Successfull response with data.'),
									result: Joi.object().required().keys({
										body: Joi.string().required().default('Pong').description('API Result Body. Will contain the word - Pong, if successfull.'),
										details: Joi.string().required().default('success').description('API Result Details. Will contain the word - success, if successfull.')
									})
								}).label('Response 200')
						},
						'206': {
							'description': 'Success but no data found',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(206).required().description('HTTP Status Response Code. 206 - Successfull response with no data.'),
									result: Joi.object().required().keys({
										body: Joi.string().required().default('No Data').description('API Result Body. Will not contain data.'),
										details: Joi.string().required().default('No Data found for input parameters provided').description('API Result Details. Will not contain data.')
									})
								}).label('Response 200')
						},
						'400': {
							'description': 'Bad Request',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(400).required().description('HTTP Status Response Code. 400 - Bad Request.'),
									error: Joi.string().required().default('Bad Request').description('Bad Request.')
								}).label('Response 400')
						},
						'401': {
							'description': 'Unauthorized',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(401).required().description('HTTP Status Response Code. 401 - Unauthorized.'),
									error: Joi.string().required().default('Unauthorized').description('Unauthorized access attpempt.'),
									message: Joi.string().required().default('Missing authentication or Bad Token').description('Missing authentication. Credentials not provided or incorrect'),
									attributes: Joi.object().required().keys({
										error: Joi.string().required().default('Bad token').description('Token provided is not valid.')
									})
								}).label('Response 401')
						},						
						'500': {
							'description': 'Internal Server Error',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(500).required().description('HTTP Status Response Code. 500 - Internal Server Error.'),
									error: Joi.string().required().default('Internal Server Error').description('Internal Server Error.'),
									message: Joi.string().required().default('An internal server error occurred').description('An internal server error occurred')
								}).label('Response 500')
						}
					}
				},
				disinfect: {
					disinfectQuery: true,
					disinfectParams: true,
					disinfectPayload: true
				},
				'hapi-geo-locate': {
					enabled: false
				},
				policies: ['isAdmin'],
			},
			handler:  ichefHandler.onPassWordReset,
			description: 'Password Reset',
			notes : 'Firebase Password Reset',
			tags: ['api']
		}
	},
	{ /*/Read Recipes/*/
		method: 'GET',
		path: '/techDev/api/getRecipes/',
		config: {
		//    auth: {strategies:['simple']},
		   plugins: {
				disinfect: {
					disinfectQuery: true,
					disinfectParams: true,
					disinfectPayload: true
				},
				'hapi-geo-locate': {
					enabled: false
				},
				policies: ['isAdmin'],
				'hapi-swagger': {
					responses: {
						'200': {
							'description': 'Success with response data',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(200).required().description('HTTP Status Response Code. 200 - Successfull response with data.'),
									result: Joi.object().required().keys({
										body: Joi.string().required().default('Pong').description('API Result Body. Will contain the word - Pong, if successfull.'),
										details: Joi.string().required().default('success').description('API Result Details. Will contain the word - success, if successfull.')
									})
								}).label('Response 200')
						},
						'206': {
							'description': 'Success but no data found',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(206).required().description('HTTP Status Response Code. 206 - Successfull response with no data.'),
									result: Joi.object().required().keys({
										body: Joi.string().required().default('No Data').description('API Result Body. Will not contain data.'),
										details: Joi.string().required().default('No Data found for input parameters provided').description('API Result Details. Will not contain data.')
									})
								}).label('Response 200')
						},
						'400': {
							'description': 'Bad Request',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(400).required().description('HTTP Status Response Code. 400 - Bad Request.'),
									error: Joi.string().required().default('Bad Request').description('Bad Request.')
								}).label('Response 400')
						},
						'401': {
							'description': 'Unauthorized',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(401).required().description('HTTP Status Response Code. 401 - Unauthorized.'),
									error: Joi.string().required().default('Unauthorized').description('Unauthorized access attpempt.'),
									message: Joi.string().required().default('Missing authentication or Bad Token').description('Missing authentication. Credentials not provided or incorrect'),
									attributes: Joi.object().required().keys({
										error: Joi.string().required().default('Bad token').description('Token provided is not valid.')
									})
								}).label('Response 401')
						},						
						'500': {
							'description': 'Internal Server Error',
							'schema': Joi.object({
									statusCode: Joi.number().integer().default(500).required().description('HTTP Status Response Code. 500 - Internal Server Error.'),
									error: Joi.string().required().default('Internal Server Error').description('Internal Server Error.'),
									message: Joi.string().required().default('An internal server error occurred').description('An internal server error occurred')
								}).label('Response 500')
						}
					}
				},
			},
			handler:  ichefHandler.readRecipes,
			description: 'Recipes',
			notes : 'Recipe read',
			tags: ['api'] 
		}
	}

	


	
];