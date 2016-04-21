/*jslint node: true */
'use strict';
var mysql = require('mysql');
var q = require('q');
var _ = require('lodash');
var pool = mysql.createPool({
    connectionLimit: 10,
    host:'192.168.1.137',
    user: 'root',
    password: '1234',
    database: 'zh',
    dateStrings: true,
    port: '3307',
    multipleStatements: true
});

//@object the cache object
//@key cache object key
var service = {
    query: function (sql, param) {
        var defer = q.defer();
        var query = pool.query(sql, param, function (err, rows, fields) {
            if (err) {
                console.log(err);
                defer.reject(err);
            } else {
                defer.resolve(rows);
            }
        });
        console.log(query.sql);
        return defer.promise;
    },
    insert: function (sql, param) {
        var defer = q.defer();
        var query = pool.query(sql, param, function (err, result) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(result.insertId);
            }
        });
        console.log(query.sql);
        return defer.promise;
    },
    update: function (sql, param) {
        var defer = q.defer();
        var query = pool.query(sql, param, function (err, result) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(result.changedRows);
            }
        });
        console.log(query.sql);
        return defer.promise;
    },
    batchInsert: function (sql, param) {
        pool.query(sql, param, function (err) {
            if (err)
                console.log(err);
        });
    },
    buildSql: function (sql, option) {
        for (var i in option) {
            if (option[i]) {
                var operator = option[i].operator || '=';
                var value;
                if (option[i].value)
                    value = option[i].value;
                else
                    value = option[i];
                if (_.isString(value))
                    sql.where(i + operator + "'" + value + "'");
                else
                    sql.where(i + operator + value);
            }
        }
        return sql;
    },
    stream: function (sql) {
        return pool.query(sql).stream({
            highWaterMark: 5
        });
    },
    getConnection: function () {
        var defer = q.defer();
        pool.getConnection(function (err, connection) {
            if (err)
                defer.reject(err)
            defer.resolve(connection);
        });
        return defer.promise;
    }
};

module.exports = service;
