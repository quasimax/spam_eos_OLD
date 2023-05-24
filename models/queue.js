'use strict';
module.exports = (sequelize, DataTypes) => {
  const Queue = sequelize.define('Queue', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    username: {
      allowNull: false,
      type: DataTypes.STRING
    },
    status: {
      allowNull: false,
      type: DataTypes.STRING
    },
    error: {
      type: DataTypes.STRING
    },
    reciept: {
      type: DataTypes.JSON
    }
  }, {
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "queue"
  });
  Queue.associate = function(models) {
    // associations can be defined here
  };
  return Queue;
};
