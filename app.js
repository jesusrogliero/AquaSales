const { app, BrowserWindow } = require('electron');
const { loadMethods } = require('./methods');
const dirs = require('./dirs');
const path = require('path');
const appdata = require('appdata-path');
const log = require('electron-log').transports.file.resolvePath = () => path.join(appdata('sbms'), 'sbms-log.log');

// funcion de inicio de la aplicacion
const main = function () {

	const nodemailer = require("nodemailer");

	let sender = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'othebestlevel@gmail.com',
			pass: 'qhqkayvsbxruball'
		}
	});

	let mail = {
		from: "othebestlevel@gmail.com",
		to: "othebestlevel@gmail.com",
		subject: "Copia de Seguridad AquaSales",
		text: "Base de datos del sistema de la embotelladora",
		attachments: [
			{
				filename: 'aqua.data',
				path: __dirname + '/aqua.data',
				cid: 'aqua.data'
			}
		]
	};

	sender.sendMail(mail, function (error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log("Email sent successfully: "
				+ info.response);
		}
	});

	// cargando ventana
	const win = new BrowserWindow({
		show: false,
		minWidth: 1110,
		minHeight: 900,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	win.maximize();
	win.setMenuBarVisibility(false)
	win.loadFile(dirs.public + 'index.html');


	// cargando el listado de archivos
	const fs = require('fs');
	fs.readdir(dirs.methods, (error, files) => {
		if (!error) loadMethods(files);
		else console.error(error);
	});

	win.once('ready-to-show', () => {
		win.show();
	});

};

app.whenReady().then(() => main());

