# Muon - HTTP REST Gateway
## Installation

## Use
Currently accepts calls to:
* GET localhost:9001/
* GET localhost:9001/discover
* GET localhost:9001/<servicename>/<endpoint>
* POST localhost:9001/<servicename>/<endpoint>

### Examples

Add a user via an 'event' to an endpoint called 'photon'

```bash
curl -X POST -H "Cache-Control: no-cache"  -H "Content-Type: application/x-www-form-urlencoded" -d ' first=Charlie&last=Brown&password=peanuts&stream=users&id=00001254' 'http://localhost:9001/photon/events/?item=user'
```

Run a projection called 'UserList' on the endpoint 'photon'

```bash
curl -X GET -H "Cache-Control: no-cache" 'http://localhost:9001/photon/projection?projection-name=UserList'
```

