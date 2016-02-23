'use strict';
module.exports = function(sequelize, DataTypes) {
  var typography = sequelize.define('typography', {
    image: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        models.typography.belongsToMany(models.user, {through: 'usersTypographies'});
      }
    }
  });
  return typography;
};