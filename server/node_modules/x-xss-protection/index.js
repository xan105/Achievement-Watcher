module.exports = function xXssProtection (options) {
  options = options || {}

  var headerValue = '1; mode=block'
  if (options.reportUri) {
    headerValue += '; report=' + options.reportUri
  }

  if (options.setOnOldIE) {
    return function xXssProtection (req, res, next) {
      res.setHeader('X-XSS-Protection', headerValue)
      next()
    }
  } else {
    return function xXssProtection (req, res, next) {
      var matches = /msie\s*(\d+)/i.exec(req.headers['user-agent'])

      var value
      if (!matches || (parseFloat(matches[1]) >= 9)) {
        value = headerValue
      } else {
        value = '0'
      }

      res.setHeader('X-XSS-Protection', value)
      next()
    }
  }
}
