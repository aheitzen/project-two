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
				res.redirect('/favorite') 
			});
		});
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

app.get('/about', function(req, res) {
	res.render('about.ejs')
});

app.post('/login',function(req,res){
  passport.authenticate('local', function(err, user, info) {
  	console.log(err);
    if (user) {
      req.login(user, function(err) {
        if (err) throw err;
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
			res.redirect('/signup');
		} else{
			if(req.body.password1 === req.body.password2){
				db.user.create({
					name: req.body.username,
					password: req.body.password1
				}).then(function(newuser) {
					res.redirect('/login')
				})
			} else {
				res.redirect('/signup')
			}
		}
	});
});

app.put('/favorite/:userId/:typographyId', function(req, res) {
	db.user.findById(req.params.userId).then(function(user) {
			user.removeTypography(req.params.typographyId).then(function() {
			res.sendStatus(200);
		});
	});
});

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
	for (var i = 0; i < 10; i++) {
	  pinterestRequests.push(otherRequests);
	}
	async.waterfall(pinterestRequests, function(err, results) {
		var filteredPins = pins.filter(function filterByNote(item) {
			if(item.note.toLowerCase().includes(req.query.q.toLowerCase())){
				return true;
			} else {
				return false;
			}
		});
	  res.render('showpage', {data: filteredPins});
	});
});

var port = 3000;
app.listen(process.env.PORT || 3000, function() {
  console.log("You're listening to the smooth sounds of port " + port);
});




