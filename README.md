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
These use an empty Photon Eventstore as an endpoint and create a series of users and projections to test the Gateway is working correctly. To run the tests simply change to the mgateway directory in a terminal and then run the mocha tests. 

```bash
cd mgateway
mocha
```

N.B. The Mocha tests assume that you are running the gateway app on your local machine (http://localhost:9001). If the app is running on a different URl, line 4 of the \tests\tests.js file can be modified to point to the new URL.

## Use
The Gateway currently accepts calls to:
* GET localhost:9001/
* GET localhost:9001/discover
* GET localhost:9001/*servicename*/*endpoint*
* POST localhost:9001/*servicename*/*endpoint*

*Aug 2015 - While the discover url responds, the functionality is not yet implmented.**

### POSTing into the Gateway
The Gateway uses a combination of query and body (x-www-form-urlencoded) values to pass information.

#### Events
To insert an event into an eventstore - use a query parameter to define the type of event and then use the body to pass in the actual contents ('payload') of the event.

```bash
' first=Charlie&last=Brown&password=peanuts&stream=users&id=00001254' 'http://localhost:9001/photon/events/?item=user'
```

Creates an event object in the 'photon' eventstore that looks like

```JSON
{"user" :{
    "first": "Charlie",
    "last": "Brown",
    "password": "peanuts",
    "stream": "users",
    "id": "00001254"
    }}
```

#### Projections
To create a new projection in an eventstore we ONLY use body (x-www-form-urlencoded) parameters.

```bash
'projectionname=zippy&stream=testing&language=javascript&reduction=***Some+suitably+complicated+JS+function+***' 'http://localhost:9001/photon/projections'
```

Would create a new projection called 'zippy' in the 'photon' eventstore. The projection would work on the 'testing' stream and would perform the function outlined in the reduction string. The reduction function is written in the 'javascript' language.

### Examples

The following examples are the curl equivalents to the calls made as part of the Mocha testing.

See if the Gateway responds:
```bash
curl -X GET -H "Cache-Control: no-cache" 'http://localhost:9001/'
```

Run the Discovery protocol (TO BE IMPLEMENTED):
```bash
curl -X GET -H "Cache-Control: no-cache" 'http://localhost:9001/discover'
```

Get a list of available projections from the eventstore called 'photon':
```bash
curl -X GET -H "Cache-Control: no-cache" 'http://localhost:9001/photon/projection-keys'
```

Insert a projection into the 'photon' endpoint:
```bash
curl -X POST -H "Cache-Control: no-cache" -H "Content-Type: application/x-www-form-urlencoded" -d 'projectionname=zippy&stream=testing&language=javascript&reduction=***Some+suitably+complicated+JS+function+***' 'http://localhost:9001/photon/projections'
```

Add a user via an 'event' to an endpoint called 'photon':
```bash
curl -X POST -H "Cache-Control: no-cache"  -H "Content-Type: application/x-www-form-urlencoded" -d ' first=Charlie&last=Brown&password=peanuts&stream=users&id=00001254' 'http://localhost:9001/photon/events/?item=user'
```

Run a projection called 'UserList' on the endpoint 'photon':
```bash
curl -X GET -H "Cache-Control: no-cache" 'http://localhost:9001/photon/projection?projection-name=UserList'
```
