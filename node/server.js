var tempo = require('tempo')

// Create an instance of an http server
var app = require('express').createServer();

app.get('/', function(req, res) {
    var data = [
        {'name': 'John'},
        {'name': 'Paul'},
        {'name': 'George'},
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
});

app.listen(3000);