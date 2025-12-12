const { Sequelize } = require('sequelize');
const appdata = require('appdata-path');
const path = require('path');
const hash = require('./helpers/hash.js');
const backup = require('./helpers/GDrive.js');
const log = require('electron-log');
const reportErrors = require('./helpers/reportErrors.js');
const axios = require('axios');

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
		log.error(error.message);
		reportErrors(error);
	}
};


(async () => {
	await sequelize.sync();

	await seeds(require('./models/SaleState.js'), [
		{ name: 'Pendiente' },
		{ name: 'Pendiente por Despachar' },
		{ name: 'Despachada' },
	]).then(e => console.log);

	await createAdmin();
	await checkExchange();
	await backup();
})();


const createAdmin = async function () {
	const Admin = require('./models/Admin.js');

	let admin = await Admin.findOne();

	if (admin == null) {
		admin = new Admin();
		admin.name = 'Leonardo';
		admin.password = await hash.hash('Leo5839', 10);
		await admin.save();
	}
}

const checkExchange = async function () {
    try {
        let Exchange = require('./models/Exchange.js');
        const moment = require('moment');

        let exchange = await Exchange.findByPk(1);

        if (exchange == null) {
            let today = moment().format("YYYY-MM-DD");
            if (exchange.date != today) {
                const response = await axios.get('https://ve.dolarapi.com/v1/dolares/oficial');
                let bcv = parseFloat(response.data.promedio);
                exchange = new Exchange();
                exchange.bcv = bcv;
                exchange.date = today;
                await exchange.save();
            }
        }
    } catch (error) {
        log.error(error.message);
        reportErrors(error);
    }
};

module.exports = sequelize;



