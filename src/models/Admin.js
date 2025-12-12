const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const Admin = sequelize.define('admin', {

	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true
	},

	name: {
		type: DataTypes.DECIMAL,
		allowNull: false,
		defaultValue: 0
	},

    password: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 0
    },

    isAutenticate: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});
module.exports = Admin;
