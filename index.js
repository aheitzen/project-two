var express = require('express');
var ejsLayouts = require('express-ejs-layouts');
var request= require('request');
var bodyParser = require('body-parser');
var app = express();
var db = require('./models');
var passport = require('passport');

app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json);

app.get('/', function(req, res) {
	res.render('index.ejs');
});

app.post('/favorite', function(req, res) {
	// console.log(req.body);
	db.typography.create({
		image: req.body.url,
	}).then(function() {
		res.redirect('/favorite');
	})

});

app.get('/favorite', function(req, res) {
	db.typography.findAll({

	}).then(function(typography) {
		res.render('favorite.ejs', {typography: typography});
	});
	
});


app.get('/type', function(req, res) {


	
	request('https://api.pinterest.com/v1/boards/dalepartridge/typography-design/pins/?access_token=' + process.env.PINTEREST_TOKEN + '&fields=id,link,image,note', function(err, response, body) {
		var parsedBody = JSON.parse(body); //turns it into a javascript object instead of a string
		
		if(!err && response.statusCode === 200 && parsedBody.page.next) {


			request(parsedBody.page.next, function(err, response, body2) {
				var parsedBody2 = JSON.parse(body2);
				parsedBody.data = parsedBody.data.concat(parsedBody2.data);
				// console.log(parsedBody.data.length);

				
				
				if(!err && response.statusCode === 200 && parsedBody.data) { //checking to see if data exists on parsedBody
			
				var filteredPins = parsedBody.data.filter(function filterByNote(item) {
					if(item.note.toLowerCase().includes(req.query.q.toLowerCase())){
						return true;
					} else {
						return false;
					}
		
				});
				res.render('showpage.ejs', {data: filteredPins});
				} else {
					res.send(err); //later you can render
				}
			}); 
		} else {
			res.send(err);
		}

	});
		
});















var port = 3000;
app.listen(port, function() {
  console.log("You're listening to the smooth sounds of port " + port);
});