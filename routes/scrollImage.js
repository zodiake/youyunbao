/*jslint node: true */
'use strict';
var express = require('express');
var router = express.Router();

var scrollImageService = require('../service/scrollImageService');

router.get('/', function (req, res, next) {
    scrollImageService
        .cacheFindAll()
        .then(function (data) {
            res.json({
                status: 'success',
                data: data
            });
        })
        .fail(function (err) {
            next(err);
        })
        .catch(function (err) {
            next(err);
        });
});

module.exports = router;
