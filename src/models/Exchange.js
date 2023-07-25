const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Exchange = sequelize.define('exchange', {

	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true
	},

	bcv: {
		type: DataTypes.DECIMAL,
		allowNull: false,
		defaultValue: 0
	},
	
	date: {
		type: DataTypes.DATEONLY,
		allowNull: false
	}
});
module.exports = Exchange;
