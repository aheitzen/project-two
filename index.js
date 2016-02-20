var express = require('express');
var ejsLayouts = require('express-ejs-layouts');
var request= require('request');
var bodyParser = require('body-parser');
var app = express();

app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json);

app.get('/', function(req, res) {
	res.render('index.ejs');
});


app.get('/type', function(req, res) {
	request('https://api.pinterest.com/v1/boards/dalepartridge/typography-design/pins/?access_token=' + process.env.PINTEREST_TOKEN + '&fields=id,link,image', function(err, response, body) {
		var parsedBody = JSON.parse(body); //turns it into a javascript object instead of a string
		if(!err && response.statusCode === 200 && parsedBody.data) { //checking to see if data exists on parsedBody
			res.render('showpage.ejs', {data: parsedBody.data});
		} else {
			res.send(err); //later you can render
		}
	});
});

app.post('/type', function(req, res) {
	
})










var port = 3000;
app.listen(port, function() {
  console.log("You're listening to the smooth sounds of port " + port);
});