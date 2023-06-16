const { DataTypes } = require("sequelize");
const sequelize = require('../connection.js');

const Sale = sequelize.define("sales", {

    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },

    total_dolar: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0,
    },

    total_bs: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0,
    },

    total_caps: {
        type: DataTypes.NUMBER,
        allowNull: false,
        defaultValue: 0,
    },

    total_liters: {
        type: DataTypes.NUMBER,
        allowNull: false,
        defaultValue: 0,
    },

    total_units: {
        type: DataTypes.NUMBER,
        allowNull: false,
        defaultValue: 0,
    },

    createdAt: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    updatedAt: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }

});

module.exports = Sale;