'use strict'

const AdminModel = require('../models/Admin.js');
const log = require('electron-log');
const Hash = require('../helpers/hash.js');

const Admin = {

    /**
     * Obtener el nombre del admin
     * 
     * @returns {json} name
     */
    'get-admin-name': async function () {
        try {
            let data = await AdminModel.findByPk(1,{
                attributes: ['name'],
                raw: true
            });

            return data;
        } catch (error) {
            log.error(error.message);
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
            let admin = await AdminModel.findByPk(1);

            let isPassowrd = await Hash.checkHash(password, admin.password);

            return isPassowrd;
        } catch (error) {
            log.error(error.message);
            return { message: error.message, code: 0 };
        }
    },

};

module.exports = Admin;