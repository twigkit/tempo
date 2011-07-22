var app = require('express').createServer();

app.set('view engine', 'tempo');
app.set('view options', {
  layout: false
});

app.get('/', function(req, res) {
    var beatles = [
        {'name': 'John'},
        {'name': 'Paul'},
        {'name': 'George'},
        {'name': 'Ringo'}
    ];

    res.render('members', {'title': 'The Beatles!', 'beatles' : beatles});
});

app.listen(3000);