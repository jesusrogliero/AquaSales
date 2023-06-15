'use strict'

const Product = require('../models/Product.js');
const empty = require('../helpers/empty.js');
const log = require('electron-log');

const Products = {

    /**
     * Ruta que muestra todos los Productos
     * 
     * @returns productss
     */
    'index-products': async function () {
        try {
            return await Product.findAll({ raw: true });
        } catch (error) {
            log.error(error.message);
            return { message: error.message, code: 0 };
        }
    },



    /**
     * Metodo que crea un nuevo producto
     * 
     * @param {Json} params 
     * @returns message
     */
    'create-product': async function (params) {
        try {

            const new_product = await Product.create({
                name: params.name,
                liters: params.liters,
                price_dolar: params.price_dolar,
                price_bs: params.price_bs
            });

            return { message: "Agregado con exito", code: 1 };
        } catch (error) {

            if (!empty(error.errors)) {
                log.error(error.errors[0].message);
                return { message: error.errors[0].message, code: 0 };
            }
            else {
                log.error(error.errors[0].message);
                return { message: error.message, code: 0 };
            }

        }
    },


    /**
     * funcion que muestra un producto
     * 
     * @param {int} id 
     * @returns {json} product
     */
    'show-product': async function (id) {
        try {
            let product = await Product.findByPk(id, { raw: true });

            if (product === null) throw new Error("Este producto no existe");

            return product;

        } catch (error) {
            log.error(error.message);
            return { message: error.message, code: 0 };
        }
    },


    /**
     * funcion que actualiza un producto
     * 
     * @param {*} params 
     * @returns message
     */
    'update-product': async function (params) {

        try {
            if (empty(params.name)) throw new Error("El nombre del producto es obligatorio");
            if (empty(params.liters)) throw new Error("Los litros del producto es obligatorio");
            if (empty(params.price_dolar)) throw new Error("El precio en Dolares es obligatorio");
            if (empty(params.price_bs)) throw new Error("El precio en Bs es obligatorio");

            let product = await Product.findByPk(params.id);

            if (product === null) throw new Error("El producto no existe");

            product.name = params.name;
            product.liters = params.liters;
            product.price_bs = params.price_bs;
            product.price_dolar = params.price_dolar;

            await product.save();

            return { message: "Actualizado Correctamente", code: 1 };

        } catch (error) {
            log.error(error.message);
            return { message: error.message, code: 0 };
        }
    },



    /**
     * funcion que elimina un producto
     * 
     * @param {*} params 
     * @returns message
     */
    'destroy-product': async function (id) {
        try {
            let product = await Product.findByPk(id);

            if (product === null) throw new Error("Este producto no existe");

            product.destroy();

            return { message: "Eliminado Correctamente", code: 1 };

        } catch (error) {
            log.error(error.message);
            return { message: error.message, code: 0 };
        }
    }
};

module.exports = Products;
