const { DataTypes } = require("sequelize");
const sequelize = require('../connection.js');
const SaleState = require('./SaleState.js');

const Sale = sequelize.define("sales", {

    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },

    client: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'Cliente'
    },

    state_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 1,
        references: {
            model: "sales_states",
            key: "id"
        },
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

Sale.belongsTo(SaleState, { foreignKey: 'state_id' });

module.exports = Sale;