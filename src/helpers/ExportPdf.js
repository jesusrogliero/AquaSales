const { promisify } = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const path = require("path");
const appdata = require('appdata-path');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const mkdir = promisify(fs.mkdir);
const chmod = promisify(fs.chmod);
const sendEmail = require('./sendEmail.js');
const moment = require('moment');

module.exports = async function (fileReportHtml, data) {

    let templatePath = path.join(appdata('AquaSales'), 'reportes', fileReportHtml);

    const templateHtml = await readFile(templatePath, 'utf8');
    const template = handlebars.compile(templateHtml);
    const html = template(data);
    console.log(data)
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);

    let rutaCarpeta = path.join(appdata('AquaSales'), 'reportesPDF');

    if (!fs.existsSync(rutaCarpeta)) {
        await mkdir(rutaCarpeta, { recursive: true });
        await chmod(rutaCarpeta, 0o777);
        console.log('Carpeta creada y permisos establecidos.');
    }

    let pdf = path.join(rutaCarpeta, '/reporte' + moment().format("YYYY-MM-DD") + '.pdf');

    await page.pdf({
        path: pdf,
        format: 'A4',
    });

    await browser.close();


    sendEmail({
        from: "othebestlevel@gmail.com",
        to: 'othebestlevel@gmail.com, leorogliero@hotmail.com',
        subject: `Reporte de Ventas ${moment().format("YYYY-MM-DD")}`,
        text: `Estimado Leonardo Rogliero,

        Me complace informarte que el sistema de ventas ha generado y enviado automáticamente el resumen de ventas. Este informe detalla las ventas realizadas, los ingresos generados y otros datos relevantes.
        `,
        attachments: [{
            filename: 'resumen_de_ventas.pdf',
            path: pdf
        }]
    });

}



