const { DataTypes } = require("sequelize");
const sequelize = require('../connection.js');

const SaleState = sequelize.define("sales_states", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },

    name: {
        type: DataTypes.TEXT,
        allowNull: false,
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


module.exports = SaleState;