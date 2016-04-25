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
    pool.stream(orderService.buildQuery(req.query))
        .pipe(transformer)
        .pipe(stringfier)
        .pipe(res);
});

router.get('/promotion', function (req, res) {
    var stringfier = csv.stringify({
        columns: ['编号', '姓名', '岗位', '手机号', '推广码'],
        header: true
    });
    var sql;

    var type = getFactoryType(req);
    if (type == 1000)
        sql = 'select name,code,mobile,position,promotion_code from promotion';
    else
        sql = "select name,code,mobile,position,promotion_code from promotion where type='" + type + "'";

    var transformer = csv.transform(function (data) {
        return {
            编号: data.code,
            姓名: data.name,
            岗位: data.position,
            手机: data.mobile,
            推广码: data.promotion_code
        };
    });

    console.log(sql);
    res.attachment(new Date() + '.csv');
    pool.stream(sql)
        .pipe(transformer)
        .pipe(stringfier)
        .pipe(res);
});

function getFactoryType(req) {
    var type;
    if (req.query.type === 'admin5681') {
        type = '5681';
    } else if (req.query.type === 'admin5591') {
        type = '5591';
    } else if (req.query.type === 'admin5641') {
        type = '5641';
    } else if (req.query.type === 'admin5001') {
        type = '5001';
    } else if (req.query.type === 'admin5002') {
        type = '5002';
    } else if (req.query.type === 'admin5003') {
        type = '5003';
    } else if (req.query.type === 'admin5004') {
        type = '5004';
    } else if (req.query.type === 'admin5005') {
        type = '5005';
    } else
        type = '1000';
    return type;
}

module.exports = router;