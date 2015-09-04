//************ Setup ************
// call the packages we need
var restify   = require('restify');
var muonCore  = require("muon-core");
var uuid      = require("uuid");
var Logger    = require('./lib/logging/logger');

var debug     = require('debug')("MuonGateway");

//************ Define Gateway App ************
var server = restify.createServer();
var port      = 9001;
var myConfig  = {};

//Define name and url
server.name = "Tau";
server.url = "http://localhost";

//Load cURL handler
server.pre(restify.pre.userAgentConnection());
//Load ther handlers
server.use(restify.queryParser());
server.use(restify.bodyParser(
  {mapParams: true}
));


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
    var lang         = query['language'] || bod['language'];
    var reduction    = bod.reduction;

    //Create projection object for injection into EventStore
    thisEvent = {
                  "projection-name" :   projName,
                  "stream-name"     :   stream,
                  "language"        :   lang,
                  "initial-value"   :   '{}',
                  "filter"          :   "",
                  "reduction"       :   reduction
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
                  "service-id"  :     'muon://' + url.servicename + '/' + url.endpoint,
                  "local-id"    :     uuid.v4(),
                  "payload"     :     thisPayload,
                  "stream-name" :     stream,
                  "server-timestamp": Date.now()
                };

    return thisEvent;

  }
}


//************ Start Routes ************
server.get('/', function(req, res) {
  res.json({ message: 'Default Gateway response!' });

  return next();
});


server.get('/tests', restify.serveStatic({
  directory: '.'
}));


server.get('/discover', function(req, res) {
  res.json({ message: 'Default DISCOVERY response!' });

  return next();
});


// routes that end in /<servicename>/<endpoint>
server.get('/:servicename/:endpoint', function(req, res, next) {

  debug("Attempting to get to the " + req.params[1] + " on " + req.params[0]);

  try{
    //query: url, callback, params
    muonSystem.query('muon://'+req.params.servicename+'/'+req.params.endpoint, function(event, payload) {

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

  return next();
});

server.post('/:servicename/:endpoint', function(req, res, next) {

  debug(req);

  //Create payload
  var thisEvent = buildPayload(req.params.endpoint, req.params, req.query, req.body);

  debug("Posting to endpoint: ");
  debug(thisEvent);
  debug('-------------------------');

  if (typeof thisEvent !== 'undefined') {

    //send command: url, event, callback
    muonSystem.command('muon://'+req.params.servicename+'/'+req.params.endpoint, thisEvent, function(event, payload) {
      debug("Command received");
      debug(payload);
      debug('-------------------------');

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

  return next();
});


server.listen(port, function() {
  debug('%s listening at %s', server.name, server.url);
});