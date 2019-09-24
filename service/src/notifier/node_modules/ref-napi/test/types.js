'use strict';
const assert = require('assert');
const ref = require('../');

describe('types', function() {
  describe('refType()', function() {
    it('should return a new "type" with its `indirection` level increased by 1', function() {
      const int = ref.types.int;
      const intPtr = ref.refType(int);
      assert.strictEqual(int.size, intPtr.size);
      assert.strictEqual(int.indirection + 1, intPtr.indirection);
    });

    it('should coerce string types', function() {
      const intPtr = ref.refType('int');
      assert.strictEqual(2, intPtr.indirection);
      assert.strictEqual(intPtr.size, ref.types.int.size);
    });

    it('should override and update a read-only name property', function() {
      // a type similar to ref-struct's StructType
      // used for types refType name property test
      function StructType() {}
      StructType.size = 0;
      StructType.indirection = 0;

      // read-only name property
      assert.strictEqual(StructType.name, 'StructType')
      try {
        StructType.name = 'foo';
      } catch (err) {
        // ignore
      }
      assert.strictEqual(StructType.name, 'StructType');

      // name property should be writable and updated
      const newObj = ref.refType(StructType);
      const newProp = Object.getOwnPropertyDescriptor(newObj, 'name');
      assert.strictEqual(newProp.writable, true);
      assert.strictEqual(newObj.name, 'StructType*');
    });
  });

  describe('derefType()', function() {
    it('should return a new "type" with its `indirection` level decreased by 1', function() {
      const intPtr = Object.create(ref.types.int);
      intPtr.indirection++;
      const int = ref.derefType(intPtr);
      assert.strictEqual(intPtr.size, intPtr.size);
      assert.strictEqual(intPtr.indirection - 1, int.indirection);
    });

    it('should throw an Error when given a "type" with its `indirection` level already at 1', function() {
      assert.throws(() => {
        ref.derefType(ref.types.int);
      });
    });
  });

  describe('size', function() {
    Object.keys(ref.types).forEach((name) => {
      if (name === 'void') return;
      it('sizeof(' + name + ') should be >= 1', function() {
        const type = ref.types[name];
        assert.strictEqual('number', typeof type.size);
        assert(type.size >= 1);
      });
    });
  });

  describe('alignment', function() {
    Object.keys(ref.types).forEach(function (name) {
      if (name === 'void') return;
      it('alignof(' + name + ') should be >= 1', function() {
        const type = ref.types[name];
        assert.strictEqual('number', typeof type.alignment);
        assert(type.alignment >= 1);
      });
    });
  });
});
