const { Sequelize } = require('sequelize');
const appdata = require('appdata-path');
const path = require('path');
const hash = require('./helpers/hash.js');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage:  path.join(appdata('AquaSales'), 'aqua.data'),
  logging: false
});

/*
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'aqua.data',
  logging: false
});

const sequelize = new Sequelize('sqlite::memory:', { logging: true });
*/

const seeds = async function (Model, data) {
	try {
		for (let i = 0; i < data.length; i++) {
			await Model.findOrCreate({
				where: data[i]
			});
		}
	} catch (error) {
		console.log(error);
	}
};


(async () => {
	await sequelize.sync();

	await seeds(require('./models/SaleState.js'), [
		{ name: 'Pendiente' },
		{ name: 'Pendiente por Despachar' },
		{ name: 'Despachada' },
	]).then(e => console.log);

	await seeds(require('./models/Admin.js'), [
		{ 
			name: 'Leonardo',
			password: await hash.hash('Leo2022', 10)
		},
	]).then(e => console.log);

	let Exchange = require('./models/Exchange.js');
	let moment = require('moment');
	let BCV = require('bcv-divisas');

	let today = moment().format("YYYY-MM-DD");

	let exchange = await Exchange.findByPk(1);

	if(exchange == null) {
		let bcv = await BCV.bcvDolar();
		bcv =  parseFloat(bcv._dolar);

		exchange = new Exchange();
		exchange.bcv = bcv;
		await exchange.save();
	}
	else if(exchange.updatedAt != today) {
		let bcv = await BCV.bcvDolar();
		bcv =  parseFloat(bcv._dolar);

		exchange.bcv = bcv;
		await exchange.save();
	}

})();

module.exports = sequelize;



