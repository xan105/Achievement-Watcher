'use strict';
const assert = require('assert');
const ref = require('../');
let weak; try { weak = require('weak-napi'); } catch (e) {}

describe('Object', function() {
  const obj = {
    foo: 'bar',
    test: Math.random(),
    now: new Date()
  };

  beforeEach(gc);

  it('should write and read back an Object in a Buffer', function() {
    const buf = Buffer.alloc(ref.sizeof.Object);
    ref.writeObject(buf, 0, obj);
    const out = ref.readObject(buf);
    assert.strictEqual(obj, out);
    assert.deepEqual(obj, out);
  })

  it('should retain references to written Objects', function (done) {
    if (weak === undefined)
      return this.skip('weak not avaialbe');
    let o_gc = false;
    let buf_gc = false;
    let o = { foo: 'bar' };
    let buf = Buffer.alloc(ref.sizeof.Object);

    weak(o, () => { o_gc = true });
    weak(buf, () => { buf_gc = true });
    ref.writeObject(buf, 0, o);
    assert(!o_gc, '"o" has been garbage collected too soon');
    assert(!buf_gc, '"buf" has been garbage collected too soon');

    // try to GC `o`
    o = null;
    gc();
    assert(!o_gc, '"o" has been garbage collected too soon');
    assert(!buf_gc, '"buf" has been garbage collected too soon');

    // now GC `buf`
    buf = null;
    gc();
    setImmediate(() => {
      setImmediate(() => {
        assert(buf_gc, '"buf" has not been garbage collected');
        gc();
        setImmediate(() => {
          setImmediate(() => {
            assert(o_gc, '"o" has not been garbage collected');
            done();
          });
        });
      });
    });
  });

  it('should throw an Error when reading an Object from the NULL pointer', function() {
    assert.throws(() => {
      ref.NULL.readObject();
    });
  });

  describe('offset', function() {
    it('should read two Objects next to each other in memory', function() {
      const buf = Buffer.alloc(ref.sizeof.Object * 2);
      const a = {};
      const b = {};
      buf.writeObject(a, 0 * ref.sizeof.Object);
      buf.writeObject(b, 1 * ref.sizeof.Object);
      const _a = buf.readObject(0 * ref.sizeof.Object);
      const _b = buf.readObject(1 * ref.sizeof.Object);
      assert.strictEqual(a, _a);
      assert.strictEqual(b, _b);
    });
  });
});
