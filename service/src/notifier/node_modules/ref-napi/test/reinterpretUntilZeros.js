'use strict';
const fs = require('fs');
const assert = require('assert');
const ref = require('../');

describe('reinterpretUntilZeros()', function() {
  beforeEach(gc);

  it('should return a new Buffer instance up until the first 0', function() {
    const buf = Buffer.from('hello\0world');
    const buf2 = buf.reinterpretUntilZeros(1);
    assert.strictEqual(buf2.length, 'hello'.length);
    assert.strictEqual(buf2.toString(), 'hello');
  })

  it('should return a new Buffer instance up until the first 0 starting from offset', function() {
    const buf = Buffer.from('hello\0world');
    const buf2 = buf.reinterpretUntilZeros(1, 3);
    assert.strictEqual(buf2.length, 'lo'.length);
    assert.strictEqual(buf2.toString(), 'lo');
  })

  it('should return a new Buffer instance up until the first 2-byte sequence of 0s', function() {
    const str = 'hello world';
    const buf = Buffer.alloc(50);
    const len = buf.write(str, 'ucs2');
    buf.writeInt16LE(0, len); // NULL terminate the string

    const buf2 = buf.reinterpretUntilZeros(2);
    assert.strictEqual(str.length, buf2.length / 2);
    assert.strictEqual(buf2.toString('ucs2'), str);
  })

  it('should return a large Buffer instance > 10,000 bytes with UTF16-LE char bytes', function() {
    const data = fs.readFileSync(__dirname + '/utf16le.bin');
    const strBuf = ref.reinterpretUntilZeros(data, 2);
    assert(strBuf.length > 10000);
    const str = strBuf.toString('ucs2');
    // the data in `utf16le.bin` should be a JSON parsable string
    assert(JSON.parse(str));
  });
});
