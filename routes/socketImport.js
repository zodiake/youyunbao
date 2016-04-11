/*jslint node: true */
'use strict';
var csv = require('csv');
var _ = require('lodash');
var moment = require('moment');
var q = require('q');

var fs = require('fs');
var join = require('path').join;
var crypto = require('crypto');

var orderService = require('../service/orderService');
var categoryService = require('../service/categoryService');
var orderState = require('../orderState');

function importBegin(nsp, filePath, room) {

    function socketEmitFail(data, message) {
        data.message = message;
        nsp.to(room).emit('fail', data);
        data.error = true;
        return data;
    }

    var parser = csv.parse();

    var total;

    parser.on('error', function (err) {
        console.log('error:', err.message);
        console.log(parser.count);
    });

    parser.on('finish', function () {
        total = parser.count;
    });

    var extract = csv.transform(function (data) {
        if (parser.count > 1) {
            var result = {
                consignor: data[0],
                consignee: data[1],
                license: data[2],
                consignee_name: data[3],
                category: data[4],
                cargoo_name: data[5],
                origin: data[6],
                destination: data[7],
                etd: data[8],
                quantity: Number(data[9]),
                company_name: data[10],
                created_Time: new Date(),
                type: data[11]
            };
            result.row = parser.count;
            return result;
        }
        return null;
    });

    var validate = csv.transform(function (data) {
        function lengthValidate(data) {
            if (data.consignor.length != 11) {
                socketEmitFail(data, 'consignor shoule 11');
            }
            if (data.license.length > 8) {
                return socketEmitFail(data, 'license less than 11');
            }
            if (data.origin.length > 50) {
                return socketEmitFail(data, 'origin less then 10');
            }
            if (data.destination.length > 50) {
                return socketEmitFail(data, 'destination less then 10');
            }
            if (_.isNaN(data.quantity)) {
                return socketEmitFail(data, 'quantity should be number');
            }
            if (data.company_name > 15) {
                return socketEmitFail(data, 'company_name should less than 15');
            }
            if (data.etd === '')
                data.etd = null;
            if (data.etd != null && !moment(data.etd, 'YYYY-MM-DD HH:mm:ss').isValid()) {
                return socketEmitFail(data, 'etd not valid');
            }
        }

        function requiredValidate(data) {
            if (!data.license) {
                return socketEmitFail(data, 'license can not be null');
            }
            if (!data.consignee) {
                return socketEmitFail(data, 'consignee mobile can not be null');
            }
            if (!data.consignor) {
                return socketEmitFail(data, 'consignor can not be null');
            }
            if (data.category && !data.cargoo_name) {
                return socketEmitFail(data, 'set category should set cargoo_name');
            }
            if (data.cargoo_name && !data.category) {
                return socketEmitFail(data, 'set cargoo_name should set category');
            }
        }

        function dateValidate(data) {
            if (_.isNaN(data.etd)) {
                return socketEmitFail(data, 'no valid data type');
            }
        }

        if (data) {
            dateValidate(data);
            requiredValidate(data);
            lengthValidate(data);
            return data;
        }
    });

    var findConsignee = csv.transform(function (data) {

        function convertCategory(result) {
            if (!result.error && result.category) {
                return categoryService
                    .findByName(result.category)
                    .then(function (data) {
                        if (data) {
                            result.category = data.id;
                            return result;
                        } else {
                            return socketEmitFail(result, 'can not find catgory');
                        }
                    });
            } else {
                var defer = q.defer();
                result.category = null;
                defer.resolve(result);
                return defer.promise;
            }
        }

        function convertCargooName(result) {
            if (!result.error && result.cargoo_name) {
                return categoryService
                    .findByName(result.cargoo_name)
                    .then(function (data) {
                        if (data) {
                            result.cargoo_name = data.id;
                            return result;
                        } else {
                            return socketEmitFail(data, 'can not find cargoo_name');
                        }
                    });
            } else {
                var defer = q.defer();
                result.cargoo_name = null;
                defer.resolve(result);
                return defer.promise;
            }
        }

        if (data && !data.error) {
            convertCategory(data)
                .then(convertCargooName)
                .then(function (data) {
                    data.order_number = crypto.randomBytes(6).toString('hex');
                    data.current_state = orderState.dispatch;
                    data.is_batch = 1;
                    return data;
                })
                .then(function (data) {
                    if (total && data.row === total) {
                        nsp.to(room).emit('finish');
                    }
                    delete data.row;
                    orderService.insert(data);
                })
                .fail(function (err) {
                    data.message = err.message;
                })
                .catch(function (err) {
                    data.message = err.message;
                });
        }
    });

    var testPath = join(__dirname, '..', filePath);
    fs.createReadStream(testPath).pipe(parser).pipe(extract).pipe(validate).pipe(findConsignee);
}

module.exports = importBegin;
