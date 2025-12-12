const whatsappjs = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const qrcode = require('qrcode'); // Para generar imágenes QR
const path = require('path');
const { BrowserWindow } = require('electron');
const log = require('electron-log');

const { Client, LocalAuth } = whatsappjs;

let qrWindow = null;

const createQRWindow = async (qrData) => {
    // Cerrar ventana anterior si existe
    if (qrWindow) {
        qrWindow.close();
    }

    // Crear nueva ventana
    qrWindow = new BrowserWindow({
        width: 400,
        height: 600,
        title: 'Escanea el código QR',
        resizable: false,
        webPreferences: {
            nodeIntegration: true
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

// Configurar ruta de Puppeteer para app empaquetada
const puppeteerOptions = { 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
};

// Si la app está empaquetada, especificar ruta al ejecutable de Chrome
if (global.isPackaged) {
    puppeteerOptions.executablePath = path.join(
        process.resourcesPath,
        'app.asar.unpacked',
        'node_modules',
        'puppeteer-core',
        '.local-chromium',
        'win64-1045629',
        'chrome-win',
        'chrome.exe'
    );

}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: puppeteerOptions,
    takeoverOnConflict: true
});

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
        qrWindow = null;
    }
});

client.on('auth_failure', msg => {
    log.error('AUTHENTICATION FAILURE', msg);
    if (qrWindow) {
        qrWindow.close();
        qrWindow = null;
    }
});

client.on('ready', async () => {
     log.info('READY');
    await client.sendMessage('393758906893@c.us', 'Sistema Embotelladora iniciado 🚀');
    await client.sendMessage('584127559111@c.us', 'Sistema Embotelladora iniciado 🚀');
});


client.on('disconnected', (reason) => {
    log.warn('Client was logged out', reason);
});

module.exports = client;