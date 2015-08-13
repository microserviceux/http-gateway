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
        api.get('/test_service/test_endpoint')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res){
            expect(res.body).not.to.equal(null);
            expect(res.body).to.have.property("message");

            expect(res.body.message).not.to.equal(null);
            
            expect(res.body.message).to.equal("Default GET Service Endpoint response!");
            expect(res.body.service).to.equal("test_service");
            expect(res.body.endpoint).to.equal("test_endpoint");

            done();
        });
    }); 
/*
    //Check Service & Endpoint is responding
    it('should return a Default response from Endpoints via POST', function(done){
        api.post('/test_service/test_endpoint')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res){
            expect(res.body).not.to.equal(null);
            expect(res.body).to.have.property("message");

            expect(res.body.message).not.to.equal(null);
            
            expect(res.body.message).to.equal("Default POST Service Endpoint response!");
            expect(res.body.service).to.equal("test_service");
            expect(res.body.endpoint).to.equal("test_endpoint");
            
            done();
        });
    }); 
*/
});