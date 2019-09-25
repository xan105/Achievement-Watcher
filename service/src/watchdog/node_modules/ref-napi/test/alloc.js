'use strict';
const assert = require('assert');
const ref = require('../');

describe('alloc()', function() {
  it('should return a new Buffer of "bool" size', function() {
    const buf = ref.alloc(ref.types.bool);
    assert.strictEqual(ref.sizeof.bool, buf.length);
  });

  it('should coerce string type names', function() {
    const buf = ref.alloc('bool');
    assert.strictEqual(ref.types.bool, buf.type);
  });
});
