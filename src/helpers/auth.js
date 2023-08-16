const Admin = require('../models/Admin.js');

module.exports = async function () {
    let admin = await Admin.findOne();
    return admin.isAutenticate;
}
