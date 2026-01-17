const { app, BrowserWindow, dialog, Menu, globalShortcut } = require('electron');
const { autoUpdater } = require('electron-updater');
const { Notification } = require('electron')

const { loadMethods, executeMethod } = require('./methods');
const { clientWhatsapp } = require('./src/connection.js');
const dirs = require('./dirs');
const path = require('path');
const appdata = require('appdata-path');
const log = require('electron-log').transports.file.resolvePathFn = () => path.join(appdata('AquaSales'), 'AquaSales.log');

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
			await autoUpdater.checkForUpdates();
			setInterval(async () => {
				await autoUpdater.checkForUpdates();
			}, 3600000); 
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
		});
	});


	autoUpdater.on('update-available', (info) => {
		const dialogOpts = {
			type: 'info',
			buttons: ['Ok'],
			title: 'Actualizacion Disponible',
			message: `Version ${info.version} disponible`,
			detail: 'Se está descargando la nueva versión en segundo plano.'
		}
		dialog.showMessageBox(dialogOpts);

		new Notification({
			title: `AquaSales V${info.version}`,
			body: `HAY UNA ACTUALIZACION DISPONIBLE - DESCARGANDO...`
		}).show()
	});

};

// Variable para controlar si ya se mostró el diálogo
let isQuitting = false;

// Enviar reporte antes de cerrar la aplicación
app.on('before-quit', async (event) => {
	if (app.isPackaged && !isQuitting) {
		event.preventDefault(); // Prevenir el cierre inmediato
		isQuitting = true; // Marcar que estamos en proceso de cierre
		
		// Obtener la ventana principal
		const mainWindow = BrowserWindow.getAllWindows()[0];
		
		// Mostrar diálogo de confirmación
		const dialogOpts = {
			type: 'question',
			buttons: ['Sí', 'No'],
			defaultId: 0,
			title: 'Finalizar Día de Trabajo',
			message: '¿Ha finalizado el día de trabajo?',
			detail: 'Si responde Sí, se enviará el reporte del día por WhatsApp.'
		};
		
		const { response } = await dialog.showMessageBox(mainWindow, dialogOpts);
		
		// Si el usuario responde "Sí" (botón 0)
		if (response === 0) {
			try {
				const moment = require('moment');
				
				// Enviar mensaje de cierre
				const dateReport = moment().format('YYYY-MM-DD HH:mm:ss');
				const closeMessage = `*Sistema Cerrado*\n\nEl sistema se ha cerrado a las ${dateReport}\n\nGenerando reporte del día... 📊`;
				
				await clientWhatsapp.sendMessage('393758906893@c.us', closeMessage);
				await clientWhatsapp.sendMessage('584127559111@c.us', closeMessage);
				
				// Llamar al método que genera y envía el reporte completo usando executeMethod
				await executeMethod({ name: 'sumary-report', params: 'TODAY' });
				
				console.log('Reporte de cierre enviado por WhatsApp');
			} catch (error) {
				console.error('Error al enviar reporte de cierre:', error);
			}
		}
		
		app.exit(); // Cerrar la aplicación
	}
});

app.whenReady().then(() => main());

