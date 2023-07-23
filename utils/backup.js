const moment = require("moment");
const nodemailer = require("nodemailer");
const appdata = require('appdata-path');
const path = require('path');

let sender = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'othebestlevel@gmail.com',
        pass: 'qhqkayvsbxruball'
    }
});

module.exports = function() {

    let mail = {
        from: "othebestlevel@gmail.com",
        to: "othebestlevel@gmail.com",
        subject: "Copia de Seguridad AquaSales: " + moment().format("YYYY-MM-DD"),
        text: "Base de datos del sistema de la embotelladora",
        attachments: [
            {
                filename: 'aqua.data',
                path:  path.join(appdata('AquaSales'), 'aqua.data'),
                cid: 'aqua.data'
            }
        ]
    };

    sender.sendMail(mail, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email backup sent successfully");
        }
    })
}
