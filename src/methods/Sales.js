'use strict'

const Sale = require('../models/Sale.js');
const SaleItem = require('../models/SaleItem.js');
const SaleState = require('../models/SaleState.js');
const Payment = require('../models/Payment.js');
const empty = require('../helpers/empty.js');
const log = require('electron-log');
const sequelize = require('sequelize');
const isAuth = require('../helpers/auth.js');
const reportErrors = require('../helpers/reportErrors.js');

const Sales = {

    /**
     * Ruta que muestra todas las ventas despachadas
     * 
     * @returns products
     */
    'dispatched-sales': async function () {
        try {
            return await Sale.findAll({
                attributes: [
                    'id', 'client', 'createdAt', 'updatedAt',
                    [sequelize.literal("total_units || ' UNID'"), 'total_units'],
                    [sequelize.literal("pending_dispatch || ' UNID'"), 'pending_dispatch'],
                    [sequelize.literal("total_dispatched || ' UNID'"), 'total_dispatched'],
                    [sequelize.literal("total_liters || ' LT'"), 'total_liters'],
                    [sequelize.literal("total_caps || ' UNID'"), 'total_caps'],
                    [sequelize.literal("total_bs || ' BsS'"), 'total_bs'],
                    [sequelize.literal("total_dolar || ' $'"), 'total_dolar'],
                    [sequelize.col('sales_state.name'), 'state']
                ],
                include: [
                    {
                        model: SaleState,
                        required: true,
                        attributes: []
                    }
                ],
                where: {
                    state_id: 3
                },
                raw: true
            });

        } catch (error) {
            log.error(error.message);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },

    /**
     * Ruta que muestra todas las ventas por despachar
     * 
     * @returns products
     */
    'sales-pending-dispatch': async function () {
        try {
            return await Sale.findAll({
                attributes: [
                    'id', 'client', 'createdAt', 'updatedAt',
                    [sequelize.literal("total_units || ' UNID'"), 'total_units'],
                    [sequelize.literal("pending_dispatch || ' UNID'"), 'pending_dispatch'],
                    [sequelize.literal("total_dispatched || ' UNID'"), 'total_dispatched'],
                    [sequelize.literal("total_liters || ' LT'"), 'total_liters'],
                    [sequelize.literal("total_caps || ' UNID'"), 'total_caps'],
                    [sequelize.literal("total_bs || ' BsS'"), 'total_bs'],
                    [sequelize.literal("total_dolar || ' $'"), 'total_dolar'],
                    [sequelize.col('sales_state.name'), 'state']
                ],
                include: [
                    {
                        model: SaleState,
                        required: true,
                        attributes: []
                    }
                ],
                where: {
                    state_id: 2
                },
                raw: true
            });

        } catch (error) {
            log.error(error.message);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },

    /**
     * Metodo que crea una nueva venta
     * 
     * @param {Json} params 
     * @returns message
     */
    'create-sale': async function (params = {}) {
        try {
            let sale = await Sale.create(params);
            return { message: "Nueva Venta Creada", code: 1, sale_id: sale.id };

        } catch (error) {
            reportErrors(error);

            if (!empty(error.errors)) {
                log.error(error.errors[0].message);
                return { message: error.errors[0].message, code: 0 };
            }
            else {
                log.error(error.message);
                return { message: error.message, code: 0 };
            }

        }
    },


    /**
     * Metodo que crea una nueva venta
     * 
     * @param {Json} params 
     * @returns message
    */
    'update-client-sale': async function (params) {
        try {

            if (empty(params.client)) throw new Error('Debes definir un cliente');

            let sale = await Sale.findByPk(params.sale_id);
            sale.client = params.client.replace(/\b\w/g, l => l.toUpperCase());
            await sale.save();

            return { message: "Registrado con exito", code: 1 };
        } catch (error) {
            log.error(error.message);
            return { message: error.message, code: 0 };
        }
    },


    /**
     * funcion que muestra una venta
     * 
     * @param {int} id 
     * @returns {json} product
     */
    'show-sale': async function (id) {
        try {
            let sale = await Sale.findByPk(id, { raw: true });

            if (sale === null) throw new Error("Esta venta no existe");

            return sale;

        } catch (error) {
            log.error(error.message);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },

    /**
     * funcion que finaliza una venta
     * 
     * @param {int} id 
     * @returns {json} message
     */
    'finalize-sale': async function (params) {
        try {
            let sale = await Sale.findByPk(params.sale_id);

            if (sale === null) throw new Error("Esta venta no existe");

            if (sale.state_id == 2) throw new Error('Esta Venta ya fue procesada');
            if (sale.state_id == 3) throw new Error('Esta Venta ya fue Despachada');

            if(sale.total_units === 0) {
                throw new Error('No has agregado nada a la venta');
            }

            const regex = /^[+]?\d*\.?\d+$/;

            let payment = new Payment();

            if (empty(params.mobile_payment) && empty(params.cash_bolivares) && empty(params.cash_dollar))
                throw new Error('Debes definir el tipo de pago');

            if (!empty(params.mobile_payment)) {

                if (!regex.test(params.mobile_payment))
                    throw new Error('El monto del pago movil ingresado no es correcto');

                if (empty(params.reference))
                    throw new Error('Debes Ingresar el numero de referencia del pago movil');

                payment.mobile_payment = params.mobile_payment;
                payment.reference = params.reference;
            }

            if (!empty(params.cash_bolivares)) {
                if (!regex.test(params.cash_bolivares))
                    throw new Error('El monto del pago en efectivo no es correcto');

                payment.cash_bolivares = params.cash_bolivares;
            }

            if (!empty(params.cash_dollar)) {
                if (!regex.test(params.cash_dollar))
                    throw new Error('El monto del pago en dolares no es correcto');
                payment.cash_dollar = params.cash_dollar
            }

            payment.sale_id = sale.id;
            await payment.save();

            sale.state_id = 2;
            if (sale.pending_dispatch == 0) {
                sale.state_id = 3;
            }
            await sale.save();

            return { message: 'Venta Finalizada', code: 1 };

        } catch (error) {
            log.error(error.message);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },

    /**
     * funcion que muestra la ultima venta pendiente
     * 
     * @param {int} id 
     * @returns {json} product
     */
    'pending-sale': async function () {
        try {
            let sale = await Sale.findOne({
                where: { state_id: 1 },
                raw: true
            });

            return sale;

        } catch (error) {
            log.error(error.message);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },

    /**
     * funcion que elimina una venta
     * 
     * @param {*} params 
     * @returns message
     */
    'destroy-sale': async function (id) {
        try {

            let sale = await Sale.findByPk(id);

            if (empty(sale)) throw new Error("Esta venta no existe");

            if(sale.state_id != 1) {
                if(! await isAuth()) throw new Error('Usted no esta Autorizado para borrar esta venta');
            }

            await SaleItem.destroy({
                where: {
                    sale_id: sale.id
                },
            });

            await Payment.destroy( {
                where: {
                    sale_id: sale.id
                }
            });

            await sale.destroy();

            return { message: "Venta Cancelada", code: 1 };

        } catch (error) {
            log.error(error);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    }

};

module.exports = Sales;
