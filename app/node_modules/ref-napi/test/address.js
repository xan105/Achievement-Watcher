'use strict';
const assert = require('assert');
const ref = require('../');
const inspect = require('util').inspect;

describe('address', function() {
  const buf = Buffer.from('hello');

  it('should return 0 for the NULL pointer', function() {
    assert.strictEqual(0, ref.address(ref.NULL));
  });

  it('should give a positive value for any other Buffer', function() {
    const address = ref.address(buf);
    assert.strictEqual(typeof address, 'number');
    assert(isFinite(address));
    assert(address > 0);
  });

  it('should accept an offset value for the 2nd argument', function() {
    const address = ref.address(buf);
    assert.strictEqual(address + 0, ref.address(buf, 0));
    assert.strictEqual(address + 1, ref.address(buf, 1));
    assert.strictEqual(address + 2, ref.address(buf, 2));
    assert.strictEqual(address + 3, ref.address(buf, 3));
    assert.strictEqual(address + 4, ref.address(buf, 4));
    assert.strictEqual(address + 5, ref.address(buf, 5));
  })

  it('should accept a negative offset value for the 2nd argument', function() {
    const address = ref.address(buf)
    assert.strictEqual(address - 0, ref.address(buf, -0));
    assert.strictEqual(address - 1, ref.address(buf, -1));
    assert.strictEqual(address - 2, ref.address(buf, -2));
    assert.strictEqual(address - 3, ref.address(buf, -3));
    assert.strictEqual(address - 4, ref.address(buf, -4));
    assert.strictEqual(address - 5, ref.address(buf, -5));
  })

  it('should have an offset of zero when none is given', function() {
    assert.strictEqual(ref.address(buf), ref.address(buf, 0));
  });

  describe('inspect()', function() {
    it('should overwrite the default Buffer#inspect() to print the memory address', function() {
      assert(inspect(buf).includes(buf.hexAddress()));
    });
  });
});
