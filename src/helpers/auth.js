const Admin = require('../models/Admin.js');

module.exports = async function () {
    let admin = await Admin.findByPk(1);
    return admin.isAutenticate;
}
