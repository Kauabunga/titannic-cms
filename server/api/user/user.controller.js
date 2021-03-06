'use strict';

var q = require('q');
var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var Log = require('log');
var log = new Log('user.controller');


/**
 *
 * @param res
 * @param err
 * @returns {*}
 */
var validationError = function(res, err) {
  return res.json(422, err);
};


/**
 * Get a list of all the roles avalible to set a user as
 */
exports.roles = function(req, res){
  res.json({roles: config.userRoles});
};


/**
 *
 */
exports.getUserFromRequest = function(req) {

  log.debug('getting user from session');
  var deferred = q.defer();

  if (!req || !req.user || !req.user._id) {
    deferred.reject();
    log.error('getting user from session error on request');
  }
  else {
    User.findById(req.user._id, function (err, user) {
      log.debug('getting user from session success', user.name);

      deferred.resolve(user);
    });
  }


  return deferred.promise;
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  //default to guest - i.e. registered and waiting approval
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/**
 * Creates a new user from an admin acc request
 */
exports.adminCreate = function (req, res, next) {

  log.debug('admin create user', req.body);

  var newUser = new User(req.body);


  newUser.save(function(err, user) {
    if (err) {
      log.error('error admin create user', err);
      return validationError(res, err);
    }

    res.send(201);
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Change a users role
 */
exports.changeRole = function(req, res, next) {

  log.debug('change user role', req.params.id, req.body.role);

  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if(err){
      log.error('error changing role', err);
      return res.send(500);
    }
    user.role = req.body.role;
    user.save(function(err) {
      if (err) { return validationError(res, err); }
      res.send(200);
    });
  });
};


/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
