var http = require('http');
var fs = require('fs');
var sys = require('sys');
var tempo = require('tempo')

// Create an instance of an http server
http.createServer(
        function(req, res) {
			// Load some data
            var data = [
                {'name': 'John'},
                {'name': 'Paul'},
                {'name': 'Ringo'}
            ];

			// Load a template file and create an instance of Tempo
			// Load method supplies an instance of Tempo to the callback function
            tempo.load('index.html', function(tempo) {

				// Prepare a part of the template and render with data
                tempo.prepare('names').render(data);
				// Write the template to the response
                tempo.write(res);
                
                res.end();
            });

        }).listen(8000, "127.0.0.1");

console.log('Server running at http://127.0.0.1:8000/');
