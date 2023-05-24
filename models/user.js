'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    dappId: {
      allowNull: false,
      field: "dapp_id",
      type: DataTypes.INTEGER
    },
    contract: {
      allowNull: false,
      type: DataTypes.STRING
    },
    username: {
      allowNull: false,
      type: DataTypes.STRING
    },
    actedAt: {
      allowNull: false,
      field: "acted_at",
      type: DataTypes.DATE
    },
  }, {
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "users"
  });
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};
