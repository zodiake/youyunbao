/*jslint node: true */
'use strict';
var winston = require('winston');

var logger = new(winston.Logger)({
    exitOnError: false,
    transports: [
        new(winston.transports.DailyRotateFile)({
            filename: 'log/applog.log'
        }),
        new(winston.transports.Console)({
            colorize: true,
        })
    ],
    exceptionHandlers: [
      new winston.transports.DailyRotateFile({
            filename: 'log/exceptions.log'
        })
    ]
});

module.exports = logger;
