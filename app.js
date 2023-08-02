const { app, BrowserWindow, dialog } = require('electron');
const { NsisUpdater, autoUpdater } = require('electron-updater');

const { loadMethods } = require('./methods');
const dirs = require('./dirs');
const path = require('path');
const appdata = require('appdata-path');
const log = require('electron-log').transports.file.resolvePath = () => path.join(appdata('AquaSales'), 'AquaSales.log');



// funcion de inicio de la aplicacion
const main = function () {

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

	win.once('ready-to-show', async () => {
		win.show();

		// actualizador
		//await new NsisUpdater().checkForUpdatesAndNotify();
	});

	autoUpdater.on('checking-for-update', () => {
		win.webContents.send('message', 'Checking for update...');
	});

	autoUpdater.on('update-available', (info) => {
		win.webContents.send('message', 'Update available.');
	});

	autoUpdater.on('update-not-available', (info) => {
		win.webContents.send('Update not available.');
	});

	autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
		const dialogOpts = {
			type: 'info',
			buttons: ['Restart', 'Later'],
			title: 'Actualizacion Disponible',
			message: process.platform === 'win32' ? releaseNotes : releaseName,
			detail:'Se ha descargado una nueva versión. Reinicia la aplicación para aplicar las actualizaciones.'
		}

		dialog.showMessageBox(dialogOpts).then((returnValue) => {
			if (returnValue.response === 0) autoUpdater.quitAndInstall()
		})
	});

	autoUpdater.on('error', (err) => {
		win.webContents.send('Error in auto-updater. ' + err);
	});
};

app.whenReady().then(() => main());

