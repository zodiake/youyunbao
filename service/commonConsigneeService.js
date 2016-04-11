/**
 * Created by yagamai on 15-7-14.
 */
'use strict';
var pool = require('../utils/pool');

var service = {
    save: function (consigneeId, user) {
        var common = {
            consignee_id: consigneeId,
            consignor_id: user.id
        };
        return pool.query('insert into common_consignee set ?', common);
    },
    countByConsignorAndConsignee: function (consignor, consignee) {
        var sql = 'select count(*) as countNum from common_consignee where consignee_id=? and consignor_id=?';
        return pool.query(sql, [consignee, consignor]);
    },
    findByConsignor: function (user) {
        var sql = 'SELECT usr.id as id,usr.name AS mobile, usr_detail.detail_name,usr_detail.portrait, vehicle.license, usr_detail.praise FROM common_consignee LEFT JOIN usr ON common_consignee.consignee_id = usr.id LEFT JOIN vehicle ON vehicle.usr_id = usr.id LEFT JOIN usr_detail ON usr_detail.id = usr.id where common_consignee.consignor_id=?';
        return pool.query(sql, [user.id]);
    },
    search: function (id) {
        var sql = "SELECT usr.id as id,usr.name AS mobile, usr_detail.detail_name, vehicle.license, usr_detail.praise,usr_detail.portrait FROM usr LEFT JOIN vehicle ON vehicle.usr_id = usr.id LEFT JOIN usr_detail ON usr_detail.id = usr.id WHERE usr.authority = 'ROLE_CONSIGNEE' and usr.name=?";
        return pool.query(sql, [id]);
    },
    delete: function (consignorId, consigneeId) {
        var sql = 'delete from common_consignee where consignor_id=? and consignee_id=?';
        return pool.query(sql, [consignorId, consigneeId]);
    }
};

module.exports = service;
