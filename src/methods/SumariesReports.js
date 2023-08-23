'use strict'

const Sale = require('../models/Sale.js');
const Payment = require('../models/Payment.js');
const log = require('electron-log');
const sequelize = require("../connection.js");
const { Op } = require('sequelize');
const moment = require('moment');
const reportErrors = require('../helpers/reportErrors.js');
const empty = require('../helpers/empty.js');

const Sumaries = {

    /**
     * Metricas 
     * 
     * @returns {json} pago
    */
    'sumary-range-date': async function (params) {
        try {
            /*
            let date = null;

            if (empty(param)) 
                date = moment();
            else 
                date = moment(param);
            
            const start = date.startOf('week').format("YYYY-MM-DD");
            const end = date.endOf('week').format("YYYY-MM-DD");
            */

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
                        /* where: { state_id: 3}. */
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

};

module.exports = Sumaries;
