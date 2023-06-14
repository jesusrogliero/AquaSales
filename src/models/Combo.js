const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');
const Product = require('./Product.js');

const Combo = sequelize.define("combos", {
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
                msg: "Debes ingresar el nombre del combo"
            },
            notEmpty: {
                args: true,
                msg: "El nombre del combo no es valido"
            }
        }
    },

    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isNumeric: {
                args: true,
                msg: "Cantidad ingresada es incorrecta"
            },
            notEmpty: {
                args: true,
                msg: "La cantidad es obligatoria"
            },
            notNull: {
                args: true,
                msg: "La cantidad es obligatoria"
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


module.exports = Combo;