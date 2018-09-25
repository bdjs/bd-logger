const path = require('path')
const winston = require('winston')
const fs = require('fs')
const mkdirp = require('mkdirp')

const DailyRotateFile = require('winston-daily-rotate-file')

const isLocal = process.env.NODE_ENV === 'local'

const levels = ['access', 'error', 'warn']

const createLogger = options => winston.createLogger(options)

const defaultOptions = {
  app: 'app',
  dailyRotateFile: {
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
  },
  root: path.dirname(process.mainModule.filename),
  format: winston.format.json(),
}

module.exports = (options = {}) => {
  options = {
    ...defaultOptions,
    ...options,
  }
  const logsPath = path.join(options.root, 'logs', options.app)
  if (!fs.existsSync(logsPath)) {
    mkdirp.sync(logsPath)
  }
  const loggers = {}
  levels.forEach(level => {
    const winstonOptions = {
      ...options,
      transports: [
        new DailyRotateFile({
          filename: path.join(logsPath, `${level}-%DATE%.log`),
          ...options.dailyRotateFile,
        }),
      ],
    }

    const logger = createLogger(winstonOptions)
    loggers[level] = logger

    // console.log(logger)

    if (isLocal) {
      logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.simple()
        ),
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
      const req = self.request
      const info = {
        err_msg: err.message,
        err_name: err.name,
        err_stack: err.stack,
        url: req.url,
        href: req.href,
        header: req.header,
        ip: req.ip,
        ips: req.ips,
        timestamp: timestamp(),
      }
      if (!isEmptyObject(cusInfo)) {
        Object.assign(info, cusInfo)
      }
      logger.error.error(info)
    },
    access (self, cusInfo) {
      const req = self.request
      const info = {
        url: req.url,
        href: req.href,
        header: req.header,
        ip: req.ip,
        ips: req.ips,
        timestamp: timestamp(),
      }
      if (!isEmptyObject(cusInfo)) {
        Object.assign(info, cusInfo)
      }
      logger.access.info(info)
    },
    warn (self, cusInfo) {
      const req = self.request
      const info = {
        url: req.url,
        href: req.href,
        header: req.header,
        ip: req.ip,
        ips: req.ips,
        timestamp: timestamp(),
      }
      if (!isEmptyObject(cusInfo)) {
        Object.assign(info, cusInfo)
      }
      logger.warn.warn(info)
    },
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

const padZero = str => String(str).padStart(2, 0)

/**
 * 一个简单的时间戳输出，如果后期需要更多样的输出，建议使用 moment
 * @return {string}      YYYY-MM-DD HH:mm:SS
 */
function timestamp () {
  const date = new Date()

  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`
}