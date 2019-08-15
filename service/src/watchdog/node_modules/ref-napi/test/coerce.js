'use strict';
const assert = require('assert');
const ref = require('../');

describe('coerce', function() {
  it('should return `ref.types.void` for "void"', function() {
    const type = ref.coerceType('void');
    assert.strictEqual(ref.types.void, type);
  });

  it('should return a ref type when a "*" is present', function() {
    const type = ref.coerceType('void *');
    assert.notStrictEqual(type, ref.types.void);
    assert.strictEqual(type.indirection, ref.types.void.indirection + 1);
  });

  it('should coerce the "type" property of a Buffer', function() {
    const buf = Buffer.alloc(ref.sizeof.int);
    buf.type = 'int';
    const type = ref.getType(buf);
    assert.strictEqual(ref.types.int, type);
    assert.strictEqual('int', buf.type);
  });

  it('should coerce "Object" to `ref.types.Object`', function() {
    assert.strictEqual(ref.types.Object, ref.coerceType('Object'));
  });

  it('should coerce the optional type in `ref.get()`', function() {
    const b = Buffer.alloc(ref.sizeof.int8);
    b[0] = 5;
    assert.strictEqual(5, ref.get(b, 0, 'int8'));
  });

  it('should coerce the optional type in `ref.set()`', function() {
    const b = Buffer.alloc(ref.sizeof.int8);
    ref.set(b, 0, 5, 'int8');
    assert.strictEqual(5, b[0]);
  });

  it('should throw a TypeError if a "type" can not be inferred', function() {
    assert.throws(() => {
      ref.coerceType({ });
    }, /could not determine a proper \"type\"/);
  });
});
