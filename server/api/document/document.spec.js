'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('GET /api/documents', function() {

  it('should get a 401', function(done) {
    request(app)
      .get('/api/documents')
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });
});
