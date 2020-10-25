'use strict';
const assert = require('assert');
const ref = require('../');

// This will check if the new Buffer implementation behaves like the pre io.js 3.0 one did:
describe('iojs3issue', function() {
  it('should not crash', function() {
    for (let i = 0; i < 10; i++) {
      gc();
      const buf = Buffer.alloc(8);
      const buf2 = ref.ref(buf);
      const buf3 = ref.deref(buf2);
    }
  });

  it('should not crash too', function() {
    for (let i = 0; i < 10; i++) {
      gc();
      const buf = Buffer.alloc(7);
      const buf2 = ref.ref(buf);
      const buf3 = ref.deref(buf2);
    }
  });
});
