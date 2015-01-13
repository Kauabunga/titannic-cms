'use strict';

var express = require('express');
var controller = require('./document.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.put('/publish/:id', auth.isAuthenticated(), controller.publish);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/preview/:id', controller.getPreview);
router.get('/history/:id', auth.hasRole('admin'), controller.getHistory);

module.exports = router;
