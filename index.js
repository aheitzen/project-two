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
	db.user.find({
		where: {id: req.user.id}
	}).then(function(user) {
		user.createTypography({
			image: req.body.url
		}).then(function(typography) {
			res.redirect('/favorite/' + req.user.id)
		})
	})
	// console.log(req.body);
});

app.get('/favorite/:userId', function(req, res) {
	db.user.find({
		where: {id: req.params.userId},
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
      // req.flash('danger', 'Error');
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
					res.redirect('/')
				})
			} else {
				//passwords don't match, throw error
				res.redirect('/signup')
			}
		}
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