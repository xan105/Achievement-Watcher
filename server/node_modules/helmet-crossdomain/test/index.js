const crossdomain = require('..')

const assert = require('assert')
const connect = require('connect')
const request = require('supertest')

describe('crossdomain', function () {
  function app (middleware) {
    const result = connect()
    result.use(middleware)
    result.use((req, res) => { res.end('Hello world') })
    return result
  }

  it('sets X-Permitted-Cross-Domain-Policies: none when called with no arguments', () => {
    return request(app(crossdomain()))
      .get('/')
      .expect('X-Permitted-Cross-Domain-Policies', 'none')
      .expect('Hello world')
  })

  it('sets X-Permitted-Cross-Domain-Policies: none when called with an empty object', () => {
    return request(app(crossdomain({})))
      .get('/')
      .expect('X-Permitted-Cross-Domain-Policies', 'none')
      .expect('Hello world')
  })

  it('can explicitly set the policy to "none"', () => {
    return request(app(crossdomain({ permittedPolicies: 'none' })))
      .get('/')
      .expect('X-Permitted-Cross-Domain-Policies', 'none')
      .expect('Hello world')
  })

  it('can set the policy to "master-only"', () => {
    return request(app(crossdomain({ permittedPolicies: 'master-only' })))
      .get('/')
      .expect('X-Permitted-Cross-Domain-Policies', 'master-only')
      .expect('Hello world')
  })

  it('can set the policy to "by-content-type"', () => {
    return request(app(crossdomain({ permittedPolicies: 'by-content-type' })))
      .get('/')
      .expect('X-Permitted-Cross-Domain-Policies', 'by-content-type')
      .expect('Hello world')
  })

  it('can set the policy to "all"', () => {
    return request(app(crossdomain({ permittedPolicies: 'all' })))
      .get('/')
      .expect('X-Permitted-Cross-Domain-Policies', 'all')
      .expect('Hello world')
  })

  it('cannot set the policy to "by-ftp-filename"', () => {
    assert.throws(() => { crossdomain({ permittedPolicies: 'by-ftp-filename' }) })
  })

  it('cannot set the policy to invalid values', function () {
    assert.throws(() => { crossdomain({ permittedPolicies: '' }) })
    assert.throws(() => { crossdomain({ permittedPolicies: null }) })
    assert.throws(() => { crossdomain({ permittedPolicies: 'NONE' }) })
  })

  it('names its function and middleware', function () {
    assert.equal(crossdomain.name, 'crossdomain')
    assert.equal(crossdomain().name, 'crossdomain')
  })
})
