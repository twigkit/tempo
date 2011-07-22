var fs = require('fs');
var jsdom = require('jsdom');
var tempo = require('./lib/tempo').tempo

var _window;

tempo.load = function (template, callback) {
    fs.readFile(template, 'UTF-8', function(err, data) {
        if (err) throw err;
        jsdom.env(data, [], function(errors, window) {
            _window = window;
            callback(tempo.init(window));
        });
    });
}

tempo.write = function (res) {
    res.write(_window.document.innerHTML);
}

var compile = exports.compile = function(str, options) {
    options = options || {};

    var input = JSON.stringify(str)
            , filename = options.filename
            ? JSON.stringify(options.filename)
            : 'undefined';

    // Adds the fancy stack trace meta info
    str = [
        'var __stack = { lineno: 1, input: ' + input + ', filename: ' + filename + ' };',
        rethrow.toString(),
        'try {',
        exports.parse(str, options),
        '} catch (err) {',
        '  rethrow(err, __stack.input, __stack.filename, __stack.lineno);',
        '}'
    ].join("\n");

    if (options.debug) console.log(str);
    var fn = new Function('locals, filters, escape', str);
    return function(locals) {
        return fn.call(this, locals, filters, utils.escape);
    }
};

module.exports = tempo;