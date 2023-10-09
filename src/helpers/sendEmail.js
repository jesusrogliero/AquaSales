const nodemailer = require("nodemailer");

let sender = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'othebestlevel@gmail.com',
        pass: 'qhqkayvsbxruball'
    }
});

module.exports = function(mail) {

    sender.sendMail(mail, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email report sent successfully");
        }
    })
}