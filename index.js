'use strict'

const path = require('path')
const winston = require('winston')
const fs = require('fs')
const mkdirp = require('mkdirp')

const isLocal = process.env.NODE_ENV === 'local'
let colors
if (isLocal) {
  colors = require('colors')
}

let createLogger = options => new (winston.Logger)({
  transports: [
    new (winston.transports.DailyRotateFile)(options)
  ]
})

let alias = level => {
  switch (level) {
    case 'access':
      return 'info'
    default:
      return level
  }
}

let defaultOptions = {
  app: 'app',
  levels: ['error', 'access', 'debug'],
  winston: {
    datePattern: '-yyyy-MM-dd.log'
  },
  root: path.dirname(process.mainModule.filename)
}

module.exports = (options = {}) => {
  options = {
    ...defaultOptions,
    ...options
  }
  let logsPath = path.join(options.root, 'logs', options.app)
  if (!fs.existsSync(logsPath)) {
    mkdirp.sync(logsPath)
  }
  let loggers = {}
  options.levels.forEach(level => {
    let winstonOptions = {
      ...options.winston,
      filename: path.join(logsPath, level)
    }
    loggers[level] = createLogger(winstonOptions)[alias(level)]
  })

  return loggerWrap(loggers)
}

/**
 * 添加log格式化的处理
 * @param  {object} logger 这个参数被废弃了 之前是传递进来logger对象
 * @return {object}        返回error和access两个方法
 */
function loggerWrap (logger) {
  return {
    error (self, err, cusInfo) {
      let req = self.request
      let info = {
        err_msg: err.message,
        err_name: err.name,
        err_stack: err.stack,
        url: req.url,
        href: req.href,
        header: req.header,
        ip: req.ip,
        ips: req.ips
      }
      !isEmptyObject(cusInfo) && Object.assign(info, cusInfo)
      isLocal && console.error(colors.red(JSON.stringify(info, null, 2)))
      logger.error(info)
    },
    access (self, cusInfo) {
      let req = self.request
      let info = {
        url: req.url,
        href: req.href,
        header: req.header,
        ip: req.ip,
        ips: req.ips
      }
      !isEmptyObject(cusInfo) && Object.assign(info, cusInfo)
      isLocal && console.log(colors.green(JSON.stringify(info, null, 2)))
      logger.access(info)
    },
    warn (self, cusInfo) {
      let req = self.request
      let info = {
        url: req.url,
        href: req.href,
        header: req.header,
        ip: req.ip,
        ips: req.ips
      }
      !isEmptyObject(cusInfo) && Object.assign(info, cusInfo)
      isLocal && console.log(colors.yellow(JSON.stringify(info, null, 2)))
      logger.access(info)
    }
  }
}

/**
 * 判断传入参数是否为空object
 * @param  {object}  obj 目标对象
 * @return {boolean}     true：为空对象
 */
function isEmptyObject (obj) {
  return !obj || Object.keys(obj).length === 0
}
