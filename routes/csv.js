/*jslint node: true */
'use strict';
var express = require('express');
var router = express.Router();
var e_jwt = require('express-jwt');
var config = require('../config');
var csv = require('csv');
var fs = require('fs');
var path = require('path');

router.use(e_jwt({
    secret: config.key
}));

router.post('/csv/upload', function (req, res, next) {
    var filePath = req.files.path;

});

module.exports = router;
