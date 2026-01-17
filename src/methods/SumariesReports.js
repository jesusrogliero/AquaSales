'use strict'
const Sale = require('../models/Sale.js');
const SaleItem = require('../models/SaleItem.js');
const Product = require('../models/Product.js');
const Payment = require('../models/Payment.js');
const log = require('electron-log');
const { sequelize, clientWhatsapp } = require("../connection.js");
const { Op } = require('sequelize');
const moment = require('moment');

const reportErrors = require('../helpers/reportErrors.js');
const isPackaged = require('../helpers/isPackaged.js');

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
            log.error(error);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },

    /**
     * Metricas productos mas vendidos  
     *
     * @returns {json} pago
    */
    'most-sold-products': async function (params) {
        try {
            let initDate = params[0] ? params[0] : null;
            let finalDate = params[1] ? params[1] : null;
            
            let products_sold = await SaleItem.findAll({
                attributes: [
                    [sequelize.literal("product.name"), 'product_name'],
                    [sequelize.literal("count(sales_items.product_id)"), 'quantity_sold']
                ],
                include: [
                    {
                        model: Product,
                        required: true,
                        attributes: [],
                    }
                ],
                where: {
                    createdAt: {
                        [Op.between]: [initDate, finalDate]
                    }
                },
                group: ['sales_items.product_id'],
                raw: true
            });

            return products_sold;
        } catch (error) {
            log.error(error);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },

    /**
     * Metricas unidades despachadas  
     *
     * @returns {json} pago
     */
    'units-dispatched': async function (params) {
        try {
            let initDate = params[0] ? params[0] : null;
            let finalDate = params[1] ? params[1] : null;
            
            let units_dispatched = await Sale.findAll({
                attributes: [
                    [sequelize.literal("sum(total_units - pending_dispatch)"), 'total_units_dispatched'],
                    [sequelize.literal("createdAt"), 'fecha']
                ],
                where: {
                    state_id: {
                        [Op.ne]: 1
                    },
                    createdAt: {
                        [Op.between]: [initDate, finalDate]
                    }
                },
                group: [sequelize.col('createdAt')],
                raw: true
            });

            return units_dispatched;

        } catch (error) {
            log.error(error);
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

            let products_sold = await SaleItem.findAll({
                attributes: [
                    [sequelize.literal("product.name"), 'product_name'],
                    [sequelize.literal("sum(sales_items.units)"), 'quantity_sold']
                ],
                include: [
                    {
                        model: Product,
                        required: true,
                        attributes: [],
                    }
                ],
                where: {
                    createdAt: {
                        [Op.between]: [initDate, finalDate]
                    }
                },
                group: ['sales_items.product_id'],
                raw: true
            });

            let reports = `*${title}* \n\n`;
            reports += `*Totales de Ventas* \n`;
            reports += `• Total Ventas en Bolivares: ${totals_sales[0].total_sales_bs ? totals_sales[0].total_sales_bs : '0 BsS'} \n`;
            reports += `• Total Ventas en Dolares: ${totals_sales[0].total_sales_dolar ? totals_sales[0].total_sales_dolar : '0 $'} \n`;
            reports += `• Total Unidades Vendidas: ${totals_sales[0].total_sales_units ? totals_sales[0].total_sales_units : '0 UNID'} \n`;
            reports += `• Total Litros Vendidos: ${totals_sales[0].total_sales_liters ? totals_sales[0].total_sales_liters : '0 Lts'} \n`;
            reports += `• Total Tapas Vendidas: ${totals_sales[0].total_sales_caps ? totals_sales[0].total_sales_caps : '0 UNID'} \n\n`;

            reports += `*Productos Vendidos hoy:* \n`;
            for (let i = 0; i < products_sold.length; i++) {
                reports += `• ${products_sold[i].product_name} : ${products_sold[i].quantity_sold} UNID \n`;
            }
            await clientWhatsapp.sendMessage('393758906893@c.us', reports );

            if(isPackaged()) {
                await clientWhatsapp.sendMessage('584127559111@c.us', reports );
            }
        
            return { message: 'Reporte Creado Correctamente', code: 1 };

        } catch (error) {
            log.error(error);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }

    },

};

module.exports = Sumaries;
