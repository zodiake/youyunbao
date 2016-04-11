/*jslint node: true */
'use strict';
var express = require('express');
var router = express.Router();
var service = require('../service/suggestService');
var e_jwt = require('express-jwt');
var config = require('../config');
var userAuthority = require('../userAuthority');

var router = express.Router();

router.use(e_jwt({
    secret: config.key
}));

var verify = function (req, res, next) {
    if (req.user.authority !== userAuthority.admin) {
        var err = new Error();
        err.name = 'UnauthorizedError';
        return next(err);
    }
    next();
};

router.get('/', verify, function (req, res, next) {
    var state = req.query.state || 'all',
        page = req.query.page || 1,
        size = req.query.size || 15;
    service
        .findByState(state, {
            page: page - 1,
            size: size
        })
        .then(function (data) {
            res.json(data);
        })
        .catch(function (err) {
            return next(err);
        });
});

router.post('/', function (req, res, next) {
    var desc = req.body.desc,
        usr = req.user;
    service
        .save({
            description: desc,
            created_time: new Date(),
            mobile: usr.name,
            state: 0
        })
        .then(function (data) {
            res.json({
                status: 'success'
            });
        })
        .catch(function (err) {
            return next(err);
        });
});

//get suggestion detail
router.get('/:id', verify, function (req, res, next) {
    var id = req.params.id;

    service
        .findOne(id)
        .then(function (data) {
            //if state is readed do nothing
            if (data[0].state === 1) {
                return data[0];
            } else {
                //if state is unreaded update state to readed
                return service.updateState(1, data[0].id);
            }
        })
        .then(function (data) {
            data.state = 1;
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