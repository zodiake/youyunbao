/*jslint node: true */
'use strict';
var pool = require('../utils/pool');
var q = require('q');

var cache = {};

var service = {
    findOne: function (id) {
        var sql = 'select * from cargoo_name where id=?';
        return pool.query(sql, [id]);
    },
    findByParent: function (parentId) {
        var defer = q.defer();
        var sql;
        if (parentId === null) {
            sql = 'select * from cargoo_name where parent_id is null and activate=1';
            if (cache.first) {
                defer.resolve(cache.first);
                return defer.promise;
            } else {
                return pool.query(sql, []).then(function (data) {
                    cache.first = data;
                    return data;
                });
            }
        } else {
            sql = 'select * from cargoo_name where parent_id=? and activate=1';
            if (cache[parentId]) {
                console.log('cached');
                defer.resolve(cache[parentId]);
                return defer.promise;
            } else {
                console.log('nocached');
                return pool.query(sql, [parentId]).then(function (data) {
                    if (data.length > 0) {
                        cache[parentId] = data;
                        return data;
                    } else {
                        return null;
                    }
                });
            }

        }
    },
    findAll: function (isAdmin) {
        var sql = 'select * from cargoo_name where activate=1';
        var defer = q.defer();
        if (cache.all) {
            defer.resolve(cache.all);
            return defer.promise;
        } else {
            return pool.query(sql, []).then(function (data) {
                cache.all = data;
                return data;
            });
        }
    },
    findByName: function (name) {
        var sql = 'select * from cargoo_name where name=? and activate=1';
        var defer = q.defer();
        var cacheName = 'name:' + name;
        if (cache[cacheName]) {
            defer.resolve(cache[cacheName]);
            return defer.promise;
        } else {
            return pool.query(sql, [name]).then(function (data) {
                if (data.length > 0) {
                    cache[cacheName] = data[0];
                    return data[0];
                } else {
                    return null;
                }
            });
        }
    },
    adminFindAll: function () {
        var sql = 'select * from cargoo_name';
        return pool.query(sql, []);
    },
    updateState: function (id, state) {
        var sql = 'update cargoo_name set activate=? where id=?';
        return pool.query(sql, [state, id]);
    },
    update: function (id, category) {
        var sql = 'update cargoo_name set name=?,parent_id=? where id=?';
        return pool.query(sql, [category.name, category.category, id]);
    },
    save: function (category) {
        var sql = 'insert into cargoo_name set ?';
        return pool.query(sql, [category]);
    },
    clearCache: function () {
        cache = {};
    }
};

module.exports = service;
