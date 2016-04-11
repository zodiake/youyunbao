/*jslint node: true */
'use strict';
var express = require('express');
var router = express.Router();
var versionService = require('../service/versionService');
/* GET home page. */
router.get('/', function (req, res) {
    res.render('index');
});

router.get('/login.html', function (req, res) {
    res.render('login');
});

function findVersion(id) {
    return function (req, res, next) {
        versionService
            .findOne(id)
            .then(function (data) {
                res.json({
                    status: 'success',
                    data: data[0]
                });
            })
            .catch(function (err) {
                next(err);
            })
            .fail(function (err) {
                next(err);
            });
    }
}

router.get('/android/version/consignee', findVersion(1));

router.get('/android/version/consignor', findVersion(2));

router.get('/ios/version/consignor', findVersion(3));

router.get('/ios/version/consignee', findVersion(4));

module.exports = router;
