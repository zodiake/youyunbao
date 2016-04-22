/**
 * Created by yagamai on 16-4-22.
 */
var amqp = require('amqp');
var url = 'amqp://guest:guest@localhost:5672/test';

var exchange = {
    publishState: function (obj) {
        var connection = amqp.createConnection({
            url: url
        });
        connection.on('ready', function () {
            connection.exchange('order-exchange', {passive: true}, function (exchange) {
                exchange.publish('orderstate.update', obj, {contentType: 'application/json'});
            });
        });
    },
    publishOrderUpdate: function (obj) {
        var connection = amqp.createConnection({
            url: url
        });
        connection.on('ready', function () {
            connection.exchange('order-exchange', {passive: true}, function (exchange) {
                exchange.publish('orderApp.update', obj, {contentType: 'application/json'});
            });
        });
    },
    publishOrderGeo: function (obj) {
        var connection = amqp.createConnection({
            url: url
        });
        connection.on('ready', function () {
            connection.exchange('order-exchange', {passive: true}, function (exchange) {
                console.log('obj',obj);
                exchange.publish('orderGeo.update', obj, {contentType: 'application/json'});
            });
        });
    }
};

module.exports = exchange;
