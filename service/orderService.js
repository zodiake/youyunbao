/*jslint node: true */
'use strict';
var pool = require('../utils/pool');
var _ = require('lodash');
var userAuthority = require('../userAuthority');
var orderState = require('../orderState');
var squel = require('squel');
var q = require('q');
var jpush = require('../service/jpush');
var webService = require('./webService');
var exchange = require('./publish');

var service = {
    findOne: function (id) {
        var sql = 'select * from orders where id=?';
        return pool.query(sql, [id]);
    },
    findByOrderNumber: function (id) {
        var sql = 'select * from orders where order_number=?';
        return pool.query(sql, [id]);
    },
    findOneAndState: function (usr, id) {
        var sql;
        if (usr.authority === userAuthority.consignee) {
            sql = 'select *,orders.id as orderId,order_state.created_time as state_time,cargoo_name.name as cargooName from orders left join order_state on order_state.order_id=orders.id left join reviews on reviews.order_id=orders.id  LEFT JOIN usr ON orders.consignee = usr.name LEFT JOIN usr_detail ON usr_detail.id = usr.id left join cargoo_name on orders.cargoo_name=cargoo_name.id where orders.id=? and orders.consignee=? order by order_state.created_time desc';
        }
        if (usr.authority === userAuthority.consignor) {
            sql = 'select *,orders.id as orderId,order_state.created_time as state_time,cargoo_name.name as cargooName from orders left join order_state on order_state.order_id=orders.id left join reviews on reviews.order_id=orders.id  LEFT JOIN usr ON orders.consignee = usr.name LEFT JOIN usr_detail ON usr_detail.id = usr.id left join cargoo_name on orders.cargoo_name=cargoo_name.id where orders.id=? and orders.consignor=? order by order_state.created_time desc';
        }
        return pool.query(sql, [id, usr.name]);
    },
    convertArrayToString: function (data) {
        var array = data.map(function (d) {
            return d.order_number;
        });
        return array.join(',');
    },
    findByUsrAndState: function (user, state, page) {
        var sql = squel.select()
            .from('orders')
            .left_join('cargoo_name', null, 'cargoo_name.id=orders.cargoo_name')
            .field('orders.id', 'id')
            .field('orders.company_name', 'company_name')
            .field('orders.order_number', 'order_number')
            .field('orders.license', 'license')
            .field('orders.consignee', 'mobile')
            .field('orders.consignee_name', 'consignee_name')
            .field('cargoo_name.name', 'cargoo_name')
            .field('orders.current_state', 'current_state')
            .field('orders.created_time', 'created_time')
            .field('orders.type', 'type'),
            stateFilter = squel.expr(),
            userFilter = squel.expr();
        if (state.length > 0) {
            state.forEach(function (d) {
                stateFilter.or("current_state='" + d + "'");
            });
        }

        if (state.length === 0 && user.authority === userAuthority.consignee) {
            userFilter.and("current_state!='" + orderState.confirm + "'");
            userFilter.and("current_state!='" + orderState.refuse + "'");
        }

        if (user.authority === userAuthority.consignor) {
            userFilter.and("consignor='" + user.name + "'");
        } else if (user.authority === userAuthority.consignee) {
            userFilter.and("consignee='" + user.name + "'");
            userFilter.and("current_state!='" + orderState.dispatch + "'");
        }

        userFilter.and("current_state!='" + orderState.closed + "'");

        sql.where(stateFilter);
        sql.where(userFilter);
        sql.order('created_time', false);
        sql.limit(page.size).offset(page.page * page.size);
        return pool.query(sql.toString(), []);
    },
    /*findOne by consignee or consignor */
    findByConsigneeAndId: function (userId, id) {
        var sql = 'select * from orders where consignee=? and id=?';
        return pool.query(sql, [userId, id]);
    },
    findByConsignorAndId: function (userId, id) {
        var sql = 'select * from orders where consignor=? and id=?';
        return pool.query(sql, [userId, id]);
    },
    findByUsrIdAndId: function (user, orderId) {
        if (user.authority === userAuthority.consignee) {
            return this.findByConsignorAndId(user.id, orderId);
        }
        return this.findByConsignorAndId(user.id, orderId);
    },
    countByUsrIdAndId: function (user, orderId) {
        var consigneeSql = 'select count(*) as countnum from orders where id=? and consignee=?',
            consignorSql = 'select count(*) as countnum from orders where id=? and consignor=?';
        if (user.authority === userAuthority.consignee) {
            return pool.query(consigneeSql, [orderId, user.name]);
        } else if (user.authority === userAuthority.consignor) {
            return pool.query(consignorSql, [orderId, user.name]);
        } else {
            var defer = q.defer();
            defer.reject();
            return defer.promise;
        }

    },
    findByOrderId: function (orderId) {
        var sql = 'select * from orders join usr on orders.consignee=usr.id where order_id=?';
        return pool.query(sql, [orderId]);
    },
    $$buildOptionSql: function (option) {
        var sql = squel.select()
            .from('orders')
            .left_join('cargoo_name', null, 'cargoo_name.id=orders.cargoo_name');
        if (option.beginTime && option.endTime) {
            sql.where("Date(created_time) between '" + option.beginTime + "' and '" + option.endTime + "'");
        }
        if (option.beginTime && !option.endTime) {
            sql.where("Date(created_time) between '" + option.beginTime + "' and now()");
        }
        if (!option.beginTime && option.endTime) {
            sql.where("Date(created_time) <='" + option.endTime + "'");
        }
        if (option.current_state) {
            sql.where("orders.current_state='" + option.current_state + "'");
        }
        if (option.consignor) {
            sql.where("consignor ='" + option.consignor + "'");
        }
        if (option.order_number) {
            sql.where("order_number ='" + option.order_number + "'");
        }
        if (option.batch === 'batch') {
            sql.where("is_batch=1");
        } else if (option.batch === 'mq') {
            sql.where("app_or_out=0");
        } else if (option.batch === 'app') {
            sql.where("app_or_out=1");
        }
        if (option.type) {
            sql.where("type='" + option.type + "'");
        }
        return sql;
    },
    findByOption: function (page, option) {
        var limit = page.size,
            offset = (page.page - 1) * limit;
        var countSql = this.$$buildOptionSql(option).field('count(*)', 'countNum');
        var allSql = this.$$buildOptionSql(option)
            .field('orders.id', 'id')
            .field('orders.consignee', 'consignee')
            .field('orders.consignor', 'consignor')
            .field('orders.order_number', 'order_number')
            .field('orders.consignee_name', 'consignee_name')
            .field('orders.company_name', 'company_name')
            .field('cargoo_name.name', 'cargoo_name')
            .field('orders.quantity', 'quantity')
            .field('orders.created_time', 'created_time')
            .field('orders.current_state', 'current_state')
            .order('created_time', false);

        var arr = [countSql.toString(), allSql.offset(offset).limit(limit).toString()];
        return pool.query(arr.join(';'), []);
    },
    innerJoinUser: function (id) {
        var sql = 'SELECT orders.id, orders.order_number, orders.license, orders.consignee_name AS consigneeName, orders.consignee, orders.consignor, orders.company_name, orders.category, orders.cargoo_name, orders.origin, orders.destination, orders.etd, orders.quantity, orders.created_time FROM orders WHERE orders.id = ?';
        return pool.query(sql, [id]);
    },
    countByStateAndConsignee: function (order) {
        var sql = 'select count(*) as countNum from orders where current_state=? and consignee=?';
        return pool.query(sql, [order.state, order.consignee]);
    },
    insert: function (order) {
        var sql = 'insert into orders set ?';
        return pool.query(sql, order);
    },
    save: function (order) {
        var sql = 'insert into orders set ?';
        if (order.current_state === orderState.confirm) {
            webService.sendSms(order.consignee, '［油运宝］您有一笔新的运单。', 898);
            jpush.pushConsignee(order.consignee, '您有一笔新的运单');
        }
        return pool.insert(sql, order);
    },
    countAll: function () {
        var sql = 'select count(*) as countNum from orders';
        return pool.query(sql, []);
    },
    countByAppOrOut: function (appOrOut) {
        var sql = 'select count(*) as countNum from orders where app_or_out=?';
        return pool.query(sql, appOrOut);
    },
    countByState: function (state) {
        var sql = 'select count(*) as countNum from orders where current_state=?';
        return pool.query(sql, [state]);
    },
    aggregate: function () {
        var sqlCountAll = 'select count(*) as countNum from orders';
        var sqlApp = 'select count(*) as countNum from orders where app_or_out=1';
        var sqlOut = 'select count(*) as countNum from orders where app_or_out=0';
        var sqlDispatch = "select count(*) as countNum from orders where current_state='" + orderState.dispatch + "'";
        var sqlConfirm = "select count(*) as countNum from orders where current_state='" + orderState.confirm + "'";
        var sqlTransport = "select count(*) as countNum from orders where current_state='" + orderState.transport + "'";
        var sqlArrive = "select count(*) as countNum from orders where current_state='" + orderState.arrive + "'";
        var sqlAppraise = "select count(*) as countNum from orders where current_state='" + orderState.appraise + "'";
        var sqlRefuse = "select count(*) as countNum from orders where current_state='" + orderState.refuse + "'";
        var array = [sqlCountAll, sqlApp, sqlOut, sqlDispatch, sqlConfirm, sqlTransport, sqlArrive, sqlAppraise, sqlRefuse];
        return pool.query(array.join(";"), []);
    },
    aggregateByUser: function (user) {
        var dispatchsql = "select count(*) as dispatchCount from orders where current_state='待分配' and consignor='" + user.name + "'";
        var refusesql = "select count(*) as refuseCount from orders where current_state='已拒绝' and consignor='" + user.name + "'";
        var confirmsql = "select count(*) as confirmCount from orders where current_state='待确认' and consignor='" + user.name + "'";
        var transportsql = "select count(*) as transportCount from orders where current_state='运送中' and consignor='" + user.name + "'";
        var arrivesql = "select count(*) as arriveCount from orders where current_state='已送达' and consignor='" + user.name + "'";
        var array = [dispatchsql, refusesql, confirmsql, transportsql, arrivesql];
        return pool.query(array.join(';'), []);
    },
    updateStateByIdAndUser: function (order, user) {
        var sql;
        var self = this;
        if (user.authority === userAuthority.consignor) {
            sql = 'update orders set current_state=? where id=? and consignor=?';
        } else if (user.authority === userAuthority.consignee) {
            sql = 'update orders set current_state=? where id=? and consignee=?';
        }
        return pool
            .query(sql, [order.state, order.id, user.name])
            .then(function (row) {
                return self
                    .findOne(order.id)
                    .then(function (data) {
                        if (data[0].current_state === orderState.confirm) {
                            webService.sendSms(data[0].consignee, '［油运宝］您有一笔新的运单。', 896);
                            jpush.pushConsignee(data[0].consignee, '您有一笔新的运单');
                        } else if (data[0].current_state === orderState.refuse) {
                            jpush.pushConsignor(data[0].consignor, '您有一笔运单，已被司机拒绝');
                        } else if (data[0].current_state === orderState.transport) {
                            jpush.pushConsignor(data[0].consignor, '您有一笔运单，已被司机接收，正在运送中');
                        } else if (data[0].current_state === orderState.arrive) {
                            webService.sendSms(data[0].consignor, '［油运宝］您有一笔运单已到货，请查收。', 897);
                            jpush.pushConsignor(data[0].consignor, '您有一笔运单已到货，请查收');
                        }
                        return row;
                    });
            });
    },
    update: function (order, id, user) {
        var self = this;
        var sql = 'update orders set ? where id=? and consignor=?';
        return pool.query(sql, [order, id, user.name])
            .then(function () {
                console.log('enter');
                self.findOne(id)
                    .then(function (order) {
                        console.log('enter amqp');
                        exchange.publishOrderUpdate(order[0]);
                    })
            });
    },
    updateByOrderNumber: function (orderNumber, order) {
        var sql = 'update orders set ? where order_number=?';
        return pool.query(sql, [order, orderNumber]);
    },
    updateWeightByOrderNumber: function (weight, orderNumber) {
        var sql = 'update orders set actual_weight=? where order_number=?';
        return pool.query(sql, [weight, orderNumber]);
    },
    close: function (orderId) {
        var sql = "update orders set current_state='已关闭' where order_number=?";
        return pool.query(sql, [orderId]);
    },
    merge: function (webData, data) {
        return _.map(data, function (d) {
            _.each(webData, function (wd) {
                if (wd.Status === true && d.order_number === wd.BillCode) {
                    d.waiting = wd.Wating;
                    d.actual_weight = wd.actual_weight;
                    return;
                }
            });
            return d;
        });
    },
    buildQuery: function (option) {
        var allSql = this.$$buildOptionSql(option)
            .field('orders.id', 'id')
            .field('orders.consignee', 'consignee')
            .field('orders.consignor', 'consignor')
            .field('orders.order_number', 'order_number')
            .field('orders.consignee_name', 'consignee_name')
            .field('orders.company_name', 'company_name')
            .field('cargoo_name.name', 'cargoo_name')
            .field('orders.quantity', 'quantity')
            .field('orders.created_time', 'created_time')
            .field('orders.current_state', 'current_state')
            .order('created_time', false);
        return allSql.toString();
    }
};

module.exports = service;