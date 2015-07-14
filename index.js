'use strict';

var path = require('path');
var winston = require('winston');
var fs = require('fs');
var mkdirp = require('mkdirp');
var assign = require('object-assign');

var createLogger = function (options) {
  var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.DailyRotateFile)(options)
    ]
  });
  return logger;
};

var alias = function(level){
  switch(level){
    case 'access': 
      return 'info';
      break;
    default:
      return level;   
  }
}

module.exports = function (options) {
  options = options || {};
  var defaultOptions = {
    app: 'app',
    levels: ['error', 'access', 'debug'],
    winston: {
      datePattern: '-yyyy-MM-dd.log'
    }
  }
  options = assign(defaultOptions, options)
  var dirname = path.dirname(process.mainModule.filename);
  var logsPath = path.join(dirname, 'logs', options.app);
  if (!fs.existsSync(logsPath)) {
    mkdirp.sync(logsPath);
  }
  var loggers = {};
  options.levels.map(function(level){
    var winstonOptions = assign(options.winston, {
      filename: path.join(logsPath, level)
    });
    loggers[level] = createLogger(winstonOptions)[alias(level)];
  });
  return loggers;
};