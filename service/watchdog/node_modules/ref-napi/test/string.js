'use strict';
const assert = require('assert');
const ref = require('../');

describe('C string', function() {
  describe('readCString()', function() {
    it('should return "" for a Buffer containing "\\0"', function() {
      const buf = Buffer.from('\0');
      assert.strictEqual('', buf.readCString(0));
    });

    it('should return "hello" for a Buffer containing "hello\\0world"', function() {
      const buf = Buffer.from('hello\0world');
      assert.strictEqual('hello', buf.readCString(0));
    });

    it('should throw an Error when reading from the NULL pointer', function() {
      assert.throws(() => {
        ref.NULL.readCString();
      });
    });
  });

  describe('writeCString()', function() {
    it('should write a C string (NULL terminated) to a Buffer', function() {
      const buf = Buffer.alloc(20);
      const str = 'hello world';
      buf.writeCString(str);
      for (let i = 0; i < str.length; i++) {
        assert.strictEqual(str.charCodeAt(i), buf[i]);
      }
      assert.strictEqual(0, buf[str.length]);
    });

    it('should not write the terminating 0 out of bounds', function() {
      const wholebuf = Buffer.alloc(20, 127);
      const buf = wholebuf.subarray(0, 10);
      const str = 'hello world';
      buf.writeCString(str);
      for (let i = 0; i < buf.length - 1; i++) {
        assert.strictEqual(str.charCodeAt(i), buf[i]);
      }
      assert.strictEqual(0, buf[buf.length - 1]);
      for (let i = buf.length; i < wholebuf.length; i++) {
        assert.strictEqual(127, wholebuf[i]);
      }
    });
  });

  describe('allocCString()', function() {
    it('should return a new Buffer containing the given string', function() {
      const buf = ref.allocCString('hello world');
      assert.strictEqual('hello world', buf.readCString());
    });

    it('should return the NULL pointer for `null` values', function() {
      const buf = ref.allocCString(null);
      assert(buf.isNull());
      assert.strictEqual(0, buf.address());
    });

    it('should return the NULL pointer for `undefined` values', function() {
      const buf = ref.allocCString(undefined);
      assert(buf.isNull());
      assert.strictEqual(0, buf.address());
    });

    it('should return the NULL pointer for a NULL pointer Buffer', function() {
      const buf = ref.allocCString(ref.NULL);
      assert(buf.isNull());
      assert.strictEqual(0, buf.address());
    })
  });

  describe('CString', function() {
    it('should return JS `null` when given a pointer pointing to NULL', function() {
      const buf = ref.alloc(ref.types.CString);
      buf.writePointer(ref.NULL);
      assert.strictEqual(null, buf.deref());

      // another version of the same test
      assert.strictEqual(null, ref.get(ref.NULL_POINTER, 0, ref.types.CString));
    });

    it('should read a utf8 string from a Buffer', function() {
      const str = 'hello world';
      const buf = ref.alloc(ref.types.CString);
      buf.writePointer(Buffer.from(str + '\0'));
      assert.strictEqual(str, buf.deref());
    });

    // https://github.com/node-ffi/node-ffi/issues/169
    it('should set a Buffer as backing store', function() {
      const str = 'hey!';
      const store = Buffer.from(str + '\0');
      const buf = ref.alloc(ref.types.CString);
      ref.set(buf, 0, store);

      assert.strictEqual(str, ref.get(buf, 0));
    });
  });
});
