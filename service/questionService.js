/*jslint node: true */
'use strict';
var pool = require('../utils/pool');

var service = {
    findAll: function () {
        var sql = 'select * from question ';
        return pool.query(sql, []);
    },
    findOne: function (id) {
        var sql = 'select * from question where id=?';
        return pool.query(sql, [id]);
    },
    update: function (id, question) {
        var sql = 'update questions set ? where id=?';
        return pool.query(sql, [question, id]);
    },
    save: function (question) {
        var sql = 'insert into questions set ?';
        return pool.query(sql, [question]);
    }
};

module.exports = service;
