'use strict';
module.exports = (sequelize, DataTypes) => {
  const Dapp = sequelize.define('Dapp', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    title: {
      allowNull: false,
      type: DataTypes.STRING
    },
    slug: {
      allowNull: false,
      type: DataTypes.STRING
    },
    type: {
      type: DataTypes.STRING
    },
    data: {
      allowNull: false,
      type: DataTypes.JSON
    }
  }, {
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "dapps"
  });
  Dapp.associate = function(models) {
    // associations can be defined here
  };
  return Dapp;
};
