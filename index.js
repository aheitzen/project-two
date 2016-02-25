var express = require('express');
var ejsLayouts = require('express-ejs-layouts');
var session = require('express-session');
var flash = require('connect-flash');
var request= require('request');
var bodyParser = require('body-parser');
var app = express();
var db = require('./models');
var passport = require('passport');
var strategies = require('./config/strategies');
var async = require('async');
// var LocalStrategy = require('passport-local').Strategy;

app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(flash());

app.use(session({
  secret: 'sasdlfkajsldfkajweoriw234234ksdfjals23',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(strategies.serializeUser);
passport.deserializeUser(strategies.deserializeUser);
passport.use(strategies.localStrategy);

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});

app.get('/', function(req, res) {
	res.render('index.ejs');
});

app.post('/favorite', function(req, res) {
	if(req.user) {
		db.user.find({
			where: {id: req.user.id}
		}).then(function(user) {
			user.createTypography({
				image: req.body.url
			}).then(function(typography) {
				res.redirect('/favorite/')
			})

		})
		
	} else {
		res.redirect('/login');
	}
});


app.get('/favorite', function(req, res) {
	db.user.find({
		where: {id: req.user.id}, 
		include: [db.typography]
	}).then(function(user) {
		res.render('favorite.ejs', {user: user});
	});
});

app.get('/login', function(req, res) {
	res.render('login.ejs');
});

app.post('/login',function(req,res){
  passport.authenticate('local', function(err, user, info) {
  	console.log(err);
    if (user) {
      req.login(user, function(err) {
        if (err) throw err;
        // req.flash('success', 'You are now logged in.');
        res.redirect('/');
      });
    } else {
      req.flash('danger', 'Error');
      res.redirect('/login');
    }
  })(req, res);
});

app.get('/logout', function(req, res) {
  req.logout();
  // req.flash('info', 'You have been logged out.');
  res.redirect('/');
});

app.get('/signup', function(req, res) {
	res.render('signup.ejs');
});


app.post('/signup', function(req, res) {
	db.user.findOne({
		where: {
			name: req.body.username
		}
	}).then(function(user) {
		if(user){
			//user exists through error
			//later add a flash message
			res.redirect('/signup');
		} else{
			//user does not exist, we can create it
			if(req.body.password1 === req.body.password2){
				//create the account
				db.user.create({
					name: req.body.username,
					password: req.body.password1
				}).then(function(newuser) {
					//the account has been created in the database
					res.redirect('/login')
				})
			} else {
				//passwords don't match, throw error
				res.redirect('/signup')
			}
		}
	});
});
//deleting the pictures in favorites
app.put('/favorite/:userId/:typographyId', function(req, res) {
	db.user.findById(req.params.userId).then(function(user) {
			user.removeTypography(req.params.typographyId).then(function() {
			res.sendStatus(200);
		})
	})
});















	
// 	request('https://api.pinterest.com/v1/boards/dalepartridge/typography-design/pins/?access_token=' + process.env.PINTEREST_TOKEN + '&fields=id,link,image,note', function(err, response, body) {
// 		var parsedBody = JSON.parse(body); //turns it into a javascript object instead of a string
		
// 		if(!err && response.statusCode === 200 && parsedBody.page.next) {


// 			request(parsedBody.page.next, function(err, response, body2) {
// 				var parsedBody2 = JSON.parse(body2);
// 				parsedBody.data = parsedBody.data.concat(parsedBody2.data);
// 				// console.log(parsedBody.data.length);

				
				
// 				if(!err && response.statusCode === 200 && parsedBody.data) { //checking to see if data exists on parsedBody
			
// 				var filteredPins = parsedBody.data.filter(function filterByNote(item) {
// 					if(item.note.toLowerCase().includes(req.query.q.toLowerCase())){
// 						return true;
// 					} else {
// 						return false;
// 					}
		
// 				});
// 				res.render('showpage.ejs', {data: filteredPins});
// 				} else {
// 					res.send(err); //later you can render
// 				}
// 			}); 
// 		} else {
// 			res.send(err);
// 		}

// 	});
		
// });

app.get('/type', function(req, res) {

	var pins = [];
	
	function firstRequest(callback) {
	  request('https://api.pinterest.com/v1/boards/dalepartridge/typography-design/pins/?access_token=' + process.env.PINTEREST_TOKEN + '&fields=id,link,image,note', function(err, response, body) {
	    
	    var parsedBody = JSON.parse(body);
	  
	    pins = pins.concat(parsedBody.data);
	    callback(null, parsedBody.page.next);
	  });
	}

	function otherRequests(nextPage, callback) {
	  request(nextPage, function(err, response, body) {
	    var parsedBody = JSON.parse(body);
	    pins = pins.concat(parsedBody.data);
	    callback(null, parsedBody.page.next);
	  });
	}

	var pinterestRequests = [firstRequest];
	for (var i = 0; i < 21; i++) {
	  pinterestRequests.push(otherRequests);
	}

	// pinterestRequests = [firstRequest, otherRequests, otherRequests, otherRequests]

	async.waterfall(pinterestRequests, function(err, results) {
	  // console.log(pins);

	  var filteredPins = pins.filter(function filterByNote(item) {
					if(item.note.toLowerCase().includes(req.query.q.toLowerCase())){
						return true;
					} else {
						return false;
					}
		
				});
	  console.log(filteredPins);
	  res.render('showpage', {data: filteredPins});
	})
});
















var port = 3000;
app.listen(process.env.PORT || 3000, function() {
  console.log("You're listening to the smooth sounds of port " + port);
});




