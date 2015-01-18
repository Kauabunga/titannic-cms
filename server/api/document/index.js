'use strict';

var express = require('express');
var controller = require('./document.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('user'), controller.index);
router.get('/:id', auth.hasRole('user'), controller.show);
router.post('/', auth.hasRole('editor'), controller.create);
router.put('/:id', auth.hasRole('editor'), controller.update);
router.put('/publish/:id', auth.hasRole('publisher'), controller.publish);
router.patch('/:id', auth.hasRole('editor'), controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

router.get('/preview/:id/:env/:isPreviewPageReload', auth.hasRole('user'), controller.getPreview);
router.put('/updatepreview/:id', auth.hasRole('user'), controller.updatePreviewContent);

router.get('/historylist/:id', auth.hasRole('user'), controller.getHistory);
router.get('/historydocument/:id/:historyId', auth.hasRole('user'), controller.getHistoryContent);

module.exports = router;
