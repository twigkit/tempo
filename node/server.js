var http = require('http');
var fs = require('fs');
var sys = require('sys');
var tempo = require('./module/tempo')

http.createServer(
        function(req, res) {
            var data = [
                {'name': 'John'},
                {'name': 'Paul'},
                {'name': 'Ringo'}
            ];

            tempo.load('index.html', function(tempo) {

                tempo.prepare('names').render(data);
                tempo.write(res);
                
                res.end();
            });

        }).listen(8000, "127.0.0.1");

console.log('Server running at http://127.0.0.1:8000/');
