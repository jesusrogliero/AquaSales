const { google } = require('googleapis');
const fs = require('fs');
const appdata = require('appdata-path');
const path = require('path');
const log = require('electron-log');
const reportErrors = require('./reportErrors.js');

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(appdata('AquaSales'), 'credentials.json'),
    scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({
    version: 'v3',
    auth: auth
});


const getDateString = function () {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getFileName = function () {
    return `aqua_backup_${getDateString()}.data`;
};

const getLocalFileSize = function () {
    const filePath = path.join(appdata('AquaSales'), 'aqua.data');
    const stats = fs.statSync(filePath);
    return stats.size;
};

const findFileByName = async function (fileName) {
    const res = await drive.files.list({
        q: `name='${fileName}' and '1ZihgUqvblXhzG3OpdO-UxU5gjPhMTnm_' in parents and trashed=false`,
        fields: 'files(id, name, size)',
        spaces: 'drive'
    });
    return res.data.files.length > 0 ? res.data.files[0] : null;
};

const createFile = async function (fileName) {
    const res = await drive.files.create({
        requestBody: {
            name: fileName,
            mimeType: 'application/octet-stream',
            parents: ['1ZihgUqvblXhzG3OpdO-UxU5gjPhMTnm_']
        },
        media: {
            mimeType: 'application/octet-stream',
            body: fs.createReadStream(path.join(appdata('AquaSales'), 'aqua.data'))
        },
        fields: 'id'
    });
    return res.data.id;
};

const updateFile = async function (file_id, fileName) {
    await drive.files.update({
        fileId: file_id,
        resource: {
            name: fileName
        },
        media: {
            mimeType: 'application/octet-stream',
            body: fs.createReadStream(path.join(appdata('AquaSales'), 'aqua.data'))
        }
    });
};



const init = async function () {
    try {
        if(!global.isPackaged) {
            return;
        }

        const fileName = getFileName();
        const localFileSize = getLocalFileSize();

        // Buscar si ya existe un archivo para hoy
        const existingFile = await findFileByName(fileName);

        if (existingFile == null) {
            // No existe archivo para hoy, crear uno nuevo
            await createFile(fileName);
            log.info(`Backup diario creado: ${fileName}`);
        } else {
            // Existe archivo para hoy, comparar tamaños
            const remoteFileSize = parseInt(existingFile.size);
            
            if (localFileSize >= remoteFileSize) {
                // El archivo local es mayor o igual, sobrescribir
                await updateFile(existingFile.id, fileName);
                log.info(`Backup diario actualizado: ${fileName} (${localFileSize} bytes >= ${remoteFileSize} bytes)`);
            } else {
                // El archivo local es menor, no sobrescribir
                throw new Error(`Backup no actualizado: archivo local es menor (${localFileSize} bytes < ${remoteFileSize} bytes)`);
            }
        }

    } catch (error) {
        log.error(error.message);
        reportErrors(error);
        console.log(error);
    }
}

module.exports = init;

