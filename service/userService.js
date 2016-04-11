/*jslint node: true */
'use strict';
var pool = require('../utils/pool');
var squel = require('squel');

var service = {
    findOne: function (id) {
        return pool.query('select * from usr where id=?', [id]);
    },
    findByName: function (name) {
        return pool.query('select * from usr where name=?', [name]);
    },
    findByNameAndActivate: function (name, activate) {
        return pool.query('select * from usr where name=? and activate=?', [name, activate]);
    },
    findByNameAndAuthority: function (name, authority) {
        return pool.query('select * from usr where name=? and authority=?', [name, authority]);
    },
    findAll: function (page) {
        return pool.query('select * from usr limit ?,?', [page.page, page.size]);
    },
    _buildOptionSql: function (option, pageable, ceOrCr, count) {
        var sql, page = pageable.page,
            size = pageable.size;
        if (count) {
            sql = squel.select().field('count(*)', 'countNum').from('usr');
        } else {
            sql = squel.select()
                .field('usr.id', 'id')
                .field('usr.name', 'name')
                .field('usr.activate', 'activate')
                .field('usr_detail.detail_name', 'detail_name')
                .field('usr_detail.gender', 'gender')
                .field('usr_detail.identified_number', 'identified_numberdi')
                .field('usr_detail.company_name1', 'companyName1')
                .field('usr_detail.company_name2', 'companyName2')
                .field('usr_detail.company_name3', 'companyName3')
                .field('usr_detail.created_time', 'created_time')
                .from('usr');
            sql.offset(page * size).limit(size);
        }
        sql.left_join('usr_detail', null, 'usr.id=usr_detail.id');
        if (ceOrCr) {
            sql.field('vehicle.license', 'license')
                .field('vehicle.vehicle_type', 'type')
                .field('vehicle.vehicle_length', 'length')
                .field('vehicle.vehicle_weight', 'weight');
            sql.left_join('vehicle', null, 'vehicle.usr_id=usr.id')
        }
        pool.buildSql(sql, option);
        return pool.query(sql.toString(), []);
    },
    findByOption: function (option, page, ceOrCr) {
        return this._buildOptionSql(option, page, ceOrCr, false);
    },
    countByOption: function (option, page, ceOrCr) {
        return this._buildOptionSql(option, page, ceOrCr, true);
    },
    countByMobile: function (mobile) {
        return pool.query('select count(*) as usrCount from usr where name=?', [mobile]);
    },
    countByIdAndAuthority: function (id, authority) {
        return pool.query('select count(*) as countNum from usr where id=? and authority=?', [id, authority]);
    },
    save: function (usr) {
        usr.activate = 1;
        var sql = 'insert into usr set ?';
        return pool.insert(sql, usr);
    },
    updatePwd: function (usr) {
        var sql = 'update usr set password=? where id=?';
        return pool.query(sql, [usr.password, usr.id]);
    },
    updatePwdByName: function (usr) {
        var sql = 'update usr set password=? where name=?';
        return pool.query(sql, [usr.password, usr.name]);
    },
    updateState: function (userId, state) {
        var sql = 'update usr set activate=? where id=?';
        return pool.query(sql, [state, userId]);
    },
    aggregate: function () {
        var date = new Date();
        var today = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        var countUsr = "select count(*) as countNum from usr where authority!='ROLE_ADMIN' and authority!='ROLE_COMMON'";
        var countConsignee = "select count(*) as countNum from usr where authority='ROLE_CONSIGNEE'";
        var countConsignor = "select count(*) as countNum from usr where authority='ROLE_CONSIGNOR'";
        var countUsrToday = "select count(*) as countNum from usr join usr_detail where Date(created_time)='" + today + "'";
        var countUsrMonth = "select count(*) as countNum from usr join usr_detail on usr.id=usr_detail.id where Date(created_time) BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) AND NOW() and authority!='ROLE_ADMIN'";
        var countUsrWeek = "select count(*) as countNum from usr join usr_detail on usr.id=usr_detail.id where Date(created_time) BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW() and authority!='ROLE_ADMIN'";
        var array = [countUsr, countConsignee, countConsignor, countUsrToday, countUsrMonth, countUsrWeek];
        return pool.query(array.join(';'), []);
    }
};

module.exports = service;
