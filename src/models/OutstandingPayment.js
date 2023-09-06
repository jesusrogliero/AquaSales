const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const OutstandingPayment = sequelize.define('OutstandingPayments', {

	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true
	},

    client: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'Generico'
    },

	debt_bs: {
		type: DataTypes.DECIMAL,
		allowNull: false,
		defaultValue: 0,
        validate: {
            isNumeric: {
                msg: 'El monto pendiente en bolivares no es correcto'
            }
        }
	},

    debt_dolar: {
		type: DataTypes.DECIMAL,
		allowNull: false,
		defaultValue: 0,
        validate: {
            isNumeric: {
                msg: 'El monto pendiente en dolares no es correcto'
            }
        }
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

module.exports = OutstandingPayment;
