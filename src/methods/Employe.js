'use strict'

const Employe = require('../models/Employe.js');
const empty = require('../helpers/empty.js');
const log = require('electron-log');
const reportErrors = require('../helpers/reportErrors.js');

const Employes = {

    /**
     * Ruta que muestra todos los empleados
     * 
     * @returns productss
     */
    'index-employes': async function () {
        try {
            return await Employe.findAll({ raw: true });
        } catch (error) {
            log.error(error);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },

    /**
     * Metodo que crea un nuevo empleado
     * 
     * @param {Json} params 
     * @returns message
     */
    'create-employe': async function (params) {
        try {
            if (empty(params.name)) throw new Error('El nombre del empleado es requerido');

            await Employe.create({ name: params.name });

            return { message: "Agregado con exito", code: 1 };
        } catch (error) {

            if (!empty(error.errors)) {
                log.error(error.errors[0].message);
                return { message: error.errors[0].message, code: 0 };
            }
            else {
                log.error(error);
                reportErrors(error);
                return { message: error.message, code: 0 };
            }

        }
    },


    /**
     * funcion que actualiza un empleado
     * 
     * @param {*} params 
     * @returns message
     */
    'update-employe': async function (params) {
        try {

            if (empty(params.name)) throw new Error("El nombre del empleado es obligatorio");
        
            let employe = await Employe.findByPk(params.id);

            if (employe === null) throw new Error("El empleado no existe");

            employe.name = params.name;
            await employe.save();

            return { message: "Actualizado Correctamente", code: 1 };

        } catch (error) {
            log.error(error);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },



    /**
     * funcion que elimina un empleado
     * 
     * @param {*} params 
     * @returns message
     */
    'destroy-employe': async function (id) {
        try {
            let employe = await Employe.findByPk(id);

            if (employe === null) throw new Error("Este empleado no existe");

            await employe.destroy();

            return { message: "Eliminado Correctamente", code: 1 };

        } catch (error) {
            log.error(error);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    }
};

module.exports = Employes;
