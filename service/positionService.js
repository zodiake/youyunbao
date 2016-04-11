var pool = require('../utils/pool');
var config = require('../config');

var service = {
    insert: function (data) {
        var sql = 'insert into order_gis set ?';
        return pool.query(sql, data);
    },
    findAll: function (orderId, cb) {
        var sql = 'select order_gis.created_time,order_gis.longitude,order_gis.latitude ,orders.current_state from order_gis join orders on orders.id=order_gis.order_id where order_id=? order by created_time desc';
        return pool.query(sql, [orderId]);
    },
	batchInsert:function(data){
		var sql = 'insert into order_gis set ?';
		var length=data.length;
		var arraySql=data.map(function(d){
			return sql;
		});
		console.log(arraySql);
		return pool.query(arraySql.join(';'),data);
	}
}

module.exports = service;
