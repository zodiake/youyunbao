/*jslint node: true */
'use strict';
var express = require('express');
var router = express.Router();
var e_jwt = require('express-jwt');
var multer = require('multer');
var q = require('q');
var _ = require('lodash');
var crypto = require('crypto');
var path = require('path');

var orderService = require('../service/orderService');
var webService = require('../service/webService');
var reviewService = require('../service/reviewService');
var userService = require('../service/userService');
var positionService = require('../service/positionService');
var orderStateService = require('../service/orderStateService');
var jpush = require('../service/jpush');

var orderState = require('../orderState');
var orderCode = require('../orderCode');
var userAuthority = require('../userAuthority');
var config = require('../config');

var logger = require('../utils/logger');

router.use(e_jwt({
    secret: config.key
}));

var fileMulter = multer({
    dest: './uploads/',
    group: {
        image: './public/uploads'
    }
});

//list
router.get('/', function (req, res, next) {
    var page = req.query.page || 1,
        size = req.query.size || 10,
        user = req.user,
        pageable = {
            page: page - 1,
            size: size
        },
        states;

    if (req.query.states) {
        states = req.query.states.split(',');
    } else {
        states = [];
    }

    if (states.length > 2) {
        var err = new Error('you get too many states');
        return next(err);
    }

    states = _.map(states, function (s) {
        return orderState[s];
    });

    orderService
        .findByUsrAndState(user, states, pageable)
        .then(function (data) {
            //data should have millions & state code
            data.forEach(function (d) {
                d.current_state_code = orderCode[d.current_state];
                d.millions = Date.parse(d.created_time);
            });

            //data retrived should send to webservice to retrive more state
            var flag = data.some(function (d) {
                return d.current_state === orderState.transport && d.type;
            });
            if (flag) {
                var remote = [],
                    filtedData = _.chain(data).filter(function (d) {
                        return d.current_state === orderState.transport && d.type;
                    }).groupBy(function (d) {
                        return d.type;
                    }).value();

                for (var i in filtedData) {
                    var query = orderService.convertArrayToString(filtedData[i]);
                    remote.push(webService.queryFromWeb(i, query));
                }
                return q.all(remote).then(function (result) {
                    _.forEach(result, function (r) {
                        orderService.merge(r, data);
                    });
                    return data;
                });
            } else {
                return data;
            }
        }).then(function (data) {
            res.json({
                status: 'success',
                data: data
            });
        }).fail(function (err) {
            res.json({
                status: 'fail',
                message: err
            });
        }).catch(function (err) {
            return next(err);
        });
});

//getone
router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    orderService
        .findOneAndState(req.user, id)
        .then(function (data) {
            if (data.length === 0) {
                return null;
            }
            var state = [];
            var result = {
                id: data[0].orderId,
                order_number: data[0].order_number,
                license: data[0].license,
                consignor: data[0].consignor,
                consignee_name: data[0].consignee_name,
                etd: data[0].etd,
                consignee: data[0].consignee,
                companyName: data[0].company_name,
                category: data[0].category,
                cargooName: data[0].cargooName,
                origin: data[0].origin,
                destination: data[0].destination,
                quantity: data[0].quantity,
                currentState: data[0].current_state,
                createdTime: data[0].created_time,
                type: data[0].type,
                portrait: data[0].portrait,
            };
            result.current_state_code = orderCode[data[0].current_state];
            result.millions = Date.parse(data[0].created_time);
            data.forEach(function (d) {
                var s = {
                    stateName: d.state_name,
                    createTime: d.state_time
                };
                if (d.state_name === orderState.refuse) {
                    s.refuse_reason = d.refuse_reason;
                    s.refuse_desc = d.refuse_desc;
                }
                if (d.state_name === orderState.arrive) {
                    s.image_url = d.img_url;
                }
                if (d.state_name === orderState.appraise) {
                    result.description = d.description;
                }
                if (s.stateName !== null && s.createTime !== null) {
                    state.push(s);
                }
            });
            result.level = data[0].level;
            result.review_content = data[0].review_content;
            result.states = state;

            if (result.currentState === orderState.transport && result.type) {
                return webService.merge(result, result.type, id);
            } else {
                return result;
            }
        })
        .then(function (data) {
            if (!data) {
                return res.status(404).json({
                    status: 'fail',
                    data: 'not found'
                });
            }
            if (data.currentState === orderState.dispatch && req.user.authority === userAuthority.consignee) {
                return res.json({
                    status: 'success',
                    data: null
                });
            }
            res.json({
                status: 'success',
                data: data
            });
        })
        .catch(function (err) {
            return next(err);
        });
});

