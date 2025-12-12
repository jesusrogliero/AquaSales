const { DataTypes } = require("sequelize");
const { sequelize } = require('../connection.js');
const BackupDrive = require('../models/BackupDrive.js');

const Employe = sequelize.define("employe", {
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
                msg: "Debes ingresar el nombre del empleado"
            },
            notEmpty: {
                args: true,
                msg: "El nombre del empleado no es valido"
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


module.exports = Employe;