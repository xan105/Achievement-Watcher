"use strict";
function parseMaxAge(option) {
    if (option === undefined) {
        return 0;
    }
    if (typeof option !== 'number' || option < 0) {
        throw new Error(option + " is not a valid value for maxAge. Please choose a positive integer.");
    }
    return option;
}
function getHeaderValueFromOptions(options) {
    options = options || {};
    var directives = [];
    if (options.enforce) {
        directives.push('enforce');
    }
    directives.push("max-age=" + parseMaxAge(options.maxAge));
    if (options.reportUri) {
        directives.push("report-uri=\"" + options.reportUri + "\"");
    }
    return directives.join(', ');
}
module.exports = function expectCt(options) {
    var headerValue = getHeaderValueFromOptions(options);
    return function expectCt(_req, res, next) {
        res.setHeader('Expect-CT', headerValue);
        next();
    };
};
