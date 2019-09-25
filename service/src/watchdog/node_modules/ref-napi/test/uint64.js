'use strict';
const assert = require('assert');
const ref = require('../');

describe('uint64', function() {
  const JS_MAX_INT = +Number.MAX_SAFE_INTEGER;
  const JS_MIN_INT = -Number.MIN_SAFE_INTEGER;

  it('should allow simple ints to be written and read', function() {
    const buf = Buffer.alloc(ref.sizeof.uint64);
    const val = 123456789;
    ref.writeUInt64(buf, 0, val);
    const rtn = ref.readUInt64(buf, 0);
    assert.strictEqual(val, rtn);
  });

  it('should allow UINT64_MAX to be written and read', function() {
    const buf = Buffer.alloc(ref.sizeof.uint64);
    const val = '18446744073709551615';
    ref.writeUInt64(buf, 0, val);
    const rtn = ref.readUInt64(buf, 0);
    assert.strictEqual(val, rtn);
  });

  it('should allow a hex String to be input (signed)', function() {
    const buf = Buffer.alloc(ref.sizeof.uint64);
    const val = '-0x1234567890';
    const val_as_uint64 = '18446743995522058096';
    ref.writeUInt64(buf, 0, val);
    const rtn = ref.readUInt64(buf, 0);
    assert.strictEqual(val_as_uint64, rtn);
  });

  it('should allow an octal String to be input (signed)', function() {
    const buf = Buffer.alloc(ref.sizeof.uint64);
    const val = '-0777';
    const val_as_uint64 = '18446744073709551105';
    ref.writeUInt64(buf, 0, val);
    const rtn = ref.readUInt64(buf, 0);
    assert.strictEqual(val_as_uint64, rtn);
  });

  it('should allow a hex String to be input (unsigned)', function() {
    const buf = Buffer.alloc(ref.sizeof.uint64);
    const val = '0x1234567890';
    ref.writeUInt64(buf, 0, val);
    const rtn = ref.readUInt64(buf, 0);
    assert.strictEqual(parseInt(val, 16), rtn);
  });

  it('should allow an octal String to be input (unsigned)', function() {
    const buf = Buffer.alloc(ref.sizeof.uint64);
    const val = '0777';
    ref.writeUInt64(buf, 0, val);
    const rtn = ref.readUInt64(buf, 0);
    assert.strictEqual(parseInt(val, 8), rtn);
  });

  it('should return a Number when reading JS_MIN_INT', function() {
    const buf = Buffer.alloc(ref.sizeof.uint64);
    ref.writeUInt64(buf, 0, JS_MIN_INT);
    const rtn = ref.readUInt64(buf, 0);
    assert.strictEqual('number', typeof rtn);
    assert.strictEqual(JS_MIN_INT, rtn);
  });

  it('should return a Number when reading JS_MAX_INT', function() {
    const buf = Buffer.alloc(ref.sizeof.uint64);
    ref.writeUInt64(buf, 0, JS_MAX_INT);
    const rtn = ref.readUInt64(buf, 0);
    assert.strictEqual('number', typeof rtn);
    assert.strictEqual(JS_MAX_INT, rtn);
  });

  it('should return a String when reading JS_MAX_INT+1', function() {
    const buf = Buffer.alloc(ref.sizeof.uint64);
    const plus_one = '9007199254740993';
    ref.writeUInt64(buf, 0, plus_one);
    const rtn = ref.readUInt64(buf, 0);
    assert.strictEqual('string', typeof rtn);
    assert.strictEqual(plus_one, rtn);
  });

  it('should return a String when reading JS_MIN_INT-1', function() {
    const buf = Buffer.alloc(ref.sizeof.uint64);
    const minus_one = '-9007199254740993';
    // uint64_t interpretation of JS_MIN_INT
    const minus_one_uint64 = '18437736874454810623';
    ref.writeUInt64(buf, 0, minus_one);
    const rtn = ref.readUInt64(buf, 0);
    assert.strictEqual('string', typeof rtn);
    assert.strictEqual(minus_one_uint64, rtn);
  });

  it('should return a Number when reading 0, even when written as a String', function() {
    const buf = Buffer.alloc(ref.sizeof.uint64);
    const zero = '0';
    ref.writeUInt64(buf, 0, zero);
    const rtn = ref.readUInt64(buf, 0);
    assert.strictEqual('number', typeof rtn);
    assert.strictEqual(0, rtn);
  });

  it('should throw a "no digits" Error when writing an invalid String (unsigned)', function() {
    assert.throws(() => {
      const buf = Buffer.alloc(ref.sizeof.uint64);
      ref.writeUInt64(buf, 0, 'foo');
    }, /no digits we found in input String/);
  });

  it('should throw an "out of range" Error when writing an invalid String (signed)', function() {
    let e;
    try {
      const buf = Buffer.alloc(ref.sizeof.uint64)
      ref.writeUInt64(buf, 0, '-10000000000000000000000000')
    } catch (_e) {
      e = _e;
    }
    assert(/input String numerical value out of range/.test(e.message));
  });

  it('should throw an "out of range" Error when writing an invalid String (unsigned)', function() {
    let e;
    try {
      const buf = Buffer.alloc(ref.sizeof.uint64);
      ref.writeUInt64(buf, 0, '10000000000000000000000000');
    } catch (_e) {
      e = _e;
    }
    assert(/input String numerical value out of range/.test(e.message));
  });

  it('should throw an Error when reading an uint64_t from the NULL pointer', function() {
    assert.throws(() => {
      ref.readUInt64(ref.NULL);
    });
  });

});
