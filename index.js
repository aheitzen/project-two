var express = require('express');
var ejsLayouts = require('express-ejs-layouts');
var request= require('request');
var bodyParser = require('body-parser');
var app = express();

app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
	res.send('I work');
});


//TATTOO BOARD
// url('https://api.pinterest.com/v1/boards/buzzfeed/tattoos/pins/?access_token=' + PROCESS_ENV['PINTEREST_TOKEN']
//TYPOGRAPHY BOARD
url('https://api.pinterest.com/v1/boards/sharvey/typography-hand-lettering/pins/?access_token=' + PROCESS_ENV['PINTEREST_TOKEN']










var port = 3000;
app.listen(port, function() {
  console.log("You're listening to the smooth sounds of port " + port);
});