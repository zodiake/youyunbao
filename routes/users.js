/*jslint node: true */
'use strict';
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var e_jwt = require('express-jwt');
var userService = require('../service/userService');
var config = require('../config');
var user_type = require('../userAuthority');
var userDetailService = require('../service/userDetailService');
var genderType = require('../gender');
var crypto = require('crypto');
var multer = require('multer');
var path = require('path');
var webService = require('../service/webService');
var promotionService = require('../service/promotionService');

var fileMulter = multer({
    dest: './uploads/',
    group: {
        image: './public/uploads'
    }
});

var user_mobile = {};
var forget = {};

var cryptoPwd = function (password) {
    return crypto.createHash('md5').update(password).digest('hex');
};

/* GET users listing. */
router.get('/', function (req, res, next) {
    var mobile = req.query.mobile;
    userService
        .findByName(mobile)
        .then(function (data) {
            res.json({
                status: 'success',
                data: data[0]
            });
        })
        .fail(function (err) {
            next(err);
        })
        .catch(function (err) {
            next(err);
        });
});

var verify = e_jwt({
    secret: config.key
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//获取验证码
router.get('/captcha', function (req, res, next) {
    var mobile = req.query.mobile,
        type = req.query.type;

    if (type == 'signup') {
        userService
            .countByMobile(mobile)
            .then(function (data) {
                if (data[0].usrCount === 0) {
                    var captcha = getRandomInt(1000, 9999);
                    webService.sendSms(mobile, captcha, 895);
                    user_mobile[mobile] = captcha;
                    res.json({
                        status: 'success'
                    });
                } else {
                    res.json({
                        status: 'fail',
                        message: 'user exist'
                    });
                }
            });
    } else if (type === 'forget') {
        var captcha = getRandomInt(1000, 9999);
        webService.sendSms(mobile, captcha, 901);
        forget[mobile] = captcha;
        res.json({
            status: 'success'
        });
    } else {
        var error = new Error('no type');
        next(error);
    }
});

router.post('/forget', function (req, res, next) {
    var mobile = req.body.mobile,
        captcha = req.body.captcha,
        password = req.body.password,
        error;
    if (captcha == forget[mobile]) {
        userService.updatePwdByName({
                name: mobile,
                password: cryptoPwd(password)
            })
            .then(function (data) {
                delete forget[mobile];
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
    } else {
        error = new Error('captcha not match');
        return next(error);
    }
});

//注册
router.post('/signup', function (req, res, next) {
    var name = req.body.name,
        password = req.body.password,
        captcha = req.body.captcha,
        type = user_type[req.body.type],
        code = req.body.code,
        error;

    /*
     if (!user_mobile[name] || captcha != user_mobile[name]) {
     error = new Error('验证码错误');
     return next(error);
     }
     */
    if (type === undefined) {
        error = new Error('type can not be null');
        return next(error);
    }

    promotionService
        .countByCode(code)
        .then(function (res) {
            if (res[0].countNum > 0)
                return true;
            return false;
        })
        .then(function (result) {
            console.log(result);
            if (result) {
                return userService.save({
                    name: name,
                    password: cryptoPwd(password),
                    authority: type,
                    code: code
                }).then(function (result) {
                    return userDetailService
                        .save({
                            id: result,
                            created_Time: new Date()
                        })
                        .then(function (data) {
                            delete user_mobile[name];
                            var token = jwt.sign({
                                id: result,
                                name: name,
                                authority: type
                            }, config.key);
                            res.json({
                                status: 'success',
                                data: token
                            });
                        });
                })
            } else {
                error = new Error('邀请码不正确');
                return next(error);
            }
        })
        .catch(function (err) {
            return next(err);
        });
});

router.post('/admin/login', function (req, res, next) {
    var name = req.body.name,
        password = req.body.password,
        err;
    userService
        .findByName(name)
        .then(function (data) {
            if (data.length === 0) {
                err = new Error('用户不存在');
                return next(err);
            } else if (data[0].password != cryptoPwd(password)) {
                err = new Error('密码错误');
                return next(err);
            }
            var usr = data[0];
            var token = jwt.sign({
                id: usr.id,
                name: usr.name,
                authority: usr.authority
            }, config.key);
            res.json({
                status: 'success',
                token: token,
                authority: usr.authority
            });
        });
});

//登入
router.post('/login', function (req, res, next) {
    var name = req.body.name,
        password = req.body.password,
        authority = req.body.authority;
    userService
        .findByName(name)
        .then(function (data) {
            if (data.length === 0) {
                res.json({
                    status: 'fail',
                    message: '用户不存在'
                });
                return;
            } else if (data[0].password != cryptoPwd(password)) {
                //to do password encode
                res.json({
                    status: 'fail',
                    message: '密码错误'
                });
                return;
            } else if (data[0].activate === 0) {
                res.json({
                    status: 'fail',
                    message: '用户被冻结'
                });
                return;
            } else if (data[0].authority !== user_type[authority]) {
                res.json({
                    status: 'fail',
                    message: '角色错误'
                });
                return;
            }
            return userDetailService
                .findOne(data[0].id)
                .then(function (detail) {
                    var usr = data[0];
                    var token = jwt.sign({
                        id: usr.id,
                        name: usr.name,
                        authority: usr.authority
                    }, config.key);
                    res.json({
                        status: 'success',
                        token: token,
                        data: detail[0]
                    });
                });
        })
        .catch(function (err) {
            return next(err);
        });
});

//修改密码
router.post('/changePwd',
    verify,
    function (req, res, next) {
        var oldPwd = req.body.oldPwd,
            newPwd = req.body.newPwd,
            usrId = req.user.id;

        userService
            .findOne(usrId)
            .then(function (data) {
                if (data[0] && data[0].password == cryptoPwd(oldPwd)) {
                    return userService.updatePwd({
                        id: usrId,
                        password: cryptoPwd(newPwd)
                    });
                } else {
                    return 'fail';
                }
            })
            .then(function (data) {
                if (data == 'fail')
                    res.json({
                        status: 'fail',
                        message: 'oldPwd not match'
                    });
                else
                    res.json({
                        status: 'success'
                    });
            })
            .catch(function (err) {
                return next(err);
            });
    });

router.get('/detail',
    verify,
    function (req, res, next) {
        var id = req.user.id;
        userDetailService
            .findOne(id)
            .then(function (data) {
                res.json({
                    status: 'success',
                    data: data[0]
                });
            })
            .catch(function (err) {
                return next(err);
            });
    });

router.post('/detail',
    verify,
    function (req, res, next) {
        var usr = req.user,
            name = req.body.name,
            gender = genderType[req.body.gender],
            identfied_number = req.body.identify,
            company_name1 = req.body.companyName1,
            company_name2 = req.body.companyName2,
            company_name3 = req.body.companyName3;
        userDetailService
            .update({
                id: usr.id,
                detail_name: name,
                gender: gender,
                identified_number: identfied_number,
                company_name1: company_name1,
                company_name2: company_name2,
                company_name3: company_name3
            })
            .then(function (data) {
                res.json({
                    status: 'success'
                });
            }).catch(function (err) {
            return next(err);
        });
    });

router.post('/portrait', verify, fileMulter, function (req, res, next) {
    var file = req.files.file,
        userId = req.user.id;
    var urlPath = file.path.split(path.sep).slice(1).join('/');
    userDetailService
        .updatePortrait(urlPath, userId)
        .then(function (data) {
            res.json({
                status: 'success',
                data: urlPath
            });
        })
        .catch(function (err) {
            return next(err);
        });
});

module.exports = router;
