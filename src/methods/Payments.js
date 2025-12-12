'use strict'

const Payment = require('../models/Payment.js');
const Sale = require('../models/Sale.js');
const empty = require('../helpers/empty.js');
const log = require('electron-log');
const sequelize = require('sequelize');
const axios = require('axios');

const Exchange = require('../models/Exchange.js');
const moment = require('moment');
const reportErrors = require('../helpers/reportErrors.js');

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
                    [sequelize.col('sale.client'), 'client'],
                    [sequelize.col('sale.id'), 'sale_id']
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
            reportErrors(error);
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
            reportErrors(error);

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
            reportErrors(error);
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
            let today = moment().format("YYYY-MM-DD");
            let exchange = await Exchange.findByPk(1);

            if (exchange.date != today) {
                const response = await axios.get('https://ve.dolarapi.com/v1/dolares/oficial');
                let bcv = parseFloat(response.data.promedio);
                exchange.bcv = bcv;
                exchange.date = today;
                await exchange.save();
            }

            return exchange.bcv;

        } catch (error) {
            log.error(error.message);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    }
};

module.exports = Payments;
