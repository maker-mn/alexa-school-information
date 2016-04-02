'use strict';

var http = require('http');
var https = require('https');

var options = require('./options');
var alexaDateUtil = require('./alexaDateUtil');
var datejs = require('./date');

var AlexaSkill = require('./AlexaSkill');
var EchoNativity = function () {
    AlexaSkill.call(this, "amzn1.echo-sdk-ams.app.32b7d8c7-e8ae-4a1c-927e-ce18e14e9b6b");
};

var NOLUNCH_RESPONSES = [
    "There is no lunch for $day",
	"Yo Momma is gonna have to make you lunch for $day",
	"You'll have to make your own lunch for $day"
];

EchoNativity.prototype = Object.create(AlexaSkill.prototype);
EchoNativity.prototype.constructor = EchoNativity;

EchoNativity.prototype.intentHandlers = {
	
    // register custom intent handlers
    WhatsForLunchIntent: function (intent, session, response) {
        console.log("WhatsForLunchIntent received");
		
		// get today's date
		var today = new Date();
		//today.setTime(today.getTime() + today.getTimezoneOffset()-300);
		var month = today.getMonth()+1;
		var year = today.getFullYear();
				
		// set path to date file
		options.path = '/data/lunch/' + year + '/' + month + '.json';
		
		// make request
		httpreq(options, function (error, responseJson) {
            if (!error) {
                responseJson = JSON.parse(responseJson);

				// parse the requested lunch date
				var d = getDateFromIntent(intent);
				//d.setTime(today.getTime() + d.getTimezoneOffset()-300);
				console.log("WhatsForLunchIntent: lookup date =" + d + ", today=" + today);
					
				// set default response mesage	
				var randResponse = Math.floor(Math.random() * NOLUNCH_RESPONSES.length);
				var responseText = NOLUNCH_RESPONSES[randResponse].replace("$day", intent.slots.Date.value);
                
				try {
				/*	if (d < today && day != 'yesterday') {
						d = Date.parse("next" + day);
						console.log("WhatsForLunchIntent: shifting day to " + d);
					}*/
					var searchDay = d.toString('yyyy-MM-dd');
					console.log("WhatsForLunchIntent: lookup date =" + searchDay);
					var longDay = d.toString("dddd, MMMM dS");
					
					console.log("WhatsForLunchIntent: lunches found =" + responseJson.lunches.length);				
					var lunchObj = getLunchByDate(responseJson.lunches, searchDay);
					if (lunchObj) {
						responseText = "Lunch for " + longDay + " is " + lunchObj.lunch + ".  " + lunchObj.comment;
						console.log("WhatsForLunchIntent: lunch=" + responseText);
					}
				} catch (e) {
					console.log("WhatsForLunchIntent: " + e.message);
					responseText = "I received an error while trying to look up the lunch";
				}
				response.tell(responseText);
            }
            else { 
                response.tell(error.message);
            }
        });
    }
}


function getLunchByDate(lunches, date) {
	for (var i = 0; i < lunches.length; i++) {
		if (lunches[i].date == date) {
			return lunches[i];
		}
	}
}


/**
 * Gets the date from the intent, defaulting to today if none provided,
 * or returns an error
 */
function getDateFromIntent(intent) {

    var dateSlot = intent.slots.Date;
    // slots can be missing, or slots can be provided but with empty value.
    // must test for both.
    if (!dateSlot || !dateSlot.value) {
        // default to today
		console.log("WhatsForLunchIntent: defaulting to today");
        return new Date();
    } else {
        console.log("WhatsForLunchIntent: dateSlot value=" + dateSlot.value);
        return new Date(dateSlot.value);
    }
}


function httpreq(options, responseCallback) {
    var transport = options.useHttps ? https : http;
    
    console.log("Sending " + (options.useHttps ? "HTTPS" : "HTTP" ) + " request to: " + options.path);
  
    var req = transport.request(options, function(httpResponse) {
        var body = '';
        
        httpResponse.on('data', function(data) {
            body += data;
        });
        
        httpResponse.on('end', function() {
            responseCallback(undefined, body);
        });
    });

    req.on('error', function(e) {
        responseCallback(e);
    });

    req.end();
}

function genericResponse(error, response, success) {
    if (!error) {
        if (!success) {
            response.tell("OK");
        }
        else {
            response.tell(success);
        }
    }
    else {
        response.tell("The Lambda service encountered an error: " + error.message);
    }
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the EchoNativity skill.
    var echoNativity = new EchoNativity();
    echoNativity.execute(event, context);
};
