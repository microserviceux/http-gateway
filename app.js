//************ Setup ************
// call the packages we need
var express    	= require('express');
var bodyParser 	= require('body-parser');
var muonCore	= require("muon-core");
var logger 		= require('./lib/logging/logger');

var debug		= require('debug')("Gateway");

//************ Define Gateway App ************
var app        	= express();
var port     	= 9001; 

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
		res.json({ message: 'Default GET Service Endpoint response!', service: req.params.servicename,  endpoint: req.params.endpoint });
	})

	// post to the service endpoint
	.post(function(req, res) {
		res.json({ message: 'Default POST Service Endpoint response!', service: req.params.servicename,  endpoint: req.params.endpoint });
	});


//************ Register the routes with the app ************
app.use('/', router);

//************ Start everything running ************
app.listen(port);
debug('The app is working now on port ' + port);
