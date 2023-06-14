const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');

const Product = sequelize.define("products", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },

    name: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {            
            notNull: {
                args: true,
                msg: "Debes ingresar el nombre del producto"
            },
            notEmpty: {
                args: true,
                msg: "El nombre del producto no es valido"
            }
        }
    },

    liters: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
            isNumeric: {
                args: true,
                msg: "Los litros ingresados son incorrecto"
            },
            notEmpty: {
                args: true,
                msg: "Los litros son obligatorios"
            },
            notNull: {
                args: true,
                msg: "Los litros son obligatorios"
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


module.exports = Product;