router.get('/user/aggregate', function (req, res, next) {
    var user = req.user;
    orderService
        .aggregateByUser(user)
        .then(function (data) {
            logger.log('info', '/user/aggregate info %s', data);
            res.json({
                status: 'success',
                data: '您有' + data[0][0].dispatchCount + '笔运单待分配,您有' + data[1][0].refuseCount + '笔运单已被司机拒绝,您有' + data[2][0].confirmCount + '笔运单待确认,您有' + data[3][0].transportCount + '笔运单运送中,您有' + data[4][0].arriveCount + '笔运单已送达'
            });
        })
        .fail(function (err) {
            next(err);
        })
        .catch(function (err) {
            next(err);
        });
});

var userAuthorityVerify = function () {
    return function (req, res, next) {
        var user = req.user;
        if (user.authority !== userAuthority.consignor) {
            var err = new Error('authority should be consignor');
            return next(err);
        }
        next();
    };
};

var extractOrder = function () {
    return function (req, res, next) {
        var license = req.body.license,
            mobile = req.body.mobile,
            consigneeName = req.body.consigneeName,
            companyName = req.body.companyName,
            category = req.body.category,
            cargooName = req.body.cargooName,
            origin = req.body.origin,
            destination = req.body.destination,
            etd = req.body.etd,
            quantity = req.body.quantity,
            state = orderState[req.body.state],
            user = req.user;

        var order = {
            license: license,
            consignee: mobile,
            consignee_name: consigneeName,
            company_name: companyName,
            category: category,
            cargoo_name: cargooName,
            origin: origin,
            destination: destination,
            etd: etd,
            quantity: quantity,
            created_time: new Date(),
            current_state: state,
            consignor: user.name,
            mobile: mobile
        };
        req.order = order;
        if (order.etd === '') {
            order.etd = null;
        }
        if (!order.quantity) {
            order.quantity = null;
        }
        if (!order.category) {
            order.category = null;
        }
        if (!order.cargoo_name) {
            order.cargoo_name = null;
        }
        next();
    };
};

var stateVerify = function () {
    return function (req, res, next) {
        var order = req.order;
        var err;
        if (order.current_state !== orderState.dispatch && order.current_state !== orderState.confirm) {
            err = new Error('状态应为待分配或带确认');
            return next(err);
        }
        if (order.current_state === orderState.confirm) {
            if (!order.license || !order.consignee) {
                err = new Error('请输入车牌，手机号');
                return next(err);
            }
        }
        next();
    };
};

//insert order orderstate must be dispatch or confirm
router.post('/', userAuthorityVerify(), extractOrder(), stateVerify(), function (req, res, next) {
    var order = req.order;
    order.order_number = crypto.randomBytes(6).toString('hex');
    userService
        .findByNameAndAuthority(order.mobile, userAuthority.consignee)
        .then(function (data) {
            if (data.length === 0) {
                // send sms
            }
            return orderService
                .save(order)
                .then(function (resultId) {
                    return orderStateService.save({
                        order_id: resultId,
                        state_name: order.current_state,
                        created_time: new Date(),
                        updated_by: req.user.name
                    }).then(function () {
                        return resultId;
                    });
                });
        })
        .then(function (resultId) {
            res.json({
                status: 'success',
                data: resultId
            });
        })
        .catch(function (err) {
            return next(err);
        });
});

//update
router.post('/:id/edit', extractOrder(), function (req, res, next) {
    var id = req.params.id;
    var order = req.order;
    var user = req.user;
    delete order.current_state;

    userService
        .findByNameAndAuthority(order.mobile, userAuthority.consignee)
        .then(function (data) {
            if (data.length === 0) {
                //send sms
            }
            order.consignee = order.mobile;
            return orderService.update(order, id, user);
        })
        .then(function (result) {
            res.json({
                status: 'success',
                data: result.changedRows
            });
        })
        .fail(function (err) {
            return next(err);
        })
        .catch(function (err) {
            return next(err);
        });
});

//one consignee can only have one transport order
function confirmStateVerify(req, res, next) {
    var state = req.body.state,
        user = req.user;
    req.body.state = orderState[state];

    //if state is null throw err
    if (!orderState[state]) {
        var err = new Error('请填写状态');
        return next(err);
    }

    //consignee can only have one transport order
    if (orderState[state] === orderState.transport && user.authority === userAuthority.consignee) {
        orderService
            .countByStateAndConsignee({
                state: orderState[state],
                consignee: user.name
            })
            .then(function (data) {
                if (data[0].countNum > 0) {
                    var err = new Error('请先完成上一个运单');
                    return next(err);
                } else {
                    next();
                }
            })
            .catch(function (err) {
                return next(err);
            });
    } else {
        next();
    }
}

