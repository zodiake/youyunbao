/*jslint node: true */
'use strict';
var amqp = require('amqp');
var categoryService = require('../service/categoryService');
var orderService = require('../service/orderService');
var orderStateService = require('../service/orderStateService');
var stateType = require('../stateType');
var jpush = require('../service/jpush');
var orderState = require('../orderState');
var webService = require('./webService');

var connection = amqp.createConnection({
    url: 'amqp://guest:guest@localhost:5672/app'
});

var sendSms = function (mobile, content, code) {
    webService.sendSms(mobile, content, code);
};

connection.on('ready', function () {
    /*-----------------orderCreate queue----------------------------*/
    connection.queue('orderCreate-queue', {
            passive: true
        },
        function (q) {
            q.bind('order-exchange', 'order.create');
            q.subscribe(function (message, headers, deliveryInfo, messageObject) {
                var order = {
                    consignor: message.user_mobile,
                    created_time: message.order_time,
                    order_number: message.order_id,
                    license: message.license,
                    consignee_name: message.driver_name,
                    consignee: message.driver_mobile,
                    company_name: message.company_name,
                    cargoo_name: message.cargoo_name,
                    destination: message.destination,
                    origin: message.origin,
                    quantity: message.quantity,
                    type: message.type,
                    app_or_out: 0,
                    current_state: orderState.dispatch
                };
                categoryService
                    .findByName(order.cargoo_name)
                    .then(function (data) {
                        if (data != null) {
                            order.cargoo_name = data.id;
                            order.category = data.parent_id;
                            return order;
                        } else {
                            return null;
                        }
                    })
                    .then(function (order) {
                        if (order != null)
                            return orderService.save(order);
                        else
                            return null;
                    })
                    .then(function (d) {
                        if (d != null) {
                            sendSms(order.consignor, '［油运宝］您有一笔新的运单，等待发送', 898);
                            jpush.pushConsignor(order.consignor, '您有一笔新的运单，等待发送。');
                        }
                    })
                    .fail(function (err) {
                        console.log(err);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            });
        });
    /*-----------------orderUpdate queue----------------------------*/
    connection.queue('orderUpdate-queue', {
        passive: true
    }, function (q) {
        q.bind('order-exchange', 'order.update');
        q.subscribe(function (message, headers, deliveryInfo, messageObject) {
            console.log(message);
            var order = {
                consignor: message.user_mobile,
                created_time: message.order_time,
                order_number: message.order_id,
                license: message.license,
                consignee_name: message.driver_name,
                consignee: message.driver_mobile,
                company_name: message.company_name,
                cargoo_name: message.cargoo_name,
                destination: message.destination,
                origin: message.origin,
                quantity: message.quantity,
                type: message.type,
            };
            categoryService
                .findByName(order.cargoo_name)
                .then(function (data) {
                    if (data == null) {
                        return null;
                    } else {
                        order.cargoo_name = data.id;
                        order.category = data.parent_id;
                        return order;
                    }
                })
                .then(function (order) {
                    if (order != null) {
                        orderService.updateByOrderNumber(order.order_number, order);
                    }
                })
                .fail(function (err) {
                    console.log(err);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });
    });
    /*-----------------orderDelete queue----------------------------*/
    connection.queue('orderDelete-queue', {
        passive: true
    }, function (q) {
        q.bind('order-exchange', 'order.delete');
        q.subscribe(function (message, headers, deliveryInfo, messageObject) {
            console.log(message);
            orderService
                .close(message.order_id)
                .fail(function (err) {
                    console.log(err);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });
    });
    /*-----------------orderState queue----------------------------*/
    connection.queue('orderstate-queue', {
        passive: true
    }, function (q) {
        q.bind('order-exchange', 'orderstate.create');
        q.subscribe(function (message, headers, deliveryInfo, messageObject) {
            console.log(message);
            orderService
                .findByOrderNumber(message.order_id)
                .then(function (data) {
                    var result = {
                        order_id: data[0].id,
                        state_name: stateType[message.order_state],
                        created_time: new Date()
                    };
                    if (message.actual_weight && message.actual_weight !== 0) {
                        return orderStateService
                            .save(result)
                            .then(function () {
                                orderService.updateWeightByOrderNumber(message.actual_weight, message.order_id);
                            });
                    }
                    return orderStateService.save(result);
                })
                .fail(function (err) {
                    console.log(err);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });
    });
});

module.exports = connection;