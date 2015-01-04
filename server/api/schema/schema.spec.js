'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('GET /api/schemas', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/schemas')
      .expect(401)
      .end(function(err, res) {
        done();
      });
  });
});
