const { app, BrowserWindow, dialog, Menu, globalShortcut } = require('electron');
const { autoUpdater } = require('electron-updater');
const { Notification } = require('electron')

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
		title: `AquaSales - V${app.getVersion()}`,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			devTools: app.isPackaged,
		},
	});

	win.maximize();
	win.setMenuBarVisibility(false)
	win.loadFile(dirs.public + 'index.html');

	// Modo produccion
	if (app.isPackaged) {
		Menu.setApplicationMenu(null);
		
	 	globalShortcut.register('CommandOrControl+Shift+I', () => false);
		globalShortcut.register('CommandOrControl+Shift+J', () => false);
		globalShortcut.register('F12', () => false);
		globalShortcut.register('CommandOrControl+R', () => false);
		globalShortcut.register('F5', () => false);

	} else {
		console.log('Modo desarrollo');
	}

	// cargando el listado de archivos
	const fs = require('fs');
	fs.readdir(dirs.methods, (error, files) => {
		if (!error) loadMethods(files);
		else console.error(error);
	});

	win.once('ready-to-show', async () => {
	
		autoUpdater.allowDowngrade = true;
		autoUpdater.autoRunAppAfterInstall = true;
		autoUpdater.autoDownload = true;
		
		if(app.isPackaged) {
			autoUpdater.checkForUpdates();
		}	
		
		win.show();
	});


	autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
		const dialogOpts = {
			type: 'info',
			buttons: ['Reiniciar', 'Mas Tarde'],
			title: 'Actualizacion Disponible',
			message: process.platform === 'win32' ? releaseNotes : releaseName,
			detail: 'Se ha descargado una nueva versión del sistema'
		}

		dialog.showMessageBox(dialogOpts).then((returnValue) => {
			if (returnValue.response === 0) autoUpdater.quitAndInstall()
		})
	});


	autoUpdater.on('update-available', (info) => {
		new Notification({
			title: `AquaSales V${info.version}`,
			body: 'HAY UNA ACTUALIZACION DISPONIBLE'
		}).show()
	});

};

app.whenReady().then(() => main());

