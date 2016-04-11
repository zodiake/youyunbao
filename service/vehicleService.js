/*jslint node: true */
'use strict';
var pool = require('../utils/pool');

var service = {
    findByUser: function(userId) {
        var sql = 'select * from vehicle where usr_id=?';
        return pool.query(sql, [userId]);
    },
    countByUser: function(userId) {
        var sql = 'select count(*) as countNum from vehicle where usr_id=?';
        return pool.query(sql, [userId]);
    },
    save: function(vehicle) {
        var sql = 'update vehicle set ? where usr_id=' + vehicle.usr_id;
        var insert = 'insert into vehicle set ?';
        return this.findByUser(vehicle.usr_id)
            .then(function(data) {
                if (data[0]) {
                    return pool.update(sql, vehicle);
                } else {
                    return pool.insert(insert, vehicle);
                }
            });
    }
};

module.exports = service;
