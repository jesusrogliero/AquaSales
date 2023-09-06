const { DataTypes } = require("sequelize");
const sequelize = require('../connection.js');
const Employe = require('./Employe.js');

const Payroll = sequelize.define("payrolls", {

    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },

    employe_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: "employe",
            key: "id"
        },
        validate: {
            notEmpty: {
                msg: "Debe seleccionar un empleado"
            },
            isNumeric: {
                msg: "El empleado no es valido"
            }
        }
    },

    payment_bs: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isNumeric: {
                msg: "El monto del pago en bolivares no es correcto"
            }
        }
    },

    payment_dolar: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isNumeric: {
                msg: "El monto del pago en dolares no es correcto"
            }
        }
    },

    discount_bs: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isNumeric: {
                msg: 'El descuento en Bolivares no es correcto'
            }
        }
    },

    discount_dolar: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isNumeric: {
                msg: 'El descuento en Dolares no es correcto'
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

Payroll.belongsTo(Employe, { foreignKey: 'employe_id' });
module.exports = Payroll;