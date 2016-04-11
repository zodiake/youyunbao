/*jslint node: true */
'use strict';
var express = require('express');
var router = express.Router();
var e_jwt = require('express-jwt');
var config = require('../config');
var service = require('../service/categoryService');

router.use(e_jwt({
    secret: config.key
}));

router.get('/', function (req, res, next) {
    var parent = req.query.id || null;
    service
        .findByParent(parent)
        .then(function (data) {
            res.json({
                status: 'success',
                data: data
            });
        })
        .catch(function (err) {
            return next(err);
        });
});

router.get('/all', function (req, res, next) {
    service.findAll()
        .then(function (data) {
            res.json({
                status: 'success',
                data: data
            });
        })
        .catch(function (err) {
            return next(err);
        });
});

module.exports = router;
