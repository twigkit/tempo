var http = require('http');
var fs = require('fs');
var sys = require('sys');
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

module.exports = tempo;