var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var e_jwt = require('express-jwt');
var config = require('../config');
var userAuthority = require('../userAuthority');
var _ = require('lodash');

module.exports = router;
