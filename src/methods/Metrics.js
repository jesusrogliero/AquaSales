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
     * Metricas de litos Despachados
     * 
     * @returns {json} litros
     */
    'liters-dispatch': async function () {
        try {
            const today = moment().format("YYYY-MM-DD");
            const initWeek = moment().startOf('isoWeek').format("YYYY-MM-DD");
            const initMonth = moment().startOf('month').format("YYYY-MM-DD");

            let today_liters = await Sale.findAll({
                attributes: [
                    [sequelize.literal("sum(total_liters)"), 'today_liters_consumption'],
                ],
                where: {
                    state_id: 3,
                    createdAt: moment().format("YYYY-MM-DD")
                },
                raw: true
            });


            let week_liters = await Sale.findAll({
                attributes: [
                    [sequelize.literal("sum(total_liters)"), 'lastweek_liters_consumption'],
                ],
                where: {
                    state_id: 3,
                    createdAt: {
                        [Op.between]: [initWeek, today],
                    }
                },
                raw: true
            });

            let month_liters = await Sale.findAll({
                attributes: [
                    [sequelize.literal("sum(total_liters)"), 'lastmonth_liters_consumption'],
                ],
                where: {
                    state_id: 3,
                    createdAt: {
                        [Op.between]: [initMonth, today],
                    }
                },
                raw: true
            });

            return {
                today_liters_consumption: today_liters[0].today_liters_consumption,
                lastweek_liters_consumption: week_liters[0].lastweek_liters_consumption,
                lastmonth_liters_consumption: month_liters[0].lastmonth_liters_consumption
            };
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
