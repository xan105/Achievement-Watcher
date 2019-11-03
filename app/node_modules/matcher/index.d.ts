declare namespace matcher {
	interface Options {
		/**
		Treat uppercase and lowercase characters as being the same.

		Ensure you use this correctly. For example, files and directories should be matched case-insensitively, while most often, object keys should be matched case-sensitively.

		@default false
		*/
		readonly caseSensitive?: boolean;
	}
}

declare const matcher: {
	/**
	Simple [wildcard](https://en.wikipedia.org/wiki/Wildcard_character) matching.

	@param inputs - Strings to match.
	@param patterns - Use `*` to match zero or more characters. A pattern starting with `!` will be negated.
	@returns The `inputs` filtered based on the `patterns`.

	@example
	```
	import matcher = require('matcher');

	matcher(['foo', 'bar', 'moo'], ['*oo', '!foo']);
	//=> ['moo']

	matcher(['foo', 'bar', 'moo'], ['!*oo']);
	//=> ['bar']
	```
	*/
	(inputs: readonly string[], patterns: readonly string[], options?: matcher.Options): string[];

	/**
	@param input - String to match.
	@param pattern - Use `*` to match zero or more characters. A pattern starting with `!` will be negated.
	@returns Whether the `input` matches the `pattern`.

	@example
	```
	import matcher = require('matcher');

	matcher.isMatch('unicorn', 'uni*');
	//=> true

	matcher.isMatch('unicorn', '*corn');
	//=> true

	matcher.isMatch('unicorn', 'un*rn');
	//=> true

	matcher.isMatch('rainbow', '!unicorn');
	//=> true

	matcher.isMatch('foo bar baz', 'foo b* b*');
	//=> true

	matcher.isMatch('unicorn', 'uni\\*');
	//=> false

	matcher.isMatch('UNICORN', 'UNI*', {caseSensitive: true});
	//=> true

	matcher.isMatch('UNICORN', 'unicorn', {caseSensitive: true});
	//=> false
	```
	*/
	isMatch(input: string, pattern: string, options?: matcher.Options): boolean;
};

export = matcher;
