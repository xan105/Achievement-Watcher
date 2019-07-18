'use strict'

const test = require('ava')
const split = require('..')

;[
{
  d: 'normal',
  a: 'a b c',
  e: ['a', 'b', 'c']
},
{
  d: 'double-quoted',
  a: '"a b c"',
  e: ['a b c']
},
{
  d: 'double-quoted, and trailing normal',
  a: '"a b" c',
  e: ['a b', 'c']
},
{
  d: 'double-quoted, and heading normal',
  a: 'c "a b"',
  e: ['c', 'a b']
},
{
  d: 'single-quoted',
  a: "'a b c'",
  e: ['a b c']
},
{
  d: 'single-quoted, and trailing normal',
  a: "'a b' c",
  e: ['a b', 'c']
},
{
  d: 'single-quoted, and heading normal',
  a: "c 'a b'",
  e: ['c', 'a b']
},
{
  d: 'escaped whitespaces',
  a: 'a\\ b',
  e: ['a b']
},
{
  d: 'escaped whitespaces, and trailing normal',
  a: 'a\\ b c',
  e: ['a b', 'c']
},
{
  d: 'escaped whitespaces, and heading normal',
  a: 'c a\\ b',
  e: ['c', 'a b']
},
{
  d: 'non-starting single quote',
  a: "a' b'",
  e: ['a b']
},
{
  d: 'non-staring single quote with =',
  a: "--foo='bar baz'",
  e: ['--foo=bar baz']
},
{
  d: 'non-starting double quote',
  a: 'a" b"',
  e: ['a b']
},
{
  d: 'non-starting double quote with =',
  a: '--foo="bar baz"',
  e: ['--foo=bar baz']
},
{
  d: 'double-quoted escaped double quote',
  a: '"bar\\" baz"',
  e: ['bar" baz']
},
{
  d: 'single-quoted escaped double quote, should not over unescaped',
  a: '\'bar\\" baz\'',
  e: ['bar\\" baz']
},
{
  d: 'signle-quoted escaped single quote, should throw',
  a: "'bar\' baz'",
  throws: true
}

].forEach(({d, a, e, throws, only}) => {
  const t = only
    ? test.only
    : test

  t(d, t => {
    if (throws) {
      t.throws(() => {
        split(a)
      })
      return
    }
// console.log(split(a), e)
    t.deepEqual(split(a), e)
  })
})
