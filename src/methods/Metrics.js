'use strict'

const Sale = require('../models/Sale.js');
const Payment = require('../models/Payment.js');
const log = require('electron-log');
const sequelize = require("../connection.js");
const { Op } = require('sequelize');
const moment = require('moment');
const reportErrors = require('../helpers/reportErrors.js');

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
            reportErrors(error);
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
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },

    /**
    * Metricas los ingresos
    * 
    * @returns {json} litros
    */
    'icomes-metrics': async function () {
        try {
            const today = moment().format("YYYY-MM-DD");
            const initWeek = moment().startOf('isoWeek').format("YYYY-MM-DD");
            const initMonth = moment().startOf('month').format("YYYY-MM-DD");

            let today_icomes = await Payment.findAll({
                attributes: [
                    [sequelize.literal("sum(mobile_payment)"), 'mobile_payment_icome'],
                    [sequelize.literal("sum(cash_dollar)"), 'cash_dollar_icome'],
                    [sequelize.literal("sum(cash_bolivares)"), 'cash_bolivares_icome'],
                ],
                include: [
                    {
                        model: Sale,
                        required: true,
                        attributes: []
                    }
                ],
                where: {
                    state_id: sequelize.col('sale.state_id'),
                    createdAt: moment().format("YYYY-MM-DD")
                },
                raw: true
            });


            let week_icome = await Payment.findAll({
                attributes: [
                    [sequelize.literal("sum(mobile_payment)"), 'mobile_payment_icome'],
                    [sequelize.literal("sum(cash_dollar)"), 'cash_dollar_icome'],
                    [sequelize.literal("sum(cash_bolivares)"), 'cash_bolivares_icome'],
                ],
                include: [
                    {
                        model: Sale,
                        required: true,
                        attributes: []
                    }
                ],
                where: {
                    state_id: sequelize.col('sale.state_id'),
                    createdAt: {
                        [Op.between]: [initWeek, today],
                    }
                },
                raw: true
            });

            let month_icome = await Payment.findAll({
                attributes: [
                    [sequelize.literal("sum(mobile_payment)"), 'mobile_payment_icome'],
                    [sequelize.literal("sum(cash_dollar)"), 'cash_dollar_icome'],
                    [sequelize.literal("sum(cash_bolivares)"), 'cash_bolivares_icome'],
                ],
                include: [
                    {
                        model: Sale,
                        required: true,
                        attributes: []
                    }
                ],
                where: {
                    state_id: sequelize.col('sale.state_id'),
                    createdAt: {
                        [Op.between]: [initMonth, today],
                    }
                },
                raw: true
            });

            return {
                today_icomes: today_icomes[0],
                week_icome: week_icome[0],
                month_icome: month_icome[0]
            };
        } catch (error) {
            log.error(error.message);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },


    /**
     * Metricas de Ventas
     * 
     * @returns {json} pago
     */
    'total-sales': async function () {
        try {
            const today = moment().format("YYYY-MM-DD");
            const initWeek = moment().startOf('isoWeek').format("YYYY-MM-DD");
            const initMonth = moment().startOf('month').format("YYYY-MM-DD");

            let sale_today = await Payment.findAll({
                attributes: [
                    [sequelize.literal("( sum(mobile_payment) + sum(cash_bolivares) )  || ' BsS' "), 'today_sales_bs'],
                    [sequelize.literal("sum(cash_dollar) || ' $' "), 'today_sales_dolar'],
                    [sequelize.literal("sum(total_units) || ' UNID' "), 'today_sales_units'],

                ],
                include: [
                    {
                        model: Sale,
                        required: true,
                        attributes: [],
                    }
                ],
                where: {
                    createdAt: today
                },
                raw: true
            });

            let sale_week = await Payment.findAll({
                attributes: [
                    [sequelize.literal("( sum(mobile_payment) + sum(cash_bolivares) )  || ' BsS' "), 'lastweek_sales_bs'],
                    [sequelize.literal("sum(cash_dollar) || ' $' "), 'lastweek_sales_dolar'],
                    [sequelize.literal("sum(total_units) || ' UNID' "), 'lastweek_sales_units'],
                ],
                include: [
                    {
                        model: Sale,
                        required: true,
                        attributes: [],
                    }
                ],
                where: {
                    createdAt: {
                        [Op.between]: [initWeek, today],
                    }
                },
                raw: true
            });

            let sale_mounth = await Payment.findAll({
                attributes: [
                    [sequelize.literal("( sum(mobile_payment) + sum(cash_bolivares) )  || ' BsS' "), 'lastmonth_sales_bs'],
                    [sequelize.literal("sum(cash_dollar) || ' $' "), 'lastmonth_sales_dolar'],
                    [sequelize.literal("sum(total_units) || ' UNID' "), 'lastmonth_sales_units'],
                ],
                include: [
                    {
                        model: Sale,
                        required: true,
                        attributes: [],
                    }
                ],
                where: {
                    createdAt: {
                        [Op.between]: [initMonth, today],
                    }
                },
                raw: true
            });


            return {
                sale_today: sale_today[0],
                sale_week: sale_week[0],
                sale_mounth: sale_mounth[0]
            };

        } catch (error) {
            reportErrors(error);
            log.error(error.message);
            return { message: error.message, code: 0 };
        }
    },


    /**
    * Porcentaje de ventas 
    * 
    * @returns {json} pago
    */
    'variacion-sales': async function (period) {
        try {

            // Calculo data del periodo actual
            let nowinitDate = null;
            let nowfinalDate = null;

            if (period == 'WEEK') {
                nowfinalDate = moment().format("YYYY-MM-DD");
                nowinitDate = moment().startOf('isoWeek').format("YYYY-MM-DD");
            } else if (period === 'MOUNTH') {
                nowinitDate = moment().startOf('month').format("YYYY-MM-DD");
                nowfinalDate = moment().format("YYYY-MM-DD");
            } else { // HOY
                nowinitDate = moment().format("YYYY-MM-DD");
                nowfinalDate = moment().format("YYYY-MM-DD");
            }


            let now_sales = await Payment.findAll({
                attributes: [
                    [sequelize.literal("sum(mobile_payment) + sum(cash_bolivares)"), 'sales_bs'],
                    [sequelize.literal("sum(cash_dollar)"), 'sales_dolar'],
                    [sequelize.literal("sum(total_units)"), 'sales_units'],
                ],
                include: [
                    {
                        model: Sale,
                        required: true,
                        attributes: [],
                    }
                ],
                where: {
                    createdAt: {
                        [Op.between]: [nowinitDate, nowfinalDate],
                    }
                },
                raw: true
            });


            // Calculo data del periodo pasado
            let lastInitDate = null;
            let lastFinalDate = null;

            if (period == 'WEEK') {
                lastInitDate = moment().subtract(1, 'weeks').startOf('week').format("YYYY-MM-DD");
                lastFinalDate = moment().subtract(1, 'weeks').endOf('week').format("YYYY-MM-DD");

            } else if (period === 'MOUNTH') {
                lastInitDate = moment().subtract(1, 'months').startOf('month').format("YYYY-MM-DD");
                lastFinalDate = moment().subtract(1, 'months').endOf('month').format("YYYY-MM-DD");
            } else { // HOY
                lastInitDate = moment().subtract(1, 'days').startOf('day').format("YYYY-MM-DD");
                lastFinalDate = moment().subtract(1, 'days').endOf('day').format("YYYY-MM-DD");
            }


            let last_sales = await Payment.findAll({
                attributes: [
                    [sequelize.literal("sum(mobile_payment) + sum(cash_bolivares)"), 'sales_bs'],
                    [sequelize.literal("sum(cash_dollar)"), 'sales_dolar'],
                    [sequelize.literal("sum(total_units)"), 'sales_units'],
                ],
                include: [
                    {
                        model: Sale,
                        required: true,
                        attributes: [],
                    }
                ],
                where: {
                    createdAt: {
                        [Op.between]: [lastInitDate, lastFinalDate],
                    }
                },
                raw: true
            });

            let diferenciaBs = now_sales[0].sales_bs - last_sales[0].sales_bs;
            let diferenciaUSD = now_sales[0].sales_dolar - last_sales[0].sales_dolar;
            let diferenciaUNIT = now_sales[0].sales_units - last_sales[0].sales_units;

            let variacionBsS = ((diferenciaBs / last_sales[0].sales_bs) * 100);
            let variacionUSD = ((diferenciaUSD / last_sales[0].sales_dolar) * 100);
            let variacionUNIT = ((diferenciaUNIT / last_sales[0].sales_units) * 100);

            return {
                variacionBsS: isNaN(variacionBsS) ? 0 : variacionBsS.toFixed(0),
                variacionUSD: isNaN(variacionUSD) ? 0 : variacionUSD.toFixed(0),
                variacionUNIT: isNaN(variacionUNIT) ? 0 : variacionUNIT.toFixed(0)
            };

        } catch (error) {
            reportErrors(error);
            log.error(error.message);
            return { message: error.message, code: 0 };
        }
    }



};

module.exports = Metrics;
