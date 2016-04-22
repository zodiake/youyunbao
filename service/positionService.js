var pool = require('../utils/pool');
var config = require('../config');
var exchange = require('./publish');
var orderService = require('./orderService');

var service = {
    insert: function (data) {
        var sql = 'insert into order_gis set ?';
        return pool.query(sql, data);
    },
    findAll: function (orderId, cb) {
        var sql = 'select order_gis.created_time,order_gis.longitude,order_gis.latitude ,orders.current_state from order_gis join orders on orders.id=order_gis.order_id where order_id=? order by created_time desc';
        return pool.query(sql, [orderId]);
    },
    batchInsert: function (data) {
        var sql = 'insert into order_gis set ?';
        var arraySql = data.map(function (d) {
            return sql;
        });
        orderService
            .findOne(data[0].order_id)
            .then(function (d) {
                var order_number = d[0].order_number;
                data.forEach(function (d) {
                    d.order_number = order_number;
                });
                exchange.publishOrderGeo(data);
            });

        return pool.query(arraySql.join(';'), data);
    }
};

module.exports = service;
