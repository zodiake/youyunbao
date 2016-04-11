/*jslint node: true */
'use strict';
var JPush = require('jpush-sdk');
var consignorClient = JPush.buildClient('7867df712b8a722667e3df5f', '79481b91afa10953574f9983');
var consigneeClient = JPush.buildClient('9e7bb1417cd02aba5936a25f', '1b19da4d4ec71fbfbadfdd3a');

//easy push
module.exports = {
    pushConsignee: function (tag, message, cb) {
        consigneeClient.push().setPlatform('ios', 'android')
            .setAudience(JPush.tag(tag))
            .setNotification('Hi, JPush', JPush.ios(message), JPush.android(message, null, 1))
            .setOptions(null, 60, null, true, null)
            .send(function (err, res) {
                if (err) {
                    if (err instanceof JPush.APIConnectionError) {
                        console.log(err.message);
                        console.log(err.isResponseTimeout);
                    } else if (err instanceof JPush.APIRequestError) {
                        console.log(err.message);
                    }
                    if (cb)
                        cb(err);
                } else {
                    console.log('Sendno: ' + res.sendno);
                    console.log('Msg_id: ' + res.msg_id);
                    if (cb) {
                        cb(null);
                    }
                }
            });
    },
    pushConsignor: function (tag, message, cb) {
        consignorClient.push().setPlatform('ios', 'android')
            .setAudience(JPush.tag(tag))
            .setNotification('Hi, JPush', JPush.ios(message), JPush.android(message, null, 1))
            .setOptions(null, 60, null, true, null)
            .send(function (err, res) {
                if (err) {
                    if (err instanceof JPush.APIConnectionError) {
                        console.log(err.message);
                        console.log(err.isResponseTimeout);
                    } else if (err instanceof JPush.APIRequestError) {
                        console.log(err.message);
                    }
                    if (cb)
                        cb(err);
                } else {
                    console.log('Sendno: ' + res.sendno);
                    console.log('Msg_id: ' + res.msg_id);
                    if (cb)
                        cb(null);
                }
            });
    },
    pushTag: function (tag, message, cb) {
        if (tag === 'consignee') {
            consigneeClient.push().setPlatform('ios', 'android')
                .setAudience(JPush.tag(tag))
                .setNotification('Hi, JPush', JPush.ios(message), JPush.android(message, null, 1))
                .setOptions(null, 60, null, true, null)
                .send(function (err, res) {
                    if (err) {
                        if (err instanceof JPush.APIConnectionError) {
                            console.log(err.message);
                            console.log(err.isResponseTimeout);
                        } else if (err instanceof JPush.APIRequestError) {
                            console.log(err.message);
                        }
                        if (cb)
                            cb(err);
                    } else {
                        console.log('Sendno: ' + res.sendno);
                        console.log('Msg_id: ' + res.msg_id);
                        if (cb)
                            cb(null);
                    }
                });
        } else {
            consignorClient.push().setPlatform('ios', 'android')
                .setAudience(JPush.tag(tag))
                .setNotification('Hi, JPush', JPush.ios(message), JPush.android(message, null, 1))
                .setOptions(null, 60, null, true, null)
                .send(function (err, res) {
                    if (err) {
                        if (err instanceof JPush.APIConnectionError) {
                            console.log(err.message);
                            console.log(err.isResponseTimeout);
                        } else if (err instanceof JPush.APIRequestError) {
                            console.log(err.message);
                        }
                        if (cb)
                            cb(err);
                    } else {
                        console.log('Sendno: ' + res.sendno);
                        console.log('Msg_id: ' + res.msg_id);
                        if (cb)
                            cb(null);
                    }
                });
        }
    }
}
