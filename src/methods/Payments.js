'use strict'

const Payment = require('../models/Payment.js');
const Sale = require('../models/Sale.js');
const BCV = require('bcv-divisas');
const empty = require('../helpers/empty.js');
const log = require('electron-log');
const sequelize = require('sequelize');

const Payments = {

    /**
     * Ruta que muestra todos los Pagos
     * 
     * @returns {json} pago
     */
    'index-payments': async function () {
        try {
            return await Payment.findAll({
                attributes: [
                    'id', 'createdAt', 'reference',
                    [sequelize.literal("mobile_payment || ' BsS'"), 'mobile_payment'],
                    [sequelize.literal("cash_dollar || ' $'"), 'cash_dollar'],
                    [sequelize.literal("cash_bolivares || ' BsS'"), 'cash_bolivares'],
                    [sequelize.col('sale.client'), 'client']
                ],
                include: [
                    {
                        model: Sale,
                        required: true,
                        attributes: []
                    }
                ],
                raw: true
            });
        } catch (error) {
            log.error(error.message);
            return { message: error.message, code: 0 };
        }
    },


    /**
     * Metodo que crea un nuevo pago
     * 
     * @param {Json} params 
     * @returns message
     */
    'create-payment': async function (params) {
        try {

            const new_payment = await Payment.create({
                mobile_payment: params.mobile_payment,
                reference: params.reference,
                cash_dollar: params.cash_dollar,
                cash_bolivares: params.cash_bolivares,
                sale_id: params.sale_id
            });

            return { message: "Agregado con exito", code: 1 };
        } catch (error) {

            if (!empty(error.errors)) {
                log.error(error.errors[0].message);
                return { message: error.errors[0].message, code: 0 };
            }
            else {
                log.error(error.error.message);
                return { message: error.message, code: 0 };
            }

        }
    },


    /**
     * funcion que muestra un pago
     * 
     * @param {int} id 
     * @returns {json} pago
     */
    'show-payment': async function (id) {
        try {
            let payment = await Payment.findByPk(id, { raw: true });

            if (payment === null) throw new Error("Este pago no existe");

            return payment;

        } catch (error) {
            log.error(error.message);
            return { message: error.message, code: 0 };
        }
    },


    /**
     * funcion que muestra la tasa del BCV
     * 
     * @param {int} id 
     * @returns {json} pago
     */
    'show-bcv': async function () {
        try {
            let bcv = await BCV.bcvDolar()
            return parseFloat(bcv._dolar);
        } catch (error) {
            log.error(error.message);
            return { message: error.message, code: 0 };
        }
    },


    /**
     * funcion que actualiza un pago
     * 
     * @param {*} params 
     * @returns message
     */
    'update-payment': async function (params) {

        try {
            if (params.mobile_payment < 0) throw new Error("El monto no puede ser negativo");
            if (params.cash_dollar < 0) throw new Error("El monto no puede ser negativo");
            if (params.cash_bolivares < 0) throw new Error("El monto no puede ser negativo");

            let payment = await Payment.findByPk(params.id);

            if (payment === null) throw new Error("El pago no existe");

            payment.mobile_payment = params.mobile_payment;
            payment.cash_bolivares = params.cash_bolivares;
            payment.cash_dollar = params.cash_dollar;
            payment.reference = params.reference;

            await payment.save();

            return { message: "Actualizado Correctamente", code: 1 };

        } catch (error) {
            log.error(error.message);
            return { message: error.message, code: 0 };
        }
    },



    /**
     * funcion que elimina un pago
     * 
     * @param {*} params 
     * @returns message
     */
    'destroy-payment': async function (id) {
        try {
            let payment = await Payment.findByPk(id);

            if (payment === null) throw new Error("Este pago no existe");

            payment.destroy();

            return { message: "Eliminado Correctamente", code: 1 };

        } catch (error) {
            log.error(error.message);
            return { message: error.message, code: 0 };
        }
    }
};

module.exports = Payments;
