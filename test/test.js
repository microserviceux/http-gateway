//Normal Mocha requirements
var should = require("chai").should();
var expect = require("chai").expect;
var supertest = require("supertest");
var api = supertest("http://localhost:9001");

describe('Http <-> Muon Gateway Testing ', function(){
    describe('HTTP Responses', function(){
        //Check API is up
        it('Step1 - should return a Default response', function(done){
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
        it('Step2 - should return a Default response from Discovery', function(done){
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
    });

    describe('Basic Photon response', function(){
        //Check Service & Endpoint is responding
        it('Step3 - should return a Default response from Endpoints via GET', function(done){
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
        it('Step4 - should insert a new projection', function(done){
            api.post('/photon/projections')
            .set('Accept', 'application/x-www-form-urlencoded')
            .send({
                projectionname: "UserList",
                stream: "users",
                language: "javascript",
                reduction: "function eventHandler(state, event) {\r\n\r\n  var user = event.payload.user;\r\n\r\n  var key = user.last.replace(\/ \/g,\'\');\r\n\r\n  if (!(key in state)) {\r\n    state[key] = {};\r\n  }\r\n\r\n  state[key].id = user.id;\r\n  state[key].fullname = user.first + \' \' + user.last;\r\n\r\n  var username = null;\r\n\r\n  if(user.last.length > 8) {\r\n    username = (user.last.substring(0,7) + user.first.charAt(0)).toLowerCase();\r\n  }\r\n  else {\r\n    username = (user.last + user.first.charAt(0)).toLowerCase();\r\n  }\r\n\r\n  state[key].username = username.replace(\/ \/g,\'\');\r\n  state[key].first = user.first;\r\n  state[key].last = user.last;\r\n  state[key].password = user.password;\r\n\r\n  return state;\r\n}"
            })
            .expect(200)
            .end(function(err, res){
                expect(res.body).not.to.equal(null);
                expect(res.body).to.have.property("message");
                expect(res.body.message).to.equal("Success");
                done();
            });
        });

    });

    describe('Insert projection and test empty state', function(){
        it('Step5 - should insert a second projection', function(done){
            api.post('/photon/projections')
            .set('Accept', 'application/x-www-form-urlencoded')
            .send({
                projectionname: "UserInfo",
                stream: "users",
                language: "javascript",
                reduction: "function eventHandler(state, event) {\r\n  var user = event.payload.user;\r\n  if (!(user.id in state)) {\r\n    state[user.id] = {};\r\n  }\r\n  state[user.id].id = user.id;\r\n  state[user.id].fullname = user.first + \' \' + user.last;\r\n  var username = null;\r\n  if(user.last.length > 8) {\r\n    username = (user.last.substring(0,7) + user.first.charAt(0)).toLowerCase();\r\n  }\r\n  else {\r\n    username = (user.last + user.first.charAt(0)).toLowerCase();\r\n  }\r\n  state[user.id].username = username.replace(\/ \/g,\'\');\r\n  state[user.id].first = user.first;\r\n  state[user.id].last = user.last;\r\n  state[user.id].password = user.password;\r\n  return state;\r\n}"
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
        it('Step6 - should get an empty object back from the projection return', function(done){
            api.get('/photon/projection?projection-name=UserInfo')
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
                expect(res.body.result['projection-name']).to.equal("UserInfo");

                expect(res.body.result).to.have.property("language");
                expect(res.body.result['language']).to.equal("javascript");

                done();
            });
        });
    });

    describe('Insert events', function(){
        //Insert Event
        it('Step7 - should do an event insert', function(done){
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
                expect(res.body.message).to.equal("Success");
                done();
            });
        });
    });

    describe('Check projection returns expected events', function(){
        //Return Projection with user info
        it('Step8 - should get an object back from the UserList projection', function(done){
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

});