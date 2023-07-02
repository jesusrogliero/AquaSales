'use strict'

const empty = require('../helpers/empty.js');
const sequelize = require('sequelize');
const log = require('electron-log');
const SaleItem = require('../models/SaleItem.js');
const Sale = require('../models/Sale.js');
const Product = require('../models/Product.js');

const SaleItems = {

	/**
	 * Ruta que muestra todos los recursos
	 * 
	 * @returns items
	 */
	'index-items': async function (sale_id) {
		try {
			return await SaleItem.findAll({
				attributes: [
					'id', 'createdAt', 'updatedAt',
					[sequelize.col('product.name'), 'product_name'],
					[sequelize.literal("caps || ' UNID'"), 'caps'],
					[sequelize.literal("sales_items.liters || ' LT'"), 'liters'],
					[sequelize.literal("units || ' UNID'"), 'units'],
					[sequelize.literal("total_bs || ' BsS'"), 'total_bs'],
					[sequelize.literal("total_dolar || ' $'"), 'total_dolar'],

				],
				include: [
					{
						model: Product,
						required: true,
						attributes: []
					}
				],
				where: { sale_id: sale_id },
				raw: true
			});

		} catch (error) {
			log.error(error);
			return { message: error.message, code: 0 };
		}
	},



	/**
	 * Metodo que crea un nuevo recurso
	 * 
	 * @param {Json} params 
	 * @returns message
	 */
	'create-item': async function (params) {

		try {

			const sale = await Sale.findOne({
				where: { id: params.sale_id }
			});

			if (sale.state_id == 2) throw new Error('Esta Venta ya fue procesada');

			const product = await Product.findOne({
				where: { id: params.product_id }
			});

			if (empty(product)) throw new Error('El producto no existe');

			let total_dolar = product.price_dolar * params.quantity;
			let total_bs = product.price_bs * params.quantity;

			let item = await SaleItem.create({
				sale_id: sale.id,
				product_id: params.product_id,
				quantity: params.quantity,
				total_bs: total_bs,
				total_dolar: total_dolar,
				caps: product.cap * params.quantity,
				liters: product.liters * params.quantity,
				units: params.quantity * product.quantity
			});

			sale.total_dolar = sale.total_dolar + item.total_dolar;
			sale.total_bs = sale.total_bs + item.total_bs;
			sale.total_units = sale.total_units + item.units;
			sale.total_caps = sale.total_caps + product.cap;
			sale.total_liters = sale.total_liters + item.liters;

			await sale.save();
			return { message: "Agregado con exito", code: 1 };

		} catch (error) {
			if (!empty(error.errors)) {
				log.error(error.errors[0]);
				return { message: error.errors[0].message, code: 0 };
			} else {
				log.error(error);
				return { message: error.message, code: 0 };
			}

		}
	},


	/**
	 * funcion que muestra un recurso
	 * 
	 * @param {int} id 
	 * @returns {json} price
	 */
	'show-item': async function (id) {
		try {
			let item = await SaleItem.findByPk(id, { raw: true });

			if (empty(item)) throw new Error("Este producto no existe");

			return item;

		} catch (error) {
			log.error(error);
			return { message: error.message, code: 0 };
		}
	},


	/**
	 * funcion que elimina un recurso
	 * 
	 * @param {*} params 
	 * @returns message
	 */
	'destroy-item': async function (id) {
		try {

			const item = await SaleItem.findByPk(id);

			if (empty(item)) throw new Error("Este producto no existe");

			const sale = await Sale.findByPk(item.sale_id);

			if (sale.state_id == 2) throw new Error('Esta Venta ya fue procesada');

			// actualizo la orden
			sale.total_dolar = sale.total_dolar - item.total_dolar;
			sale.total_bs = sale.total_bs - item.total_bs;
			sale.total_units = sale.total_units - item.units;
			sale.total_liters = sale.total_liters - item.liters;
			sale.total_caps = sale.total_caps - item.caps;

			item.destroy();
			sale.save();

			return { message: "Eliminado Correctamente", code: 1 };

		} catch (error) {
			log.error(error);
			return { message: error.message, code: 0 };
		}
	}
};

module.exports = SaleItems;