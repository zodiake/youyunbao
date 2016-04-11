/*jslint node: true */
'use strict';
var pool = require('../utils/pool');

var service = {
    findOne: function (id) {
        var sql = 'select * from app_version where id=?';
        return pool.query(sql, [id]);
    }
}

module.exports = service;
