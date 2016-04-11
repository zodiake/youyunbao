/*jslint node: true */
'use strict';
var pool = require('../utils/pool');
var orderState = require('../orderState');
var q = require('q');
var _ = require('lodash');

var service = {
    findOne: function () {

    },
    findAll: function () {

    },
    findByOrder: function (id) {
        var sql = 'select * from reviews where order_id=?';
        return pool.query(sql, [id]);
    },
    countByOrder: function (id) {
        var sql = 'select count(*) as countNum from reviews where order_id=?';
        return pool.query(sql, [id]);
    },
    save: function (review) {
        var defer = q.defer();
        pool.getConnection()
            .then(function (connection) {
                connection.beginTransaction(function (err) {
                    if (err) {
                        defer.reject(err);
                    }
                    console.log('transaction begin');

                    insertReview();

                    function insertReview() {
                        console.log('insert review');
                        rollback(err);
                        var sql = 'insert into reviews set ?';
                        connection.query(sql, review, insertStates);
                    }

                    function insertStates(err, result) {
                        console.log('insert state');
                        rollback(err);
                        var sql = 'insert into order_state set ?';
                        var state = {
                            order_id: review.order_id,
                            state_name: orderState.appraise,
                            created_time: new Date()
                        };
                        connection.query(sql, state, updateOrderState);
                    }

                    function updateOrderState(err, result) {
                        console.log('update state');
                        rollback(err);
                        var sql = 'update orders set current_state=? where id=?';
                        if (review.level == 1) {
                            connection.query(sql, [orderState.appraise, review.order_id], findOrderById);
                        } else {
                            connection.query(sql, [orderState.appraise, review.order_id], done);
                        }
                    }

                    function findOrderById(err, result) {
                        console.log('find by id');
                        rollback(err);
                        var sql = 'select consignee from orders where id=?';
                        connection.query(sql, [review.order_id], findUserByUserName);
                    }

                    function findUserByUserName(err, result) {
                        console.log('find userId by name');
                        rollback(err);
                        var sql = 'select id from usr where name=?';
                        connection.query(sql, [result[0].consignee], updateUserDetails_Praise);
                    }

                    function updateUserDetails_Praise(err, result) {
                        console.log('update praise');
                        rollback(err);
                        var sql = 'update usr_detail set praise=praise+1 where id=?';
                        connection.query(sql, [result[0].id], done);
                    }

                    function done() {
                        rollback(err);
                        connection.commit(function () {
                            defer.resolve();
                        });
                    }

                    function rollback(err) {
                        if (err) {
                            console.log(err);
                            connection.rollback(function () {
                                defer.reject(err.message);
                            });
                        }
                    }
                });
            });
        return defer.promise;
    }
};

module.exports = service;
