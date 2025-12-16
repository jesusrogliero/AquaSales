'use strict'

const Sale = require('../models/Sale.js');
const Payment = require('../models/Payment.js');
const log = require('electron-log');
const { sequelize, clientWhatsapp } = require("../connection.js");
const { Op, QueryTypes } = require('sequelize');
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
            log.error(error);
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

            let Query = `
            select 
            sum((sales_items.liters / sales_items.units) * sales_items.dispatched ) as today_liters_consumption
            from sales 
            INNER join sales_items ON sales.id = sales_items.sale_id 
            where sales_items.updatedAt = "${today}"
            `

            const today_liters = await sequelize.query(Query, { type: QueryTypes.SELECT, raw: true });


            Query = `
            select 
            sum((sales_items.liters / sales_items.units) * sales_items.dispatched ) as lastweek_liters_consumption
            from sales 
            INNER join sales_items ON sales.id = sales_items.sale_id 
            where sales_items.updatedAt BETWEEN "${initWeek}" AND "${today}"
            `

            const week_liters = await sequelize.query(Query, { type: QueryTypes.SELECT, raw: true });


            Query = `
            select 
            sum((sales_items.liters / sales_items.units) * sales_items.dispatched ) as lastmonth_liters_consumption
            from sales 
            INNER join sales_items ON sales.id = sales_items.sale_id 
            where sales_items.updatedAt BETWEEN "${initMonth}" AND "${today}" 
            `

            const month_liters = await sequelize.query(Query, { type: QueryTypes.SELECT, raw: true });

            return {
                today_liters_consumption: today_liters[0].today_liters_consumption,
                lastweek_liters_consumption: week_liters[0].lastweek_liters_consumption,
                lastmonth_liters_consumption: month_liters[0].lastmonth_liters_consumption
            };
        } catch (error) {
            log.error(error);
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
            log.error(error);
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
            log.error(error);
            return { message: error.message, code: 0 };
        }
    },

     /**
     * Metricas de Ventas precendentes
     * 
     * @returns {json} pago
     */
    'previous-sales': async function () {
        try {
            const today = moment().subtract(1, 'days').format("YYYY-MM-DD");
            const initWeek = moment().subtract(1, 'weeks').startOf('isoWeek').format("YYYY-MM-DD");
            const initMonth = moment().subtract(1, 'months').startOf('month').format("YYYY-MM-DD");

            let sale_today = await Payment.findAll({
                attributes: [
                    [sequelize.literal("sum(total_units) || ' UNID' "), 'previous_sales_units'],

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
                    [sequelize.literal("sum(total_units) || ' UNID' "), 'previous_week_units'],
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
                    [sequelize.literal("sum(total_units) || ' UNID' "), 'previous_month_units']
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
                previous_sales: sale_today[0].previous_sales_units,
                previous_week: sale_week[0].previous_week_units,
                previous_month: sale_mounth[0].previous_month_units
            };

        } catch (error) {
            reportErrors(error);
            log.error(error);
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

            // Calculo data del periodo anterior (mismo rango de días)
            let lastInitDate = null;
            let lastFinalDate = null;

            if (period == 'WEEK') {
                // Comparar desde lunes hasta el mismo día de la semana pasada
                const dayOfWeek = moment().isoWeekday(); // 1=lunes, 7=domingo
                lastInitDate = moment().subtract(1, 'weeks').startOf('isoWeek').format("YYYY-MM-DD");
                lastFinalDate = moment().subtract(1, 'weeks').startOf('isoWeek').add(dayOfWeek - 1, 'days').format("YYYY-MM-DD");
            } else if (period === 'MOUNTH') {
                // Comparar desde día 1 hasta el mismo día del mes pasado
                const dayOfMonth = moment().date();
                lastInitDate = moment().subtract(1, 'months').startOf('month').format("YYYY-MM-DD");
                lastFinalDate = moment().subtract(1, 'months').startOf('month').add(dayOfMonth - 1, 'days').format("YYYY-MM-DD");
            } else { // HOY
                lastInitDate = moment().subtract(1, 'days').format("YYYY-MM-DD");
                lastFinalDate = moment().subtract(1, 'days').format("YYYY-MM-DD");
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

            let variacionBsS = last_sales[0].sales_bs === 0 ? 0 : ((diferenciaBs / last_sales[0].sales_bs) * 100);
            let variacionUSD = last_sales[0].sales_dolar === 0 ? 0 : ((diferenciaUSD / last_sales[0].sales_dolar) * 100);
            let variacionUNIT = last_sales[0].sales_units === 0 ? 0 : ((diferenciaUNIT / last_sales[0].sales_units) * 100);

            // Check for infinity
            variacionBsS = isFinite(variacionBsS) ? variacionBsS : 100;
            variacionUSD = isFinite(variacionUSD) ? variacionUSD : 100;
            variacionUNIT = isFinite(variacionUNIT) ? variacionUNIT : 100;

            return {
                variacionBsS: isNaN(variacionBsS) ? 0 : variacionBsS.toFixed(0),
                variacionUSD: isNaN(variacionUSD) ? 0 : variacionUSD.toFixed(0),
                variacionUNIT: isNaN(variacionUNIT) ? 0 : variacionUNIT.toFixed(0)
            };

        } catch (error) {
            log.error(error);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    }

};

module.exports = Metrics;
