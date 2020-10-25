'use strict';
const assert = require('assert');
const ref = require('../');

describe('isNull', function() {
  it('should return "true" for the NULL pointer', function() {
    assert.strictEqual(true, ref.isNull(ref.NULL));
  });

  it('should return "false" for a valid Buffer', function() {
    const buf = Buffer.from('hello');
    assert.strictEqual(false, ref.isNull(buf));
  });
});
