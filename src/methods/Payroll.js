'use strict'

const sequelize = require('sequelize');
const Payroll = require('../models/Payroll.js');
const Employe = require('../models/Employe.js');
const empty = require('../helpers/empty.js');
const log = require('electron-log');
const reportErrors = require('../helpers/reportErrors.js');

const Payrolls = {

    /**
     * Ruta que muestra la nomina
     * 
     * @returns payroll
     */
    'index-payrolls': async function () {
        try {
            return await Payroll.findAll({
                attributes: [
                    'id', 'createdAt', 'updatedAt',
                    [sequelize.col('employe.name'), 'employe_name'],
                    [sequelize.literal("payment_bs || ' BsS'"), 'payment_bs'],
                    [sequelize.literal("payment_dolar || ' $'"), 'payment_dolar'],
                    [sequelize.literal("discount_bs || ' BsS'"), 'discount_bs'],
                    [sequelize.literal("discount_dolar || ' $'"), 'discount_dolar'],
                    [sequelize.literal("(payment_bs - discount_bs) || ' BsS'"), 'total_bs'],
                    [sequelize.literal(" (payment_dolar - discount_dolar) || ' $'"), 'total_dolar'],
                ],
                include: [
                    {
                        model: Employe,
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
     * Metodo que crea un registro de nomina
     * 
     * @param {Json} params 
     * @returns message
     */
    'create-payroll': async function (params) {
        try {

            await Payroll.create({
                employe_id: params.employe_id,
                payment_bs: params.payment_bs,
                payment_dolar: params.payment_dolar,
                discount_dolar: params.discount_dolar,
                discount_bs: params.discount_bs
            });

            return { message: "Agregado con exito", code: 1 };
        } catch (error) {

            if (!empty(error.errors)) {
                log.error(error.errors[0].message);
                return { message: error.errors[0].message, code: 0 };
            }
            else {
                log.error(error);
                reportErrors(error);
                return { message: error.message, code: 0 };
            }

        }
    },

    /**
     * funcion que muestra detalles de una nomina
     * 
     * @param {int} id 
     * @returns {json} payroll
     */
    'show-payroll': async function (id) {
        try {
            let payroll = await Payroll.findByPk(id, { raw: true });

            if (payroll === null) throw new Error("Esta nomina no existe");

            return payroll;

        } catch (error) {
            log.error(error);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },


    /**
     * funcion que actualiza la nomina
     * 
     * @param {*} params 
     * @returns message
     */
    'update-payroll': async function (params) {
        try {
            if (! await isAuth()) throw new Error('Usted no esta Autorizado');

            if (empty(params.employe_id)) throw new Error("El empleado es obligatorio");

            if (params.payment_bs < 0) throw new Error('El pago en bolivares no puede ser negativo');
            if (params.payment_dolar < 0) throw new Error('El pago en dolares no puede ser negativo');
            if (params.discount_dolar < 0) throw new Error('El descuento en dolares no puede ser negativo');
            if (params.discount_bs < 0) throw new Error('El descuento en bolivares no puede ser negativo');

            let payroll = await Payroll.findByPk(params.id);

            if (payroll === null) throw new Error("La nomina no existe");

            payroll.employe_id = params.employe_id;
            payroll.payment_bs = params.payment_bs;
            product.payment_dolar = params.payment_dolar;
            product.discount_bs = params.discount_bs;
            product.discount_dolar = params.discount_dolar;

            await employe_id.save();

            return { message: "Actualizado Correctamente", code: 1 };

        } catch (error) {
            log.error(error);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },


    /**
     * funcion que elimina un producto
     * 
     * @param {*} params 
     * @returns message
     */
    'destroy-payroll': async function (id) {
        try {
            if (! await isAuth()) throw new Error('Usted no esta Autorizado');

            let payroll = await Payroll.findByPk(id);

            if (payroll === null) throw new Error("La nomina no existe");

            await payroll.destroy();

            return { message: "Eliminado Correctamente", code: 1 };

        } catch (error) {
            log.error(error);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    }
};

module.exports = Payrolls;
