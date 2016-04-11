var express = require('express');
var router = express.Router();
var e_jwt = require('express-jwt');
var config = require('../config');
var orderState = require('../orderState');

router.use(e_jwt({
    secret: config.key
}));

module.exports = router;
