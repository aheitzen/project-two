var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.user.findById(id).then(function(user) {
    done(null, user.get());
  }).catch(done);
});

var db = require('../models');

module.exports = {
  serializeUser: function(user, done) {
    done(null, user.id);
  },
  deserializeUser: function(id, done) {
    db.user.find(id).then(function(user) {
      done(null, user.get());
    }).catch(done);
  },

localStrategy:new LocalStrategy({
    usernameField: 'username'
  },
  function(username, password, done) {
    db.user.find({where: {name: username}}).then(function(user) {
      if (user) {
        user.checkPassword(password, function(err, result) {
          if (err) return done(err);
          if (result) {
            done(null, user.get());
          } else {
            done(null, false, {message: 'Invalid password'});
          }
        });
      } else {
        done(null, false, {message: 'Unknown user'});
      }
    });
  }
)}