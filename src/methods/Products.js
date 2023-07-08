'use strict'

const sequelize = require('sequelize');
const Product = require('../models/Product.js');
const empty = require('../helpers/empty.js');
const log = require('electron-log');
const bcv = require('bcv-divisas');

const Products = {

    /**
     * Ruta que muestra todos los Productos
     * 
     * @returns productss
     */
    'index-products': async function () {
        try {
            return await Product.findAll({
                attributes: [
                    'id', 'name', 'createdAt', 'updatedAt',
                    [sequelize.literal("liters || ' Lt'"), 'liters'],
                    [sequelize.literal("quantity || ' UNID'"), 'quantity'],
                    [sequelize.literal("cap || ' UNID'"), 'cap'],
                    [sequelize.literal("price_bs || ' BsS'"), 'price_bs'],
                    [sequelize.literal("price_dolar || ' $'"), 'price_dolar'],
                ],
                raw: true
            });
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

            if (params.cap > params.quantity) throw new Error('No puedes ingresar mas tapas que porductos');

            let exchange_rate = await bcv.bcvDolar();
            let price_bs = 0
            let price_dolar = 0;

            if (params.is_dolar) {
                price_dolar = params.price;
                price_bs = params.price * exchange_rate._dolar;
            } else {
                price_dolar = parseFloat(params.price / exchange_rate._dolar);
                price_dolar = parseFloat(price_dolar.toFixed(3));

                price_bs = params.price;
            }

            await Product.create({
                name: params.name,
                quantity: params.quantity,
                liters: params.liters,
                price_dolar: price_dolar,
                price_bs: price_bs,
                cap: params.cap,
                is_dolar: params.is_dolar
            });

            return { message: "Agregado con exito", code: 1 };
        } catch (error) {

            if (!empty(error.errors)) {
                log.error(error.errors[0].message);
                return { message: error.errors[0].message, code: 0 };
            }
            else {
                log.error(error.message);
                return { message: error.message, code: 0 };
            }

        }
    },


    /**
     * Ajuste de precio en todos los productos
     * 
     * @param {Json} params 
     * @returns message
     */
    'ajust-products': async function () {
        try {

            let products = await Product.findAll({ raw: true });

            if (products.length == 0) {
                throw new Error('No hay productos registrados');
            }

            let exchange_rate = await bcv.bcvDolar();
            let price_bs = 0;
            let price_dolar = 0;

            products.forEach(async product => {

                if (product.is_dolar) {
                    price_bs = product.price_dolar * exchange_rate._dolar;
                } else {
                    price_dolar = parseFloat(product.price_bs / exchange_rate._dolar);
                    price_dolar = price_dolar.toFixed(3);
                }

                await product.save();
            });

            return { message: "Precios ajustados correctamente", code: 1 };
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

            if (params.quantity < 0) throw new Error('La cantidad del producto no es correcta');
            if (params.liters < 0) throw new Error('La cantidad de litros no es correcta');
            if (params.cap < 0) throw new Error('La cantidad de tapas es incorrecta');

            let product = await Product.findByPk(params.id);

            if (product === null) throw new Error("El producto no existe");

            let exchange_rate = await bcv.bcvDolar();
            let price_bs = 0
            let price_dolar = 0;

            if (params.is_dolar) {
                price_dolar = params.price;
                price_bs = params.price * exchange_rate._dolar;
            } else {
                price_dolar = parseFloat(params.price / exchange_rate._dolar);
                price_dolar = parseFloat(price_dolar.toFixed(3));

                price_bs = params.price;
            }

            product.name = params.name;
            product.quantity =
            product.liters = params.liters;
            product.price_bs = price_bs;
            product.price_dolar = price_dolar;
            product.cap = params.cap;

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
