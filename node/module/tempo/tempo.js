var fs = require('fs');
var jsdom = require('jsdom').jsdom;
navigator = {
    userAgent: 'node-js', appVersion: '0.2'
};
var tempo = require('./lib/tempo').tempo

var _window;

/**
 * Overrides the template loading mechanism in Tempo to use local file system.
 *
 * @param file
 * @param callback
 * @return {*}
 */
tempo.exports.templates.prototype.load = function (file, callback) {
    return callback(fs.readFileSync(file, 'UTF-8'));
}

/**
 * Load a given template from the file system.
 *
 * @param template
 * @param callback
 */
tempo.load = function (template, callback) {
    fs.readFile(template, 'UTF-8', function (err, data) {
        if (err) throw err;
        document = jsdom(data);
        _window = document.createWindow();

        callback(tempo.init(_window));
    });
}

/**
 * Write the rendered DOM to the response.
 *
 * @param res
 */
tempo.write = function (res) {
    res.write(_window.document.innerHTML);
}

/**
 * Express 2.0 support.
 *
 * @param markup
 * @param options
 * @return {Function}
 */
tempo.compile = function (markup, options) {
    var data = markup;
    document = jsdom(data);
    window = document.createWindow();

    var renderer = tempo.init(window).prepare(document.getElementsByTagName('html')[0]);

    return function render (locals) {
        renderer.render(locals);
        return window.document.innerHTML;
    };
};

/**
 * Express 3.0 support.
 *
 * @param filename
 * @param options
 * @param callback
 * @private
 */
tempo.__express = function (filename, options, callback) {
    options = options || {};
    fs.readFile(filename, 'UTF-8', function (err, data) {
        document = jsdom(data);
        window = document.createWindow();

        var renderer = tempo.init(window).prepare(document.getElementsByTagName('html')[0]);
        renderer.render(options);
        callback(err, window.document.innerHTML);
    });
};

module.exports = tempo;