function refuseStateConfirm(req, res, next) {
    var id = req.params.id,
        state = req.params.state,
        err;
    //only confirm state order can be refuse
    //only confirm or dispatch state order can be closed
    if (state === 'refuse' || state === 'closed') {
        orderService
            .findOne(id)
            .then(function (data) {
                var current_state = data[0].current_state;
                if (state === 'refuse') {
                    if (current_state !== orderState.confirm) {
                        err = new Error('待确认状态订单才能拒绝');
                        return next(err);
                    }
                }
                if (state === 'closed') {
                    if (current_state !== orderState.confirm || current_state !== orderState.dispatch) {
                        err = new Error('待分配待确认状态订单才能关闭');
                        return next(err);
                    }
                }
                next();
            });
    }
    next();
}

//update state
router.post('/:id/state', fileMulter, confirmStateVerify, refuseStateConfirm, function (req, res, next) {
    var state = req.body.state,
        id = req.params.id,
        user = req.user,
        s = {
            order_id: id,
            state_name: state,
            created_time: new Date(),
            updated_by: user.name
        };

    //如果需要将状态修改为已送达
    if (state === orderState.arrive) {
        if (req.files.file) {
            var file = req.files.file;
            s.img_url = file.path.split(path.sep).slice(1).join('/');
        }
    } else if (state === orderState.refuse) {
        var desc = req.body.desc,
            reason = req.body.reason;
        s.refuse_desc = desc;
        s.refuse_reason = reason;
    }

    orderService
        .updateStateByIdAndUser({
            id: id,
            state: state
        }, user)
        .then(function (data) {
            if (data.changedRows === 0) {
                var error = new Error('no data updated');
                return next(error);
            } else {
                return orderStateService.save(s);
            }
        })
        .then(function (data) {
            res.json({
                status: 'success'
            });
        })
        .fail(function (err) {
            return next(err);
        })
        .catch(function (err) {
            return next(err);
        });
});

router.post('/geo', function (req, res, next) {
    var longitude = req.body.longitude,
        latitude = req.body.latitude,
        order_id = req.body.orderId,
        created_time = req.body.createdTime;

    positionService
        .insert({
            longitude: longitude,
            latitude: latitude,
            order_id: order_id,
            created_time: created_time
        })
        .then(function () {
            res.json({
                status: 'success'
            });
        })
        .fail(function (err) {
            return next(err);
        })
        .catch(function (err) {
            return next(err);
        });
});


router.post('/geo/batch', function (req, res, next) {
    var arr = req.body;
    positionService
        .batchInsert(arr)
        .then(function () {
            res.json({
                status: 'success'
            });
        })
        .fail(function (err) {
            return next(err);
        })
        .catch(function (err) {
            return next(err);
        });
});

router.get('/:id/geo', function (req, res, next) {
    var id = req.params.id;
    positionService
        .findAll(id)
        .then(function (data) {
            res.json({
                status: 'success',
                data: data
            });
        })
        .fail(function (err) {
            return next(err);
        })
        .catch(function (err) {
            return next(err);
        });
});

function verifyConsignor(req, res, next) {
    var user = req.user;

    //only consignor can review
    if (user.authority !== userAuthority.consignor) {
        var err = new Error('没有权限');
        next(err);
    }

    //one order can ongly have one review
    reviewService
        .countByOrder(req.params.id)
        .then(function (data) {
            if (data[0].countNum > 0) {
                var err = new Error('该订单已被评价');
                return next(err);
            } else {
                next();
            }
        })
        .fail(function (err) {
            next(err);
        })
        .catch(function (err) {
            next(err);
        });
}

router.post('/:id/reviews', verifyConsignor, function (req, res, next) {
    var orderId = req.params.id,
        desc = req.body.desc,
        level = req.body.level,
        userId = req.user.id;

    var review = {
        description: desc,
        order_id: orderId,
        level: level,
        consignor_id: userId
    };
    reviewService
        .save(review)
        .then(function (data) {
            res.json({
                status: 'success'
            });
        })
        .fail(function () {
            res.json({
                status: 'fail',
                message: '插入失败'
            });
        })
        .catch(function (err) {
            return next(err);
        });
});

router.get('/:id/hint', function (req, res, next) {
    var id = req.params.id;
    orderService
        .findOne(id)
        .then(function (data) {
            if (data.length > 0) {
                jpush.pushConsignee(data[0].consignee, '你有一笔新的订单请尽快确认');
                res.json({
                    status: 'success'
                });
            } else {
                res.json({
                    'status': 'fail'
                });
            }
        })
        .fail(function () {
            res.json({
                status: 'fail',
                message: 'push fail'
            });
        })
        .catch(function (err) {
            return next(err);
        });
});

module.exports = router;
