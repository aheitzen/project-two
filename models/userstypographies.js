'use strict';
module.exports = function(sequelize, DataTypes) {
  var usersTypographies = sequelize.define('usersTypographies', {
    userId: DataTypes.INTEGER,
    typographyId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return usersTypographies;
};