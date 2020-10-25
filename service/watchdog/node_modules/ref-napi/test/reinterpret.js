'use strict';
const assert = require('assert');
const ref = require('../');
let weak; try { weak = require('weak-napi'); } catch (e) {}

describe('reinterpret()', function() {
  beforeEach(gc);

  it('should return a new Buffer instance at the same address', function() {
    const buf = Buffer.from('hello world');
    const small = buf.slice(0, 0);
    assert.strictEqual(0, small.length);
    assert.strictEqual(buf.address(), small.address());
    const reinterpreted = small.reinterpret(buf.length);
    assert.strictEqual(buf.address(), reinterpreted.address());
    assert.strictEqual(buf.length, reinterpreted.length);
    assert.strictEqual(buf.toString(), reinterpreted.toString());
  })

  it('should return a new Buffer instance starting at the offset address', function() {
    const buf = Buffer.from('hello world');
    const offset = 3;
    const small = buf.slice(offset, buf.length);
    assert.strictEqual(buf.length - offset, small.length);
    assert.strictEqual(buf.address() + offset, small.address());
    const reinterpreted = buf.reinterpret(small.length, offset);
    assert.strictEqual(small.address(), reinterpreted.address());
    assert.strictEqual(small.length, reinterpreted.length);
    assert.strictEqual(small.toString(), reinterpreted.toString());
  })

  it('should retain a reference to the original Buffer when reinterpreted', function() {
    if (weak === undefined)
      return this.skip('weak not avaialbe');
    let origGCd = false;
    let otherGCd = false;
    let buf = Buffer.alloc(1);
    weak(buf, () => { origGCd = true; });
    let other = buf.reinterpret(0);
    weak(other, () => { otherGCd = true; });

    assert(!origGCd, '"buf" has been garbage collected too soon');
    assert(!otherGCd, '"other" has been garbage collected too soon');

    // try to GC `buf`
    buf = null;
    gc();
    assert(!origGCd, '"buf" has been garbage collected too soon');
    assert(!otherGCd, '"other" has been garbage collected too soon');

    // now GC `other`
    other = null;
    gc();
    setImmediate(() => {
      assert(otherGCd, '"other" has not been garbage collected');
      assert(origGCd, '"buf" has not been garbage collected');
    });
  });
});
