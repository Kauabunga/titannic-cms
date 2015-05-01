'use strict';

var should = require('should');
var app = require('../../app');
var User = require('../user/user.model');
var request = require('supertest');

var user = new User({
  provider: 'local',
  name: 'Fake User',
  email: 'test@test.com',
  password: 'password'
});

var admin = new User({
  provider: 'local',
  role: 'admin',
  name: 'Fake Admin',
  email: 'admin@admin.com',
  password: 'password'
});

describe('GET /api/schemas', function() {

  before(function(done) {
    // Create a user to authenticate with
    User.remove().exec().then(function() {
      user.save(function(err) {
        admin.save(function(err){
          done();
        })
      });
    });
  });

  it('should be unauthorised without a login', function(done) {
    request(app)
      .get('/api/schemas')
      .expect(401)
      .end(function(err, res) {
        done();
      });
  });

  it('should be unauthorised without an admin login', function(done) {

    request(app)
      .post('/auth/local')
      .send({
        email: user.email,
        password: user.password
      })
      .expect(200)
      .end(function(err, res){

        request(app)
          .get('/api/schemas')
          .expect(403)
          .set('Authorization', 'Bearer ' + res.body.token)
          .end(function(err, res){
            res.should.have.status(403);
            done();
          });

      });
  });

  it('should return a list of schemas for an admin user', function(done) {
      request(app)
        .post('/auth/local')
        .send({
          email: admin.email,
          password: admin.password
        })
        .expect(200)
        .end(function(err, res){

          request(app)
            .get('/api/schemas')
            .expect(200)
            .set('Authorization', 'Bearer ' + res.body.token)
            .end(function(err, res){
              res.should.have.status(200);
              done();
            });

        });
  });


});
