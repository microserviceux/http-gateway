//************ Setup ************
// call the packages we need
var express    	= require('express');
var bodyParser 	= require('body-parser');
var muonCore		= require("muon-core");
var uuid				= require("uuid");
var Logger 			= require('./lib/logging/logger');

var debug				= require('debug')("Gateway");

//************ Define Gateway App ************
var app        	= express();
var port     	= 9001; 
var myConfig	= {};

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//************ Muon Start ************

//set amqp server address from environment
try{
  myConfig.server = process.env.AMQP_URL;

  if(!myConfig.server){
    logger.info('no AMQP_SERVER provided by environment defaulting to amqp://muon:microservices@localhost:5672');
    myConfig.server = 'amqp://muon:microservices@localhost:5672';
  }

  logger.info('Connecting to AMQP server - ' + myConfig.server);
  var amqp = muonCore.amqpTransport(myConfig.server);

  //Define muon instance for the communications to use
  var muonSystem = muonCore.muon(myConfig.servicename, amqp.getDiscovery(), [
      ["my-tag", "tck-service", "node-service"]
  ]);

  //Connect transport stream to the instance
  muonSystem.addTransport(amqp);
}
catch(err){
  console.error('Could not connect to AMQP server');
  console.error(err);
}
//************ Start FUnctions ************
function buildPayload(type, url, query, bod) {
	var thisEvent = {};

	//check for projection or event
	if (type === 'projections') {
		
		debug('New projection requested');

		var stream = query.stream || bod.stream;
		var projName = query['projection-name'] || bod['projection-name'];
		var lang = query['language'] || bod['language'];
		var reduction = "function eventHandler(state, event) {  var user = event.payload.user;  var key = user.last.replace(\/ \/g,\'\')  if (!(key in state)) {state[key] = {};  }  state[key].id = user.id;  state[key].fullname = user.first + \' \' + user.last;  var username = null;  if(user.last.length > 8) {username = (user.last.substring(0,7) + user.first.charAt(0)).toLowerCase();  }  else {username = (user.last + user.first.charAt(0)).toLowerCase();  }  state[key].username = username.replace(\/ \/g,\'\');  state[key].first = user.first;  state[key].last = user.last;  state[key].password = user.password;  return state;}";

		//Create projection object for injection into EventStore
  	thisEvent = {
									"projection-name" : 	projName,
                  "stream-name" 		: 	stream,
                  "language" 				: 	lang,
                  "initial-value" 	: 	'{}',
                  "filter" 					: 	"",
                  "reduction" 			: 	reduction
                };

		return thisEvent;
	}
	else if (type === 'events'){

		debug("New event to be inserted");

		var stream = query.stream || bod.stream;
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

	};
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

		debug("Attempting to fire get to the " + req.params.endpoint + " on " + req.params.servicename);

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

    debug("Posting to eventstore: ");
    debug(thisEvent);
    debug('=============================');

    if (typeof thisEvent !== 'undefined') {

	    //send command: url, event, callback
	    muonSystem.resource.command('muon://'+req.params.servicename+'/'+req.params.endpoint, thisEvent, function(event, payload) {
	      debug("Event received");
	      debug(payload);

	      if (payload.correct == 'true') {
	        res.json({ message: 'Success'  });
	      }
	      else {
	        res.json({ message: 'Failure' });
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
