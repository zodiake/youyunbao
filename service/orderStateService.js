/*jslint node: true */
'use strict';
var pool = require('../utils/pool');
var orderService = require('./orderService');
var exchange = require('./publish');

var service = {
    save: function (state) {
        var sql = 'insert into order_state set ?';
        orderService
            .findOne(state.order_id)
            .then(function (result) {
                result[0].img_url = state.img_url;
                result[0].refuse_desc = state.refuse_desc;
                result[0].refuse_reason = state.refuse_reason;
                exchange.publishState(result[0]);
            });
        return pool.query(sql, state);
    }
};

module.exports = service;
