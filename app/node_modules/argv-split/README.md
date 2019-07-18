[![Build Status](https://travis-ci.org/kaelzhang/node-argv-split.svg?branch=master)](https://travis-ci.org/kaelzhang/node-argv-split)
[![Dependency Status](https://gemnasium.com/kaelzhang/node-argv-split.svg)](https://gemnasium.com/kaelzhang/node-argv-split)

# argv-split

Split argv(argument vector) and handle special cases, such as quoted or escaped values.

## Why?

```js
const split = require('split')

const mkdir = 'mkdir "foo bar"'
mkdir.split(' ')    // ['mkdir', '"foo', 'bar"']  -> Oops!
split(mkdir)        // ['mkdir', 'foo bar']       -> Oh yeah!

const mkdir2 = 'mkdir foo\\ bar'.split(' ')
mkdir2.split(' ')   // ['mkdir', 'foo\\', 'bar']  -> Oops!
split(mkdir2)       // ['mkdir', 'foo bar']       -> Oh yeah!
```

## `argv-split` handles all special cases with complete unit tests.

```sh
# shell command:        javascript array:
foo a\ b                # ['foo', 'a b']
foo \'                  # ['foo', '\\\'']
foo \"                  # ['foo', '\\"']
foo "a b"               # ['foo', 'a b']
foo "a\ b"              # ['foo', 'a\\ b']
foo '\'                 # ['foo', '\\']
foo --abc="a b"         # ['foo', '--abc=a b']
foo --abc=a\ b          # ['foo', '--abc=a b']

# argv-split also handles carriage returns
foo \
    --abc=a\ b          # ['foo', '--abc=a b']

# etc
```

```js
split('foo \\\n    --abc=a\\ b')    // ['foo', '--abc=a b']
```

## Error Codes

### `UNMATCHED_SINGLE`

If a command missed the closing single quote, the error will throw:

Shell command:

```sh
foo --abc 'abc
```

```js
try {
  split('foo --abc \'abc')
} catch (e) {
  console.log(e.code)   // 'UNMATCHED_SINGLE'
}
```

### `UNMATCHED_DOUBLE`

If a command missed the closing double quote, the error will throw:

```sh
foo --abc "abc
```

### `ESCAPED_EOF`

If a command unexpectedly ends with a `\`, the error will throw:

```sh
foo --abc a\# if there is nothing after \, the error will throw
foo --abc a\ # if there is a whitespace after, then -> ['foo', '--abc', 'a ']
```

### `NON_STRING`

If the argument passed to `split` is not a string, the error will throw

```js
split(undefined)
```

## Install

```sh
$ npm install argv-split --save
```

### split(string)

Splits a string, and balance quoted parts. The usage is quite simple, see examples above.

Returns `Array`


### ~~split.join()~~

Temporarily removed in `2.0.0`, and will be added in `2.1.0`

## License

MIT
