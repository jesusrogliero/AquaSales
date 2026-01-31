const nodemailer = require("nodemailer");
const config = require('./configs');

let sender = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.get('mailUser'),
        pass: config.get('passSmtpPassword')
    }
});

module.exports = function(error) {

    let mail = {
        from: config.get('mailUser'),
        to: config.get('mailUser'),
        subject: "Reporte Error: " + error.message,
        text: error.message
    };

    sender.sendMail(mail, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email report sent successfully");
        }
    })
}


