const { Sequelize } = require('sequelize');
const appdata = require('appdata-path');
const path = require('path');
const hash = require('./helpers/hash.js');
const backup = require('./helpers/GDrive.js');

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: path.join(appdata('AquaSales'), 'aqua.data'),
	logging: false
});

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
	const moment = require('moment');
	let BCV = require('bcv-divisas');

	let exchange = await Exchange.findByPk(1);

	if (exchange == null) {
		let today = moment().format("YYYY-MM-DD");

		let bcv = await BCV.bcvDolar();
		bcv = parseFloat(bcv._dolar);

		exchange = new Exchange();
		exchange.bcv = bcv;
		exchange.date = today;
		await exchange.save();
	}

	backup();
})();

module.exports = sequelize;



