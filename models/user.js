'use strict';
var passport = require('passport');
var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        models.user.belongsToMany(models.typography, {through:'usersTypographies'});
      }
    },
    instanceMethods: {
      checkPassword: function(password, callback) {
        if(password && this.password){
          bcrypt.compare(password, this.password, callback);
        } else {
          callback(null, false);
        }
      }
    },
    hooks: {
      beforeCreate: function(user, options, callback) {
        if (!user.password) return callback(null, user);
        bcrypt.hash(user.password, 10, function(err, hash) {
          if (err) return callback(err);
          user.password = hash;
          callback(null, user);
        });
      }
    }
  });
  return user;
};

