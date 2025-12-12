const { DataTypes } = require("sequelize");
const { sequelize } = require('../connection.js');
const BackupDrive = require('../models/BackupDrive.js');

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


    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isNumeric: {
                args: true,
                msg: "Los cantidad ingresada incorrecta"
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

    price_bs: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
            isNumeric: {
                args: true,
                msg: "Precio en Bs incorrecto"
            },
            notEmpty: {
                args: true,
                msg: "El precio en Bs es obligatorio"
            },
            notNull: {
                args: true,
                msg: "El precio en Bs es obligatorio"
            }
        }
    },

    cap: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isNumeric: {
                args: true,
                msg: "Cantidad de Tapas incorrecta"
            },
        }
    },

    is_dolar: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0
    },

    is_combo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    price_dolar: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
            isNumeric: {
                args: true,
                msg: "Precio en Dolares incorrecto"
            },
            notEmpty: {
                args: true,
                msg: "El precio en Dolares es obligatorio"
            },
            notNull: {
                args: true,
                msg: "El precio en Dolares es obligatorio"
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