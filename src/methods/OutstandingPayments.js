'use strict'

const sequelize = require('sequelize');
const OutstandingPayment = require('../models/OutstandingPayment.js');
const empty = require('../helpers/empty.js');
const log = require('electron-log');
const isAuth = require('../helpers/auth.js');
const reportErrors = require('../helpers/reportErrors.js');
const Product = require('../models/Product.js');

const OutstandingPayments = {


    /**
     * Ruta que muestra todos los pagos pendientes
     * 
     * @returns items
     */
    'index-outstanding-payments': async function () {
        try {
            return await OutstandingPayment.findAll({
                attributes: [
                    'id', 'client', 'createdAt', 'updatedAt',
                    [sequelize.literal("debt_bs || ' BsS'"), 'debt_bs'],
                    [sequelize.literal("debt_dolar || ' $'"), 'debt_dolar'],
                    [sequelize.literal("product.name "), 'product'],
                    [sequelize.literal("outstanding_payments.quantity || ' UNID'"), 'quantity']
                ],
                include: [
                    {
                        model: Product,
                        required: true,
                        attributes: []
                    }
                ],
                raw: true
            });

        } catch (error) {
            log.error(error);
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

            let product = await Product.findByPk(params.product_id);

            if (empty(product)) {
                throw new Error('El producto no existe')
            }

            let debt_bs = product.price_bs * params.quantity;
            let debt_dolar = product.price_dolar * params.quantity;

            await OutstandingPayment.create({
                client: params.client,
                product_id: params.product_id,
                quantity: params.quantity,
                debt_bs,
                debt_dolar
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
            if (! await isAuth()) throw new Error('Usted no esta Autorizado');

            if (empty(params.client)) throw new Error('EL nombre del cliente es requerido');
            if (params.quantity < 0) throw new Error('La cantidad es requerida');

            let outstanding_payment = await OutstandingPayment.findByPk(params.id);

            if (outstanding_payment === null) throw new Error("El pago pendiente no existe");

            let product = await Product.findByPk(params.product_id);

            if (empty(product)) {
                throw new Error('El producto no existe')
            }

            let debt_bs = product.price_bs * params.quantity;
            let debt_dolar = product.price_dolar * quantity;

            outstanding_payment.client = params.client;
            outstanding_payment.product_id = params.product_id;
            outstanding_payment.quantity = params.quantity;
            outstanding_payment.debt_bs = debt_bs;
            outstanding_payment.debt_dolar = debt_dolar;

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
