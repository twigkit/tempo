var fs = require('fs');
var jsdom = require('jsdom').jsdom;
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

tempo.compile = function(markup, options) {
    options = options || {};
    var name = options.filename || markup;
    var data = markup;
    return function render(locals) {
        document = jsdom(data);
        window = document.createWindow();

        tempo.init(window).prepare(document.children[0]).render(locals);

		return window.document.innerHTML;
	};
};

module.exports = tempo;