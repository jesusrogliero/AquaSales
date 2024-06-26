'use strict'

const Sale = require('../models/Sale.js');
const Payment = require('../models/Payment.js');
const log = require('electron-log');
const sequelize = require("../connection.js");
const { Op } = require('sequelize');
const moment = require('moment');
const reports = require("../helpers/server_export.js");

const reportErrors = require('../helpers/reportErrors.js');
const createPdfFromTemplate = require('../helpers/ExportPdf.js');

const Sumaries = {

    /**
     * Metricas 
     * 
     * @returns {json} pago
    */
    'sumary-range-date': async function (params) {
        try {
            let option = {
                attributes: [
                    sequelize.col('payment.createdAt'),
                    [sequelize.literal("sum(mobile_payment) || ' BsS' "), 'mobile_payment'],
                    [sequelize.literal("sum(cash_dollar) || ' $' "), 'cash_dollar'],
                    [sequelize.literal("sum(cash_bolivares) || ' BsS' "), 'cash_bolivares'],
                    [sequelize.literal("sum(total_units) || ' UNID' "), 'sales_units'],
                    [sequelize.literal("sum(total_liters) || ' Lts' "), 'liters_consumption'],
                    [sequelize.literal("sum(total_caps) || ' UNID' "), 'total_caps'],
                ],
                group: [sequelize.col('payment.createdAt')],
                include: [
                    {
                        model: Sale,
                        required: true,
                        attributes: [],
                    }
                ],
                where: {
                    createdAt: moment().format("YYYY-MM-DD")
                },
                raw: true
            };

            if (params.length > 0) {
                if (params.length == 2) {
                    option.where.createdAt = {
                        [Op.between]: [params[0], params[1]],
                    }
                } else {
                    option.where.createdAt = params[0];
                }
            }

            let data = await Payment.findAll(option);
            return data;

        } catch (error) {
            log.error(error.message);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },

    /**
     * Metricas 
     * 
     * @returns {json} pago
    */
    'sumary-report': async function (period) {

        try {
            let initDate = null;
            let finalDate = null;
            let title = "";

            if (period == 'WEEK') {
                finalDate = moment().format("YYYY-MM-DD");
                initDate = moment().startOf('isoWeek').format("YYYY-MM-DD");
                title = `Resumen de Venta de esta semana`;
            } else if (period === 'MOUNTH') {
                initDate = moment().startOf('month').format("YYYY-MM-DD");
                finalDate = moment().format("YYYY-MM-DD");
                title = `Resumen de Venta de este mes`;
            } else { // HOY
                initDate = moment().format("YYYY-MM-DD");
                finalDate = moment().format("YYYY-MM-DD");
                title = `Resumen de Venta de hoy`;
            }

            let option = {
                attributes: [
                    sequelize.col('payment.createdAt'),
                    [sequelize.literal("sum(mobile_payment) || ' BsS' "), 'mobile_payment'],
                    [sequelize.literal("sum(cash_dollar) || ' $' "), 'cash_dollar'],
                    [sequelize.literal("sum(cash_bolivares) || ' BsS' "), 'cash_bolivares'],
                    [sequelize.literal("sum(total_units) || ' UNID' "), 'sales_units'],
                    [sequelize.literal("sum(total_liters) || ' Lts' "), 'liters_consumption'],
                    [sequelize.literal("sum(total_caps)  || ' UNID' "), 'total_caps'],
                ],
                //group: [sequelize.col('payment.createdAt')],
                include: [
                    {
                        model: Sale,
                        required: true,
                        attributes: [],
                    }
                ],
                where: {
                    createdAt: {
                        [Op.between]: [initDate, finalDate]
                    }
                },
                raw: true
            };

            let sales = await Payment.findAll(option);

            let totals_sales = await Payment.findAll({
                attributes: [
                    [sequelize.literal("( sum(mobile_payment) + sum(cash_bolivares) )  || ' BsS' "), 'total_sales_bs'],
                    [sequelize.literal("sum(cash_dollar) || ' $' "), 'total_sales_dolar'],
                    [sequelize.literal("sum(total_units) || ' UNID' "), 'total_sales_units'],
                    [sequelize.literal("sum(total_liters)  || ' Lts' "), 'total_sales_liters'],
                    [sequelize.literal("sum(total_caps)  || ' UNID' "), 'total_sales_caps'],
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
                        [Op.between]: [initDate, finalDate]
                    }
                },
                raw: true
            });



            let params = {
                title: title,
                sales: sales,
                totals_sales: totals_sales
            };
            await reports("report_whatsapp", params);
        
            return { message: 'Reporte Creado Correctamente', code: 1 };

        } catch (error) {
            log.error(error.message);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }

    },

    /**
    * Resumen de ventas del dia detallado 
    * 
    * @returns {json} datalle de venta
   */
    'sumary-today': async function (period) {

        try {

            let option = {
                attributes: [
                    sequelize.col('payment.createdAt'),
                    [sequelize.literal("sum(mobile_payment) || ' BsS' "), 'mobile_payment'],
                    [sequelize.literal("sum(cash_dollar) || ' $' "), 'cash_dollar'],
                    [sequelize.literal("sum(cash_bolivares) || ' BsS' "), 'cash_bolivares'],
                    [sequelize.literal("sum(total_units) || ' UNID' "), 'sales_units'],
                    [sequelize.literal("sum(total_liters) || ' Lts' "), 'liters_consumption'],
                    [sequelize.literal("sum(total_caps)  || ' UNID' "), 'total_caps'],
                ],
                group: [sequelize.col('payment.createdAt')],
                include: [
                    {
                        model: Payment,
                        required: true,
                        attributes: [],
                    }
                ],
                where: {
                    createdAt: moment().format("YYYY-MM-DD")
                },
                raw: true
            };

            let sales = await Sale.findAll(option);


            await createPdfFromTemplate('sumarySales.html', {
                title: `Resumen de Venta`,
                sales: sales,
                totals_sales: totals_sales
            });

            return { message: 'Reporte Creado Correctamente', code: 1 };

        } catch (error) {
            log.error(error.message);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }

    },

};

module.exports = Sumaries;
