var http = require('http');
var tempo = require('tempo')

// Create an instance of an http server
http.createServer(
        function(req, res) {

            // Load a template file and create an instance of Tempo
            // Load method supplies an instance of Tempo to the callback function
            tempo.load('views/beatles.tempo', function(tempo) {
                // Load some data
                var beatles = [
                    {'name': 'John'},
                    {'name': 'Paul'},
                    {'name': 'George'},
                    {'name': 'Ringo'}
                ];

                // Prepare a part of the template and render with data
                tempo.prepare('*', {}, function(r) {
                    r.render({'title': 'The Beatles!', 'beatles': beatles});
                    // Write the template to the response
                    tempo.write(res);

                    res.end();
                });
            });

        }).listen(3000, "127.0.0.1");

console.log('Server running at http://127.0.0.1:3000/');
