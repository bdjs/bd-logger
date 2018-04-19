const Logger = require('../')

const fakeHttpData = {
  request: {
    url: 'test url',
    href: 'test href',
    header: {
      'Accept': 'application/json',
      'Content-Type': 'applicaiton/json'
    },
    ip: '10.10.10.10',
    ips: [1, 2, 3]
  }
}

const fakeError = new Error('test error')

let logger1 = Logger({
  app: 'test1'
})

let count1 = 100

while (count1--) {
  logger1.access(fakeHttpData, {
    cusMsg: 'custom access message'
  })

  logger1.warn(fakeHttpData, {
    cusMsg: 'custom warn message'
  })

  logger1.error(fakeHttpData, fakeError, {
    cusMsg: 'custom error message'
  })
}

let logger2 = Logger({
  app: 'test2'
})

let count2 = 100

while (count2--) {
  logger2.access(fakeHttpData, {
    cusMsg: 'custom access message'
  })

  logger2.warn(fakeHttpData, {
    cusMsg: 'custom warn message'
  })

  logger2.error(fakeHttpData, fakeError, {
    cusMsg: 'custom error message'
  })
}
