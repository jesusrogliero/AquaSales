'use strict'

const AdminModel = require('../models/Admin.js');
const log = require('electron-log');
const Hash = require('../helpers/hash.js');
const reportErrors = require('../helpers/reportErrors.js');

const Admin = {

    /**
     * Obtener el nombre del admin
     * 
     * @returns {json} name
     */
    'get-admin-name': async function () {
        try {
            let data = await AdminModel.findOne({
                attributes: ['name'],
                raw: true
            });

            return data;
        } catch (error) {
            log.error(error);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },

    /**
     * Autenticacion del admin
     * 
     * @returns {Boolean} isAdmin
     */
    'admin-autenticate': async function (password) {
        try {
            let admin = await AdminModel.findOne();

            let isPassowrd = await Hash.checkHash(password, admin.password);

            if(!isPassowrd) {
                throw new Error('Contraseña incorrecta');
            }
            
            admin.isAutenticate = true;
            await admin.save();

            return isPassowrd;
        } catch (error) {
            log.error(error);
            reportErrors(error);
            return { message: error.message, code: 0 };
        }
    },

    /**
     * cierre de sesion
     * 
     * @returns {string} message
     */
    'logout': async function () {
        try {
            let admin = await AdminModel.findOne();
            admin.isAutenticate = false;
            await admin.save();

            return "Sesión Cerrada";
        } catch (error) {
            reportErrors(error);
            log.error(error);
            return { message: error.message, code: 0 };
        }
    },

};

module.exports = Admin;
