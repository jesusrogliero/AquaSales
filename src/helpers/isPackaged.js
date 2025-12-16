const { app } = require('electron');

/**
 * Verifica si la aplicación está empaquetada (en producción)
 * @returns {boolean} true si está empaquetada, false si está en desarrollo
 */
const isPackaged = () => {
    return app.isPackaged;
};

module.exports = isPackaged;
