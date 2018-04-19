'use strict'

const path = require('path')
const winston = require('winston')
const fs = require('fs')
const mkdirp = require('mkdirp')

const DailyRotateFile = require('winston-daily-rotate-file')

const isLocal = process.env.NODE_ENV === 'local'

const levels = ['access', 'error', 'warn']

let createLogger = options => winston.createLogger(options)

let defaultOptions = {
  app: 'app',
  dailyRotateFile: {
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d'
  },
  root: path.dirname(process.mainModule.filename),
  format: winston.format.json()
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
  levels.forEach(level => {
    let winstonOptions = {
      ...options,
      transports: [
        new DailyRotateFile({
          filename: path.join(logsPath, `${level}-%DATE%.log`),
          ...options.dailyRotateFile
        })
      ]
    }

    let logger = loggers[level] = createLogger(winstonOptions)

    // console.log(logger)

    if (isLocal) {
      logger.add(new winston.transports.Console({
        format: winston.format.simple()
      }))
    }
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
      logger.error.log('error', info)
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
      logger.access.log('info', info)
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
      logger.warn.log('warn', info)
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
