'use strict'

const Sale = require('../models/Sale.js');
const log = require('electron-log');
const sequelize = require("../connection.js");
const { Op } = require('sequelize');
const moment = require('moment');

const Metrics = {


    /**
     * Metricas de Ventas
     * 
     * @returns {json} pago
     */
    'pending-dispatch': async function () {
        try {
            let data = await Sale.findAll({
                attributes: [
                    [sequelize.literal("sum(pending_dispatch)"), 'pending_dispatch'],  
                ],
                raw: true
            });

            return data[0];
        } catch (error) {
            log.error(error.message);
            return { message: error.message, code: 0 };
        }
    },

    /**
     * Metricas de Ventas
     * 
     * @returns {json} pago
     */
    'metrics-sales-today': async function () {
        try {
            let data = await Sale.findAll({
                attributes: [
                    [sequelize.literal("sum(total_bs)"), 'today_sales_bs'],
                    [sequelize.literal("sum(total_dolar)"), 'today_sales_dolar'],
                    [sequelize.literal("sum(total_units)"), 'today_sales_units'],
                ],
                where: {
                    createdAt: moment().format("YYYY-MM-DD")
                },
                raw: true
            });

            return data[0];
        } catch (error) {
            log.error(error.message);
            return { message: error.message, code: 0 };
        }
    },

    /**
     * Metricas de Ventas
     * 
     * @returns {json} pago
     */
    'metrics-sales-lastweek': async function () {
        try {

            const initWeek = moment().startOf('isoWeek').format("YYYY-MM-DD");
            const today = moment().format("YYYY-MM-DD");

            let data = await Sale.findAll({
                attributes: [
                    [sequelize.literal("sum(total_bs)"), 'lastweek_sales_bs'],
                    [sequelize.literal("sum(total_dolar)"), 'lastweek_sales_dolar'],
                    [sequelize.literal("sum(total_units)"), 'lastweek_sales_units'],
                ],
                where: {
                    createdAt: {
                        [Op.between]: [initWeek, today],
                    }
                },
                raw: true
            });

            return data[0];

        } catch (error) {
            log.error(error.message);
            return { message: error.message, code: 0 };
        }
    },


    /**
     * Metricas de Ventas
     * 
     * @returns {json} pago
     */
    'metrics-sales-lastmonth': async function () {
        try {

            const initMonth = moment().startOf('month').format("YYYY-MM-DD");
            const today = moment().format("YYYY-MM-DD");

            let data = await Sale.findAll({
                attributes: [
                    [sequelize.literal("sum(total_bs)"), 'lastmonth_sales_bs'],
                    [sequelize.literal("sum(total_dolar)"), 'lastmonth_sales_dolar'],
                    [sequelize.literal("sum(total_units)"), 'lastmonth_sales_units'],
                ],
                where: {
                    createdAt: {
                        [Op.between]: [initMonth, today],
                    }
                },
                raw: true
            });

            return data[0];

        } catch (error) {
            log.error(error.message);
            return { message: error.message, code: 0 };
        }
    },

};

module.exports = Metrics;