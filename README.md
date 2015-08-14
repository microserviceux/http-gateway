# HTTP REST <-> Muon Gateway
## Installation
Check out the git repo., in the directory that is created, run the app.js using Node. This exposes the Gateway API via port 9001 on localhost.

```bash
git clone https://github.com/cistechfutures/mgateway.git
cd mgateway
node app.js
```

For full debug info while the app is running:

```bash
git clone https://github.com/cistechfutures/mgateway.git
cd mgateway
export LEVEL=debug
DEBUG=* node app.js
```

## Tests
These use an empty Photon Eventstore as an endpoint and create a series of users and projections to test the Gateway is working correctly. To run the tests simply change to the mgateway directory in a terminal and then run the mocha tests

```bash
cd mgateway
mocha
```

## Use
Currently accepts calls to:
* GET localhost:9001/
* GET localhost:9001/discover
* GET localhost:9001/<servicename>/<endpoint>
* POST localhost:9001/<servicename>/<endpoint>

### Examples

The following examples are the curl calls that are the equivalent to part of the Mocha tests.

See if the Gateway respondes
```bash
curl -X GET -H "Cache-Control: no-cache" 'http://localhost:9001/'
```

Run the Discovery protocol (TO BE IMPLEMENTED)
```bash
curl -X GET -H "Cache-Control: no-cache" 'http://localhost:9001/discover'
```

Get a list of available projections from the eventstore called 'photon'
```bash
curl -X GET -H "Cache-Control: no-cache" 'http://localhost:9001/photon/projection-keys'
```

Add a user via an 'event' to an endpoint called 'photon'

```bash
curl -X POST -H "Cache-Control: no-cache"  -H "Content-Type: application/x-www-form-urlencoded" -d ' first=Charlie&last=Brown&password=peanuts&stream=users&id=00001254' 'http://localhost:9001/photon/events/?item=user'
```

Run a projection called 'UserList' on the endpoint 'photon'

```bash
curl -X GET -H "Cache-Control: no-cache" 'http://localhost:9001/photon/projection?projection-name=UserList'
```

Developed & Tested using PostMan.