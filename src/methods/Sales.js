'use strict'

const Sale = require('../models/Sale.js');
const SaleItem = require('../models/SaleItem.js');
const SaleState = require('../models/SaleState.js');
const empty = require('../helpers/empty.js');
const log = require('electron-log');
const sequelize = require('sequelize');

const Sales = {

    /**
     * Ruta que muestra todas las ventas
     * 
     * @returns products
     */
    'index-sales': async function () {
        try {
            return await Sale.findAll({
                attributes: [
                    'id', 'client', 'createdAt', 'updatedAt',
                    [sequelize.literal("total_units || ' UNID'"), 'total_units'],
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
                raw: true
            });

        } catch (error) {
            log.error(error.message);
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

            return { message: "Agregado con exito", code: 1, sale_id: sale.id };
        } catch (error) {

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
            return { message: error.message, code: 0 };
        }
    },

    /**
     * funcion que elimina un producto
     * 
     * @param {*} params 
     * @returns message
     */
    'destroy-sale': async function (id) {
        try {

            let sale = await Sale.findByPk(id);

            if (empty(sale)) throw new Error("Esta venta no existe");

            if (sale.state_id == 2) throw new Error('Esta Venta ya fue Procesada');

            let items = await SaleItem.findAll({
                where: {
                    sale_id: sale.id
                },
            });

            if (items.length != 0)
                await items.destroy();

            await sale.destroy();

            return { message: "Venta Cancelada", code: 1 };

        } catch (error) {
            log.error(error);
            return { message: error.message, code: 0 };
        }
    }

};

module.exports = Sales;
