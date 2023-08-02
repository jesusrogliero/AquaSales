const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const BackupDrive = sequelize.define('backup_drive', {

	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true
	},

	file_id: {
		type: DataTypes.TEXT,
		allowNull: false,
		defaultValue: ''
	},
});

module.exports = BackupDrive;