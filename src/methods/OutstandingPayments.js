'use strict'

const sequelize = require('sequelize');
const OutstandingPayment = require('../models/OutstandingPayment.js');
const empty = require('../helpers/empty.js');
const log = require('electron-log');
const isAuth = require('../helpers/auth.js');
const reportErrors = require('../helpers/reportErrors.js');

const OutstandingPayments = {

    /**
     * Ruta que muestra todos los pagos pendientes
     * 
     * @returns json
     */
    'index-outstanding-payments': async function () {
        try {
            return await OutstandingPayment.findAll({
                attributes: [
                    'id', 'client', 'createdAt', 'updatedAt',
                    [sequelize.literal("debt_bs || ' BsS'"), 'debt_bs'],
                    [sequelize.literal("debt_dolar || ' $'"), 'debt_dolar'],
                ],
                raw: true
            });
        } catch (error) {
            log.error(error.message);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },

    /**
     * Metodo que crea un pago pendiente
     * 
     * @param {Json} params 
     * @returns message
     */
    'create-outstanding-payment': async function (params) {
        try {

            await OutstandingPayment.create({
                client: params.client,
                debt_bs: params.debt_bs == null ? 0 : params.debt_bs,
                debt_dolar: params.debt_dolar == null ? 0 : params.debt_dolar
            });

            return { message: "Agregado con exito", code: 1 };
        } catch (error) {

            if (!empty(error.errors)) {
                log.error(error.errors[0].message);
                return { message: error.errors[0].message, code: 0 };
            }
            else {
                log.error(error.message);
                reportErrors(error);
                return { message: error.message, code: 0 };
            }

        }
    },

    /**
     * funcion que muestra un pago pendiente
     * 
     * @param {int} id 
     * @returns {json} json
     */
    'show-outstanding-payment': async function (id) {
        try {
            let outstanding_payment = await OutstandingPayment.findByPk(id, { raw: true });

            if (outstanding_payment === null) throw new Error("Este cuenta pendiente no existe");

            return outstanding_payment;

        } catch (error) {
            log.error(error.message);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },


    /**
     * funcion que actualiza un pago pago pendiente
     * 
     * @param {*} params 
     * @returns message
     */
    'update-outstanding-payment': async function (params) {
        try {
            if (empty(params.client)) throw new Error('EL nombre del cliente es requerido');
            if (params.debt_bs < 0 ) throw new Error('El monto en bolivares no es correcto');
            if (params.debt_dolar < 0) throw new Error('El monto en dolares no es correcto');

            let outstanding_payment = await OutstandingPayment.findByPk(params.id);

            if (outstanding_payment === null) throw new Error("El pago pendiente no existe");


            outstanding_payment.client = params.client;
            outstanding_payment.debt_bs = params.debt_bs;
            outstanding_payment.debt_dolar = params.debt_dolar;
            await outstanding_payment.save();

            return { message: "Actualizado Correctamente", code: 1 };

        } catch (error) {
            log.error(error.message);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },

    /**
     * funcion que elimina un pago pendiente
     * 
     * @param {*} params 
     * @returns message
     */
    'destroy-outstanding-payment': async function (id) {
        try {

            let outstanding_payment = await OutstandingPayment.findByPk(id);

            if (outstanding_payment === null) throw new Error("Este pago pendiente no existe");

            await outstanding_payment.destroy();

            return { message: "Eliminado Correctamente", code: 1 };

        } catch (error) {
            log.error(error.message);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    }
};

module.exports = OutstandingPayments;
