const boolean = function (value: any): boolean {
  if (typeof value === 'string') {
    // According to our ESLint rules, the regular expression following below
    // should be using a named capture group. This is an official part of
    // ES2018, but Firefox fails to implement it. There has been an open issue
    // for this (see https://bugzilla.mozilla.org/show_bug.cgi?id=1362154) since
    // 2016 now, and Mozilla fails to fix this. To avoid breaking support with
    // Firefox, we explicitly disable the ESLint rule here and use a regular
    // expression without a named capture group. We should check from time to
    // time, whether support in Firefox has finally been added. Besides the
    // issue, we can check this using the following link to the kangax table:
    // https://kangax.github.io/compat-table/es2016plus/#test-RegExp_named_capture_groups

    // The original line, which is failing in Firefox:
    // return /^(?<truthy>true|t|yes|y|on|1)$/iu.test(value.trim());

    // The replacement line, which should be removed at some point in the
    // future, including the ESLint comments:
    /* eslint-disable prefer-named-capture-group */
    return /^(true|t|yes|y|on|1)$/iu.test(value.trim());
    /* eslint-enable prefer-named-capture-group */
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return false;
};

export default boolean;
