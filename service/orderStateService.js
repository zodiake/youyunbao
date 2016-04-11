/*jslint node: true */
'use strict';
var pool = require('../utils/pool');

var service = {
    save: function (state) {
        var sql = 'insert into order_state set ?';
        return pool.query(sql, state);
    }
};

module.exports = service;
