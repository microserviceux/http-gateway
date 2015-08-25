//************ Setup ************
// call the packages we need
var express     = require('express');
var bodyparser  = require('body-parser');
var muonCore		= require("muon-core");
var uuid				= require("uuid");
var Logger      = require('./lib/logging/logger');

var debug				= require('debug')("Gateway_v1");

//************ Define Gateway App ************
var app       = express();
var port      = 9001;
var myConfig  = {};

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//************ Muon Start ************
try {
  var muonSystem = new muonCore.generateMuon();
}
catch(err){
  console.error('Could not create muonSystem');
  console.error(err);
}

//************ Start Functions ************
function buildPayload(type, url, query, bod) {
	var thisEvent = {};

	var stream = query.stream || bod.stream;

	//check for projection or event
	if (type === 'projections') {

		debug('New projection requested');

		var projName     = query['projectionname'] || bod['projectionname'];
		var lang 		     = query['language'] || bod['language'];
		var reduction 	 = bod.reduction;

		//Create projection object for injection into EventStore
  	thisEvent = {
		              "projection-name" : 	projName,
                  "stream-name"     :   stream,
                  "language"        : 	lang,
                  "initial-value"   : 	'{}',
                  "filter"          : 	"",
                  "reduction"       : 	reduction
                };

		return thisEvent;
	}
	else if (type === 'events'){

		debug("New event to be inserted");

		var item = query.item;

		var thisPayload = {};
		thisPayload[item] = bod;

		//Create event object for injection into EventStore
   	thisEvent = {
									"service-id"	: 		'muon://' + url.servicename + '/' + url.endpoint,
									"local-id"		: 		uuid.v4(),
									"payload"			: 		thisPayload,
									"stream-name"	: 		stream,
									"server-timestamp": Date.now()
								};

   	return thisEvent;

	}
}


//************ Start Routes ************
// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	debug('Something is happening.....');
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'Default Gateway response!' });
});

// Code for all routes that end in /????
// ----------------------------------------------------
router.route('/discover')

	// get all the services (accessed via GET to http://localhost:port/discover)
	.get(function(req, res) {
		res.json({ message: 'Default DISCOVERY response!' });
	});

// routes that end in /<servicename>/<endpoint>
router.route('/:servicename/:endpoint')

	// go to the service endpoint
	.get(function(req, res) {

		debug(req.query);

		debug("Attempting to get to the " + req.params.endpoint + " on " + req.params.servicename);

	    try{
	      //query: url, callback, params
	      muonSystem.resource.query('muon://'+req.params.servicename+'/'+req.params.endpoint, function(event, payload) {

	        debug('-------------------------');
	        debug(event);
	        debug('-------------------------');
	        debug(payload);
	        debug('-------------------------');
	        debug("Returned something from Service endpoint");

	        //Separate results if necessary
	        if (payload.hasOwnProperty('current-value')) {
	        	thisPayload = payload['current-value'];
	        }
	        else {
	        	thisPayload = payload;
	        }

	 				res.json({ message: 'Default GET Service Endpoint response!', service: req.params.servicename,  endpoint: req.params.endpoint, result: thisPayload});

	      }, req.query);
	    }
	    catch (e) {
	      debug("There was an error");
	      debug(e);
	      res.json({ message: 'There was an error', error: e});
	    }
	})

	// post to the service endpoint
	.post(function(req, res) {

		//Create payload
		var thisEvent = buildPayload(req.params.endpoint, req.params, req.query, req.body);

    debug("Posting to endpoint: ");
    debug(thisEvent);
    debug('=============================');

    if (typeof thisEvent !== 'undefined') {

	    //send command: url, event, callback
	    muonSystem.resource.command('muon://'+req.params.servicename+'/'+req.params.endpoint, thisEvent, function(event, payload) {
	      debug("Command received");
	      debug(payload);
	      debug('=============================');

	      if (payload.correct == 'true' || payload == 'Ok') {
	        res.json({ message: 'Success'  });
	      }
	      else {
	        res.json({ message: 'Failure' , payload: payload});
	      }
	    });
	  }
	  else {
	  	res.json({message: "Invalid API call - invalid query parameters passed", query: req.body});
	  }

	});


//************ Register the routes with the app ************
app.use('/', router);

//************ Start everything running ************
app.listen(port);
debug('The app is working now on port ' + port);
