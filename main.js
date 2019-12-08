/*
    Uses express, dbcon for database connection, body parser to parse form data
    handlebars for HTML templates
*/

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

var mysql = require('./dbcon.js');
app.set('mysql', mysql);

app.set('port', process.argv[2]);
app.use(express.static('public'));
app.use('/static', express.static('public'));
app.use('/customer', require('./customer.js'));
app.use('/booking', require('./booking.js'));
app.use('/guides', require('./guides.js'));
app.use('/locations', require('./locations.js'));
app.use('/assignments', require('./assignments.js'));
app.use('/rating', require('./rating.js'));
app.use('/payment', require('./payment.js'));

//homepage routes
app.get('/', function (req, res, next) {
    // Render the homepage.
    res.render('home');
});
app.get('/home', function (req, res, next) {
    // Render the homepage.
    res.render('home.handlebars');
});
app.listen(app.get('port'), function(){
  console.log('The site is live at http://localhost:' + app.get('port') + '. Stop Node with Ctrl-C.');
});
