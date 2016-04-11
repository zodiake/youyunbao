/*jslint node: true */
'use strict';
var pool = require('../utils/pool');
var q = require('q');
var cache = [];

var service = {
    findAll: function () {
        var sql = 'select * from scroll_image';
        return pool.query(sql, []);
    },
    updateUrl: function (id, image) {
        var sql = 'update scroll_image set image_url=? ,updated_time=? where id=?';
        cache = [];
        return pool.query(sql, [image.url, image.updated_time, id]);
    },
    updateHref: function (id, image) {
        var sql = 'update scroll_image set image_href=? ,updated_time=? where id=?';
        cache = [];
        return pool.query(sql, [image.href, image.updated_time, id]);
    },
    cacheFindAll: function () {
        var sql = 'select * from scroll_image';
        var defer = q.defer();
        if (cache.length > 0) {
            defer.resolve(cache);
            return defer.promise;
        }
        return pool.query(sql, []).then(function (data) {
            cache = data;
            return data;
        });
    }
};

module.exports = service;
