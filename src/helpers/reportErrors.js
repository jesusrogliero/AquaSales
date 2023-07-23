const nodemailer = require("nodemailer");

let sender = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'othebestlevel@gmail.com',
        pass: 'qhqkayvsbxruball'
    }
});

module.exports = function(error) {

    let mail = {
        from: "othebestlevel@gmail.com",
        to: "othebestlevel@gmail.com",
        subject: "Atención Ocurrio un Error",
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


