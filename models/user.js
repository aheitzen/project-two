'use strict';
module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    name: DataTypes.STRING,
    image: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        models.user.belongsToMany(models.typography, {through:'favoritesTags'});
      }
    }
  });
  return user;
};