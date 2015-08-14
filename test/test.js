var should = require("chai").should();
var expect = require("chai").expect;
var supertest = require("supertest");
var api = supertest("http://localhost:9001");

describe('DemoApp API Testing ', function(){

    //Check API is up
    it('should return a Default response', function(done){
        api.get('/')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res){
            expect(res.body).not.to.equal(null);
            expect(res.body).to.have.property("message");

            expect(res.body.message).not.to.equal(null);
            
            expect(res.body.message).to.equal("Default Gateway response!");
            done();
        });
    });

    //Check DISCOVERY is responding
    it('should return a Default response from Discovery', function(done){
        api.get('/discover')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res){
            expect(res.body).not.to.equal(null);
            expect(res.body).to.have.property("message");

            expect(res.body.message).not.to.equal(null);
            
            expect(res.body.message).to.equal("Default DISCOVERY response!");
            done();
        });
    });

    //Check Service & Endpoint is responding
    it('should return a Default response from Endpoints via GET', function(done){
        api.get('/photon/projection-keys')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res){
            expect(res.body).not.to.equal(null);

            expect(res.body).to.have.property("message");
            expect(res.body.message).to.equal("Default GET Service Endpoint response!");

            expect(res.body).to.have.property("service");
            expect(res.body.service).to.equal("photon");

            expect(res.body).to.have.property("endpoint");
            expect(res.body.endpoint).to.equal("projection-keys");

            expect(res.body).to.have.property("result");
            expect(res.body.result).not.to.equal(null);

            done();
        });
    }); 

    //Insert Projection
    it('should insert a new projection', function(done){
        api.post('/photon/projections')
        .set('Accept', 'application/x-www-form-urlencoded')
        .send({
            projectionname: "UserList",
            stream: "users",
            language: "javascript",
            reduction: "function eventHandler(state, event) { var user = event.payload.user;  var key = user.last.replace(\/ \/g,\'\'); if (!(key in state)) { state[key] = {};  } state[key].id = user.id;  state[key].fullname = user.first + \' \' + user.last;  var username = null;  if(user.last.length > 8) {   username = (user.last.substring(0,7) + user.first.charAt(0)).toLowerCase();  }  else {    username = (user.last + user.first.charAt(0)).toLowerCase();  }  state[key].username = username.replace(\/ \/g,\'\');  state[key].first = user.first;  state[key].last = user.last;  state[key].password = user.password;  return state;}"
        })
        .expect(200)
        .end(function(err, res){
            expect(res.body).not.to.equal(null);
            expect(res.body).to.have.property("message");
            expect(res.body.message).to.equal("Success");
            done();
        });
    });


    //Return Empty Projection result
    it('should get an empty object back from the initial projection return', function(done){
        api.get('/photon/projection?projection-name=UserList')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res){
            expect(res.body).not.to.equal(null);

            expect(res.body).to.have.property("message");
            expect(res.body.message).to.equal("Default GET Service Endpoint response!");

            expect(res.body).to.have.property("service");
            expect(res.body.service).to.equal("photon");

            expect(res.body).to.have.property("endpoint");
            expect(res.body.endpoint).to.equal("projection");

            expect(res.body).to.have.property("result");
            expect(res.body.result).to.have.property("stream-name");
            expect(res.body.result['stream-name']).to.equal("users");

            expect(res.body.result).to.have.property("projection-name");
            expect(res.body.result['projection-name']).to.equal("UserList");

            expect(res.body.result).to.have.property("language");
            expect(res.body.result['language']).to.equal("javascript");

            done();
        });
    });

    //Insert Event
    it('should do a user insert', function(done){
        api.post('/photon/events?item=user')
        .set('Accept', 'application/x-www-form-urlencoded')
        .send({
            id: "0001",
            first: "Chai",
            last: "Mocha",
            password: "testing",
            stream: "users"
        })
        .expect(200)
        .end(function(err, res){
            expect(res.body).not.to.equal(null);
            expect(res.body).to.have.property("message");
            done();
        });
    });

    //Return Projection
    it('should get an object back from the listAllUsers', function(done){
        api.get('/photon/projection?projection-name=UserList')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res){
            expect(res.body).not.to.equal(null);

            expect(res.body).to.have.property("message");
            expect(res.body.message).to.equal("Default GET Service Endpoint response!");

            expect(res.body).to.have.property("service");
            expect(res.body.service).to.equal("photon");

            expect(res.body).to.have.property("endpoint");
            expect(res.body.endpoint).to.equal("projection");

            expect(res.body).to.have.property("result");
            expect(res.body.result).to.have.property("Mocha");

            expect(res.body.result.Mocha).to.have.property("id");
            expect(res.body.result.Mocha.id).to.equal("0001");

            expect(res.body.result.Mocha).to.have.property("username");
            expect(res.body.result.Mocha.username).to.equal("mochac");

            expect(res.body.result.Mocha).to.have.property("first");
            expect(res.body.result.Mocha.first).to.equal("Chai");

            expect(res.body.result.Mocha).to.have.property("last");
            expect(res.body.result.Mocha.last).to.equal("Mocha");

            expect(res.body.result.Mocha).to.have.property("password");
            expect(res.body.result.Mocha.password).to.equal("testing");

            done();
        });
    });

});