/*jslint node: true */
'use strict';
var express = require('express');
var router = express.Router();
var e_jwt = require('express-jwt');
var userAuthority = require('../userAuthority');
var service = require('../service/vehicleService');
var config = require('../config');

router.use(e_jwt({
    secret: config.key
}));

var verify = function(req, res, next) {
    if (req.user.authority != userAuthority.consignee) {
        var err = new Error();
        err.name = 'UnauthorizedError';
        return next(err);
    }
    next();
};

router.get('/', verify, function(req, res, next) {
    service
        .findByUser(req.user.id)
        .then(function(data) {
            var result = data[0] || {};
            res.json({
                status: 'success',
                data: result
            });
        })
        .catch(function(err) {
            return next(err);
        });
});

router.post('/', verify, function(req, res, next) {
    var license = req.body.license,
        vehicle_type = req.body.vehicleType,
        vehicle_length = req.body.vehicleLength,
        vehicle_weight = req.body.vehicleWeight,
        userId = req.user.id;
    service
        .save({
            license: license,
            vehicle_type: vehicle_type,
            vehicle_length: vehicle_length,
            vehicle_weight: vehicle_weight,
            usr_id: userId
        })
        .then(function() {
            res.json({
                status: 'success'
            });
        })
        .catch(function(err) {
            return next(err);
        });
});

module.exports = router;
