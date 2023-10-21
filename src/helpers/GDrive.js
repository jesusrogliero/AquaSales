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


const createFile = async function () {
    const res = await drive.files.create({
        requestBody: {
            name: 'aqua.data',
            mimeType: 'application/octet-stream',
            parents: ['1ZihgUqvblXhzG3OpdO-UxU5gjPhMTnm_']
        },
        media: {
            mimeType: 'application/octet-stream',
            body: fs.createReadStream(path.join(appdata('AquaSales'), 'aqua.data'))
        },
        fields: ['id']
    });
    return res.data.id;
};

const updateFile = async function (file_id) {
    await drive.files.update({
        fileId: file_id,
        resource: {
            name: 'aqua.data'
        },
        media: {
            mimeType: 'application/octet-stream',
            body: fs.createReadStream(path.join(appdata('AquaSales'), 'aqua.data'))
        }
    });
};



const init = async function () {
    try {
        const BackupDrive = require('../models/BackupDrive.js');

        let file = await BackupDrive.findOne();

        if (file == null) {
            let file_id = await createFile();

            file = new BackupDrive();
            file.file_id = file_id;
            await file.save();
        }else {
            await updateFile(file.file_id)
        }

    } catch (error) {
        log.error(error.message);
        reportErrors(error);
        console.log(error);
    }
}

module.exports = init;

