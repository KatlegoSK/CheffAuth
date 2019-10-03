'use strict';
const Marked = require('marked');
const Boom = require('boom');
const Fs = require('fs');
const config = require('config');
const uuidV1 = require('uuid/v1');
const Promise = require('bluebird'); 

module.exports = {
		logToConsole: function (content, context) {
			var separatorLength = 77;
			var contextLength = 0, fillerLength = 0;
			var filler = '', fillerStart = '', fillerEnd = '', fillerChar = '*';
			if (!(typeof context == 'undefined' || context == null || context == '')) {
				contextLength = context.length;
			}
			else {
				context = '';
			}
			fillerLength = (separatorLength - contextLength) / 2;
			for (var index = 0; index < fillerLength; ++index) {
				filler += fillerChar;
			}
			var fillerStartBegin = '\n>>' + filler.substring(0, filler.length - 1);
			var fillerFinishBegin = '<<' + filler.substring(0, filler.length - 1);

			fillerEnd = (contextLength % 2 != 0) ? fillerChar : '';

			console.log(fillerStartBegin + context + filler + fillerEnd);
			if (typeof content == "object")
				content = JSON.stringify(content);
			console.log(content);
			console.log(fillerFinishBegin + context + filler + fillerEnd);
			console.log('');
		},
		// read a file and converts the markdown to HTML
		getMarkDownHTML: function( path, callback ){
				Fs.readFile(path, 'utf8', function (err,data) {
					if (!err) {
						Marked.setOptions({
							gfm: true,
							tables: true,
							breaks: false,
							pedantic: false,
							sanitize: true,
							smartLists: true,
							smartypants: false,
							langPrefix: 'language-',
							highlight: function(code, lang) {
								return code;
							}
						});
						data = Marked(data);
					}
					callback( err, data );
				});
		},
		parseJSON: function(obj) {
			if ((typeof obj) == 'string' && (obj.indexOf('<') == -1 ) &&  (obj.indexOf('Bad Request') == -1)){
				obj = JSON.parse(obj)
			} 
			return obj;
		},
		
		 generateID: function() {
			return ('0000' + (Math.random()*Math.pow(36,4) << 0).toString(36)).substr(-4);
		 },
		
		generateGUIDv1: function() {
			var retGUIDv1 = uuidV1();
			return retGUIDv1
		},
 

		buildError: function( code, error ){
    		return Boom.create( parseInt(code, 10), error);
		},

		clone: function( obj ){
			return( JSON.parse( JSON.stringify( obj ) ));
		},


		isString: function (obj) {
		    return typeof (obj) == 'string';
		},


		trim: function (str) {
    		return str.replace(/^\s+|\s+$/g, "");
		},


		isArray: function (obj) {
		    return obj && !(obj.propertyIsEnumerable('length'))
		        && typeof obj === 'object'
		        && typeof obj.length === 'number';
		},
		
		convertTimestamp: function(timestamp) {
			var d = new Date(timestamp),

			yyyy = d.getFullYear(),
			mm = ('0' + (d.getMonth() + 1)).slice(-2), // Months are zero based. Add leading 0.
			dd = ('0' + d.getDate()).slice(-2), // Add leading 0.
			hh = d.getHours(),
			h = hh,
			min = ('0' + d.getMinutes()).slice(-2),
			sec = ('0' + d.getSeconds()).slice(-2),
			time;

			// ie: 2013-02-18, 8:35 AM
			time = yyyy + '-' + mm + '-' + dd + ' ' + h + ':' + min + ':' + sec;
		  
			return time;
		},
		convertTimestampBucket: function(timestamp) {
			var d = new Date(timestamp),

			yyyy = d.getFullYear(),
			mm = ('0' + (d.getMonth() + 1)).slice(-2), // Months are zero based. Add leading 0.
			dd = ('0' + d.getDate()).slice(-2), // Add leading 0.
			hh = d.getHours(),
			h = hh,
			min = ('0' + d.getMinutes()).slice(-2),
			sec = ('0' + d.getSeconds()).slice(-2),
			time;

			// ie: 2013-02-18, 8:35 AM
			time = yyyy + mm + dd + '_' + h + 'h' + min + 'm' + sec + 's';
		  
			return time;
		},		
		FlattenJSON: function(data) {
			var result = {};
			function recurse (cur, prop) {
				if (Object(cur) !== cur) {
					result[prop] = cur;
				} else if (Array.isArray(cur)) {
					 for(var i=0, l=cur.length; i<l; i++)
						 recurse(cur[i], prop + "[" + i + "]");
					if (l == 0)
						result[prop] = [];
				} else {
					var isEmpty = true;
					for (var p in cur) {
						isEmpty = false;
						recurse(cur[p], prop ? prop+"."+p : p);
					}
					if (isEmpty && prop)
						result[prop] = {};
				}
			}
			recurse(data, "");
			return result;
		},
 
		WordCount: function(str) { 
		  return str.split(" ").length;
		},
		
		isNumber: function(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		},

		 isObjEmpty: function(obj) {
			for(var prop in obj) {
				if(obj.hasOwnProperty(prop))
					return false;
			}
			return JSON.stringify(obj) === JSON.stringify({});
		},
		
		deriveBucketName: function(environment, clientName){
			environment = environment.toLowerCase();
			clientName = clientName.toLowerCase();
			var retVal = 'silica-ocr-' + environment + '-' + clientName; 
			return retVal 
		},
		
	   objToString: function(obj) {
			var str = '';
			for (var p in obj) {
				if (obj.hasOwnProperty(p)) {
					str += p + '::' + obj[p] + '\n';
				}
			}
			return str;
		}, 	

		identityValidateIDNumberStructure: function(reqIDDo){
	 
	 
			 var retObj = {
				  resultFound: false,
				  ValidIDNumber: 'NA',
				  SouthAfricanIDNumber: 'NA',
				  BirthDate: 'NA',
				  Gender: 'NA',
				  SACitizen: 'NA'
				};

			var idNumber = reqIDDo;
			var correct = true;
			console.log(idNumber.length)
			console.log(idNumber.length != 13)
			console.log(!isNaN(parseFloat(idNumber)))
			console.log(isFinite(idNumber))
			console.log(!isNaN(parseFloat(idNumber)) && isFinite(idNumber))
			if (idNumber.length != 13) {
				if (!isNaN(parseFloat(idNumber))){
					if (isFinite(idNumber)) {
						correct = false;
					}
				}
				
			}
			var tempDate = new Date(idNumber.substring(0, 2), idNumber.substring(2, 4) - 1, idNumber.substring(4, 6));
			var id_date = tempDate.getDate();
			var id_month = tempDate.getMonth();
			var id_year = tempDate.getFullYear();
			var dayFiller = id_date;
			if (dayFiller < 10) {
				dayFiller = '0' + dayFiller
			}
			var monthfiller = id_month  + 1;
			if (monthfiller < 10){
				monthfiller = '0' + monthfiller
			}
			var fullDate = id_year + "-" + (id_month + 1) + "-" + dayFiller;
			if (!((tempDate.getYear() == idNumber.substring(0, 2)) && (id_month == idNumber.substring(2, 4) - 1) && (id_date == idNumber.substring(4, 6)))) {
				correct = false;
			}
			// get the gender
			var genderCode = idNumber.substring(6, 10);
			var gender = parseInt(genderCode) < 5000 ? "Female" : "Male";
			// get country ID for citzenship
			var citzenship = parseInt(idNumber.substring(10, 11)) == 0 ? "Yes" : "No";
			// apply Luhn formula for check-digits
			var tempTotal = 0;
			var checkSum = 0;
			var multiplier = 1;
			for (var i = 0; i < 13; ++i) {
				tempTotal = parseInt(idNumber.charAt(i)) * multiplier;
				if (tempTotal > 9) {
					tempTotal = parseInt(tempTotal.toString().charAt(0)) + parseInt(tempTotal.toString().charAt(1));
				}
				checkSum = checkSum + tempTotal;
				multiplier = (multiplier % 2 == 0) ? 1 : 2;
			}
			if ((checkSum % 10) != 0) {
				correct = false;
			};

			if (correct) {
				retObj.resultFound = true;
				retObj.ValidIDNumber = 'YES';
				retObj.SouthAfricanIDNumber = idNumber;
				retObj.BirthDate = fullDate;
				retObj.Gender = gender.toUpperCase();
				retObj.SACitizen = citzenship.toUpperCase();
	 
				return retObj;

			} else {
				return retObj;
			}
		} 	   
		
};
