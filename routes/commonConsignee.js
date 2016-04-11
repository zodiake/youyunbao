/**
 * Created by yagamai on 15-7-14.
 */
/*jslint node: true */
'use strict';
var express = require('express');
var router = express.Router();
var service = require('../service/commonConsigneeService');
var userService = require('../service/userService');
var e_jwt = require('express-jwt');

var config = require('../config');
var userAuthority = require('../userAuthority');

router.use(e_jwt({
    secret: config.key
}));

router.get('/', function (req, res, next) {
    var user = req.user;
    service
        .findByConsignor(user)
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

router.get('/search', function (req, res, next) {
    var mobile = req.query.mobile;
    service
        .search(mobile)
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

function validateConsignee(req, res, next) {
    var consignee = req.body.consignee;
    userService
        .countByIdAndAuthority(consignee, userAuthority.consignee)
        .then(function (data) {
            if (data[0].countNum > 0) {
                next();
            } else {
                var err = new Error('司机不存在');
                next(err);
            }
        })
        .fail(function (err) {
            next(err);
        })
        .catch(function (err) {
            next(err);
        });
}

function uniqueConsignee(req, res, next) {
    var consignee = req.body.consignee;
    var user = req.user;
    service
        .countByConsignorAndConsignee(user.id, consignee)
        .then(function (data) {
            if (data[0].countNum > 0) {
                var err = new Error('duplicate');
                next(err);
            }
            next();
        })
        .fail(function (err) {
            return next(err);
        })
        .catch(function (err) {
            return next(err);
        })
}

router.post('/', validateConsignee, uniqueConsignee, function (req, res, next) {
    var user = req.user,
        consignee = req.body.consignee;
    service
        .save(consignee, user)
        .then(function (data) {
            res.json({
                status: 'success'
            });
        })
        .fail(function (err) {
            next(err);
        })
        .catch(function (err) {
            next(err);
        });
});

router.post('/:id/delete', function (req, res, next) {
    var user = req.user,
        consignee = req.params.id;
    service
        .delete(user.id, consignee)
        .then(function (data) {
            res.json({
                status: 'success'
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
