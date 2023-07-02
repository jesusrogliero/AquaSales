const { Sequelize } = require('sequelize');
const appdata = require('appdata-path');
const path = require('path');


/*
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join( appdata('sbms'), 'sbms.data'),
  logging: false
});
*/

const sequelize = new Sequelize('sqlite::memory:', { logging: true });

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
		{ name: 'Generada' },
		{ name: 'Pendiente' },
		{ name: 'Despachada' },
	]).then(e => console.log);

})();

module.exports = sequelize;



