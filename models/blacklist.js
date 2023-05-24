'use strict';
module.exports = (sequelize, DataTypes) => {
    const Blacklist = sequelize.define('Blacklist', {
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
        isContract: {
            field: "is_contract",
            allowNull: false,
            type: DataTypes.BOOLEAN
        },
        reason: {
            type: DataTypes.STRING
        }
    }, {
        createdAt: "created_at",
        updatedAt: "updated_at",
        tableName: "blacklist"
    });
    Blacklist.associate = function (models) {
        // associations can be defined here
    };
    return Blacklist;
};
