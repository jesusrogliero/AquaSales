'use strict'

const empty = require('../helpers/empty.js');
const sequelize = require('sequelize');
const log = require('electron-log');
const SaleItem = require('../models/SaleItem.js');
const Sale = require('../models/Sale.js');
const Product = require('../models/Product.js');
const reportErrors = require('../helpers/reportErrors.js');

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
					[sequelize.literal("pending_dispatch || ' UNID'"), 'pending_dispatch'],
					[sequelize.literal("dispatched || ' UNID'"), 'dispatched']
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
			reportErrors(error);
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
			if (empty(params.quantity)) throw new Error('Debes ingresar la cantidad a vender');
			if (params.quantity < 1) throw new Error('Debes ingresar una cantidad correcta');

			const sale = await Sale.findOne({
				where: { id: params.sale_id }
			});

			if (sale.state_id == 2) throw new Error('Esta Venta ya fue procesada');
			if (sale.state_id == 3) throw new Error('Esta Venta ya fue Despachada');

			const product = await Product.findOne({
				where: { id: params.product_id }
			});

			if (empty(product)) throw new Error('El producto no existe');

			let total_dolar = parseFloat( (product.price_dolar * params.quantity).toFixed(2) );
			let total_bs = product.price_bs * params.quantity;


			let pending_dispatch = params.quantity * product.quantity;
			let dispatched = 0;

			if(!product.is_combo) {
				pending_dispatch = 0;
				dispatched = params.quantity * product.quantity;
			}

			let item = await SaleItem.create({
				sale_id: sale.id,
				product_id: params.product_id,
				quantity: params.quantity,
				total_bs: total_bs,
				total_dolar: total_dolar,
				caps: product.cap * (params.quantity * product.quantity),
				liters: product.liters * params.quantity,
				units: params.quantity * product.quantity,
				pending_dispatch: pending_dispatch,
				dispatched: dispatched
			});

			sale.total_dolar = sale.total_dolar + item.total_dolar;
			sale.total_dolar = sale.total_dolar.toFixed(2);
			sale.total_bs = sale.total_bs + item.total_bs;
			sale.total_bs = sale.total_bs.toFixed(2);
			sale.total_units = sale.total_units + item.units;
			sale.total_caps = sale.total_caps + item.caps;
			sale.total_liters = sale.total_liters + item.liters;
			sale.pending_dispatch = sale.pending_dispatch + item.pending_dispatch;
			sale.total_dispatched = sale.total_dispatched + item.dispatched;

			await sale.save();
			return { message: "Agregado con exito", code: 1 };

		} catch (error) {
			if (!empty(error.errors)) {
				log.error(error.errors[0]);
				return { message: error.errors[0].message, code: 0 };
			} else {
				log.error(error);
				reportErrors(error);
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
			reportErrors(error);
			return { message: error.message, code: 0 };
		}
	},


	/**
	 * funcion que ajusta los productos despachados
	 * 
	 * @param {*} params 
	 * @returns message
	 */
	'dispatch-item': async function (params) {
		try {

			const item = await SaleItem.findByPk(params.id);

			if (empty(item)) throw new Error("Este producto no existe");

			const sale = await Sale.findByPk(item.sale_id);

			if (sale.state_id == 3) throw new Error('Esta venta ya fue Despachada');

			if (params.dispatch < 1) throw new Error('Debe introducir la cantidad a despachar correcta');
			params.dispatch = parseInt(params.dispatch);

			if (params.dispatch > item.pending_dispatch) throw new Error('La cantidad que introdujo es mayor a la cantidad pendiente por despachar')

			item.dispatched = item.dispatched + params.dispatch;
			item.pending_dispatch = item.pending_dispatch - params.dispatch;

			sale.pending_dispatch = sale.pending_dispatch - params.dispatch;
			sale.total_dispatched = sale.total_dispatched + params.dispatch;

			if (sale.total_units == sale.total_dispatched && sale.state_id === 2) {
				sale.state_id = 3;
			}

			await item.save();
			await sale.save();

			return { message: "Actualizado Correctamente", code: 1 };

		} catch (error) {
			log.error(error);
			reportErrors(error);
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
			if (sale.state_id == 3) throw new Error('Esta Venta ya fue Despachada');

			// actualizo la orden
			sale.total_dolar = sale.total_dolar - item.total_dolar;
			sale.total_bs = sale.total_bs - item.total_bs;
			sale.total_units = sale.total_units - item.units;
			sale.total_liters = sale.total_liters - item.liters;
			sale.total_caps = sale.total_caps - item.caps;
			sale.pending_dispatch = sale.pending_dispatch - item.pending_dispatch;
			sale.total_dispatched = sale.total_dispatched - item.dispatched;

			await item.destroy();
			await sale.save();

			return { message: "Eliminado Correctamente", code: 1 };

		} catch (error) {
			log.error(error);
			reportErrors(error);
			return { message: error.message, code: 0 };
		}
	}
};

module.exports = SaleItems;