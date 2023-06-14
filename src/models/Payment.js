const { DataTypes } = require('sequelize');
const sequelize = require('../connection');
const Sale = require('./Sale');

const Payment = sequelize.define('Payment', {

	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true
	},

	mobile_payment: {
		type: DataTypes.DECIMAL,
		defaultValue: 0
	},

	cash_dollar: {
		type: DataTypes.DECIMAL,
		defaultValue: 0
	},

	cash_bolivares: {
		type: DataTypes.DECIMAL,
		defaultValue: 0
	},

	sale_id: {
        type: DataTypes.NUMBER,
        allowNull: false,
        references: {
            model: "sales",
            key: "id"
        },
        validate: {
            isNumeric: {
                args: true,
                msg: "venta correcta"
            },
            notEmpty: {
                args: true,
				msg: "venta obligatoria"
            },
            notNull: {
                args: true,
                msg: "venta obligatoria"
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

SaleItem.belongsTo(Sale, { foreignKey: 'sale_id' });
module.exports = Payment;
