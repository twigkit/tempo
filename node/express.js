var express = require('express');
var utils = require('connect').utils;
var tempo = require('tempo').tempo
var app = express();

app.set('view engine', 'tempo');
app.set('view options', utils.merge(app.set('view options'), { layout: false }));


app.get('/', function(req, res) {
    var beatles = [
        {'name': 'John ' + new Date()},
        {'name': 'Paul'},
        {'name': 'George'},
        {'name': 'Ringo'}
    ];

    res.render('beatles', {'title': 'The Beatles!', 'beatles' : beatles});
});

app.listen(3000);