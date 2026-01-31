const whatsappjs = require('whatsapp-web.js');
const qrcode = require('qrcode'); // Para generar imágenes QR
const path = require('path');
const { BrowserWindow } = require('electron');
const log = require('electron-log');
const fs = require('fs');
const isPackaged = require('./isPackaged');
const appdata = require('appdata-path');
const reportErrors = require('./reportErrors');
const config = require('./configs');

const { Client, LocalAuth } = whatsappjs;

let qrWindow = null;

const createQRWindow = async (qrData) => {
    // Cerrar ventana anterior si existe
    if (qrWindow && !qrWindow.isDestroyed()) {
        qrWindow.close();
    }

    // Crear nueva ventana
    qrWindow = new BrowserWindow({
        width: 400,
        height: 600,
        title: 'Escanea el código QR',
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            devTools: false
        }
    });

    // Generar QR como data URL (imagen en base64)
    const qrDataUrl = await qrcode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    });

    // Crear HTML como cadena
    const html = `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
            background: #f0f0f0;
            height: 100vh;
        }
        h2 { color: #25D366; margin-bottom: 20px; }
        img { border: 2px solid #25D366; border-radius: 10px; max-width: 300px; }
        p { text-align: center; color: #666; margin-top: 15px; }
    </style>
</head>
<body>
    <h2>WhatsApp - AquaSales</h2>
    <img src="${qrDataUrl}" alt="QR Code">
    <p>Escanea este código con WhatsApp</p>
</body>
</html>`;

    // Cargar HTML con el QR (codificado correctamente)
    qrWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));

    qrWindow.on('closed', () => {
        qrWindow = null;
    });
};

// Si la app está empaquetada, especificar ruta al ejecutable de Chrome
// Buscar Chrome/Chromium instalado en el equipo (preferencia) y usarlo cuando esté empaquetada
// Sólo Windows: buscar rutas comunes de instalación de Chrome/Chromium/Edge.
function findSystemChrome() {
    const candidates = [];
    const env = process.env;
    const programFiles = env.PROGRAMFILES;
    const programFilesx86 = env['PROGRAMFILES(X86)'];
    const programW6432 = env.PROGRAMW6432;
    const localAppData = env.LOCALAPPDATA;

    // Rutas típicas en Program Files / Program Files (x86)
    [programFiles, programFilesx86, programW6432].forEach(base => {
        if (!base) return;
        candidates.push(path.join(base, 'Chromium', 'Application', 'chrome.exe'));
    });

    // Rutas en el perfil del usuario
    if (localAppData) {
        candidates.push(path.join(localAppData, 'Chromium', 'Application', 'chrome.exe'));
    }

    // Comprueba existencia y retorna la primera encontrada
    for (const c of candidates) {
        try {
            if (c && fs.existsSync(c)) return c;
        } catch (e) {
            log.error('Error checking Chrome path:', c, e);
            reportErrors(e);
        }
    }
    return null;
}

// Configuración del cliente WhatsApp
const getWhatsappConfig = () => {

    let whatsappConfig = {
        authStrategy: new LocalAuth({
            dataPath: path.join(appdata('AquaSales'), 'whatsapp-auth')
        }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-popup-blocking']
        },
        takeoverOnConflict: true,
    }

    const cacheTemp = config.get('whatsappCacheTemp');
    if (cacheTemp) {
        whatsappConfig.webVersionCache = {
            type: 'remote',
            remotePath: cacheTemp,
        };
    }

    if (isPackaged()) {
        const systemChrome = findSystemChrome();
        if (systemChrome) {
            whatsappConfig.puppeteer.executablePath = systemChrome;
            log.info('Using system Chrome for puppeteer:', systemChrome);
        } else {
            log.warn('No system Chrome/Chromium found. Puppeteer will try default bundled executable.');
            reportErrors(new Error('No system Chrome/Chromium found for WhatsApp Web client.'));
        }
    }

    return whatsappConfig;
}
const client = new Client(getWhatsappConfig());
client.initialize();

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
    log.info('LOADING SCREEN', percent, message);
});

client.on('qr', async (qr) => {
    await createQRWindow(qr);
    log.info('QR RECEIVED', qr);
});

client.on('authenticated', () => {
    log.info('AUTHENTICATED');
    // Cerrar ventana QR al autenticar
    if (qrWindow) {
        qrWindow.close();
    }
});

client.on('auth_failure', msg => {
    log.error('AUTHENTICATION FAILURE', msg);
    if (qrWindow) {
        qrWindow.close();
    }
});

client.on('ready', async () => {
    log.info('READY');

    const adminPhone = config.get('adminPhone');
    const clientPhone = config.get('clientPhone');

    await client.sendMessage(adminPhone, 'Sistema Embotelladora iniciado 🚀');

    const currentHour = new Date().getHours();
    if (isPackaged() && currentHour >= 8 && currentHour <= 10) {
       await client.sendMessage(clientPhone, 'Sistema Embotelladora iniciado 🚀');
    }
});


client.on('disconnected', (reason) => {
    log.warn('Client was logged out', reason);
});

module.exports = client;