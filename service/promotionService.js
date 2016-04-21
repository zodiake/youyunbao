/**
 * Created by yagamai on 16-4-21.
 */
'use strict';
var pool = require('../utils/pool');
var orderState = require('../orderState');
var q = require('q');
var _ = require('lodash');

var service = {
    findAll: function (option, pageable) {
        var page = pageable.page || 0, size = pageable.size;
        var sql = 'select * from promotion order by created_time limit ?,?';
        return pool.query(sql, [page, size]);
    },
    findOne: function (id) {
        var sql = 'select * from promotion where id=?';
        return pool.query(sql, [id]);
    },
    save: function (promotion) {
        var sql = 'insert into promotion set ?';
        return pool.insert(sql, promotion);
    },
    update: function (promotion) {
        var sql = 'update promotion set ? where id=?';
        return pool.query(sql, [promotion, id]);
    }
};

module.exports = service;
