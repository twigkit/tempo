var express = require('express');
var app = express();

app.set('view engine', 'tempo');

app.get('/', function(req, res) {
    var beatles = [
        {'name': 'John ' + new Date()},
        {'name': 'Paul'},
        {'name': 'George'},
        {'name': 'Ringo'}
    ];

    res.render('beatles', {'title': 'The Beatles!', 'beatles' : beatles});
});

console.log('Server running at http://127.0.0.1:3000/');
app.listen(3000);