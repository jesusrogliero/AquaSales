const { DataTypes } = require("sequelize");
const sequelize = require('../connection.js');
const Sale = require('./Sale.js');
const Product = require('./Product.js');

const SaleItem = sequelize.define("sales_items", {

    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },

    sale_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: "sales",
            key: "id"
        },
        validate: {
            notEmpty: {
                msg: "No se encontró una venta"
            },
            isNumeric: {
                msg: "La venta no es valida"
            }
        }
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
        validate: {
            notEmpty: {
                msg: "Ingrese la cantidad de este producto"
            },
            isNumeric: {
                msg: "Cantidad no valida"
            }
        }
    },

    
    liters: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Ingrese la cantidad de litros este producto"
            },
            isNumeric: {
                msg: "Cantidad no valida"
            }
        }
    },

    cap: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },

    total: {
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

SaleItem.belongsTo(Sale, { foreignKey: 'sale_id' });
SaleItem.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = SaleItem;