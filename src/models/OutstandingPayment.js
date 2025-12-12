const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');
const Product = require('./Product');

const OutstandingPayment = sequelize.define('outstanding_payments', {

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

	product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: "products",
            key: "id"
        },
        validate: {
            notEmpty: {
                msg: "No se encontró un producto"
            },
            isNumeric: {
                msg: "Producto no valido"
            }
        }
    },

	quantity: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0,
		validate: {
			isNumeric: {
				msg: 'La cantidad no es correcta.'
			}
		}
	},

	debt_bs: {
		type: DataTypes.DECIMAL,
		allowNull: false,
		defaultValue: 0,
	},

    debt_dolar: {
		type: DataTypes.DECIMAL,
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

OutstandingPayment.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = OutstandingPayment;
