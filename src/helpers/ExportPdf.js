const pdf = require("pdf-creator-node");
const fs = require("fs");
const path = require("path");


module.exports = function(data, report) {
    let rutaCarpeta = path.join(require('os').homedir(), 'Desktop', 'reportes')
    
    if (!fs.existsSync(rutaCarpeta)) {
        fs.mkdir(rutaCarpeta, { recursive: true }, (error) => {console.log(error)});
    } 

    let html = fs.readFileSync(path.join(__dirname, "./reports/" + report), "utf8");

    let options = {
        format: "A4",
        orientation: "portrait",
    };
    
    let document = {
        html: html,
        data: data,
        path: path.join(require('os').homedir(), 'Desktop', 'reportes', data.title + '.pdf'),
        type: "",
    };

    pdf
    .create(document, options)
    .then((res) => {
        console.log(res);
    })
    .catch((error) => {
        console.error(error);
    });
}

