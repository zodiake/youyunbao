/*jslint node: true */
'use strict';
var express = require('express');
var router = express.Router();

var csv = require('csv');
var pool = require('../utils/pool');

var orderService = require('../service/orderService');

router.get('/template', function (req, res, next) {
    var path = __dirname + '/template.csv';
    res.download(path);
});

router.get('/orders', function (req, res) {
    var stringfier = csv.stringify({
        columns: ['司机', '货主', '运单号', '司机姓名', '公司名称', '货物名称', '重量', '生成日期', '状态'],
        header: true
    });

    var transformer = csv.transform(function (data) {
        return {
            司机: data.consignee,
            货主: data.consignor,
            运单号: data.order_number,
            司机姓名: data.consignee_name,
            公司名称: data.consignee_name,
            货物名称: data.cargoo_name,
            重量: data.quantity,
            生成日期: data.created_time,
            状态: data.current_state
        };
    });

    res.attachment(new Date() + '.csv');
    console.log(orderService.buildQuery(req.query));
    pool.stream(orderService.buildQuery(req.query))
        .pipe(transformer)
        .pipe(stringfier)
        .pipe(res);
});

module.exports = router;