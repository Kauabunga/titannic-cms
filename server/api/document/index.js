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

router.get('/preview/:id/:env', controller.getPreview);
router.put('/updatepreview/:id', auth.isAuthenticated(), controller.updatePreviewContent);

router.get('/historylist/:id', auth.hasRole('admin'), controller.getHistory);
router.get('/historydocument/:id/:historyId', auth.hasRole('admin'), controller.getHistoryContent);

module.exports = router;
