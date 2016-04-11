/*jslint node: true */
'use strict';
var pool = require('../utils/pool');
var squel = require('squel');

var service = {
    findAll: function (pageable) {
        var sql = 'select * from suggestion order by created_time limit ?,?';
        return pool.query(sql, [pageable.page, pageable.size]);
    },
    findByState: function (state, pageable) {
        var sql = 'select * from suggestion where state=? order by created_time limit ?,?';
        if (state == 'all')
            return this.findAll(pageable);
        return pool.query(sql, [state, pageable.page, pageable.size]);
    },
    search: function (option, count) {
        var page = option.page,
            size = option.size,
            sql;
        if (count) {
            sql = squel.select().field('count(*)', 'countNum').from('suggestion');
        } else {
            sql = squel.select().from('suggestion');
            sql.offset(page * size).limit(size);
        }
        if (option.state)
            sql.where(squel.expr().and('state=' + option.state));
        if (option.beginTime)
            sql.where(squel.expr().and("Date(created_time)>='" + option.beginTime + "'"));
        if (option.endTime)
            sql.where(squel.expr().and("Date(created_time)<='" + option.endTime + "'"));
        return pool.query(sql.toString(), []);
    },
    findOne: function (id) {
        var sql = 'select * from suggestion where id=?';
        return pool.query(sql, [id]);
    },
    findOneAndUser: function (id) {
        var sql = 'select suggestion.description,suggestion.mobile,usr_detail.detail_name,suggestion.id,usr_detail.company_name1,usr_detail.company_name2,usr_detail.company_name3,usr_detail.identified_number,usr_detail.gender from suggestion join usr on usr.name=suggestion.mobile join usr_detail on usr_detail.id=usr.id where suggestion.id=?';
        return pool.query(sql, [id]);
    },
    save: function (suggestion) {
        var sql = 'insert into suggestion set ?';
        return pool.insert(sql, suggestion);
    },
    updateState: function (state, id) {
        var sql = 'update suggestion set state=? where id=?';
        return pool.update(sql, [state, id]);
    }
};

module.exports = service;
