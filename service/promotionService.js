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
        var page = pageable.page || 0, size = +pageable.size;
        var sql = 'select * from promotion order by created_time limit ?,?';
        return pool.query(sql, [page * size, size]);
    },
    findByType: function (option, pageable) {
        var page = pageable.page || 0, size = +pageable.size;
        var sql = 'select * from promotion where type=? order by created_time limit ?,?';
        console.log(sql);
        return pool.query(sql, [option.type, page * size, size]);
    },
    countAll: function () {
        var sql = 'select count(*) as countNum from promotion';
        return pool.query(sql, null);
    },
    countByType: function (option) {
        var sql = 'select count(*) as countNum from promotion where type=?';
        return pool.query(sql, [option.type]);
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
    },
    countByMobile: function (mobile) {
        var sql = 'select count(*) as countSum from promotion where mobile=?';
        return pool.query(sql, [mobile]);
    },
    getCode: function () {
        var sql = 'insert into by_sequence values()';
        return pool.insert(sql, null);
    }
};

module.exports = service;
