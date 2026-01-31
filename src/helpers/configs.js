const fs = require('fs');
const path = require('path');
const appdata = require('appdata-path');

class ConfigManager {
    constructor() {
        this.config = null;
        this.configPath = null;
        this.appName = 'AquaSales';
    }

    /**
     * Inicializa y carga la configuración desde AppData
     * @param {string} configFileName - Nombre del archivo de configuración (por defecto: config.json)
     * @returns {Object} Configuración cargada
     */
    load(configFileName = 'config.json') {
        try {
            // Crear ruta a la carpeta de la aplicación en AppData
            const appConfigDir = appdata(this.appName);
            this.configPath = path.join(appConfigDir, configFileName);

            // Crear directorio si no existe
            if (!fs.existsSync(appConfigDir)) {
                fs.mkdirSync(appConfigDir, { recursive: true });
            }

            // Si no existe el archivo de configuración, crear uno por defecto
            if (!fs.existsSync(this.configPath)) {
                this.createDefaultConfig();
            }

            // Leer y parsear el archivo de configuración
            const configData = fs.readFileSync(this.configPath, 'utf-8');
            this.config = JSON.parse(configData);

            console.log(`✓ Configuración cargada desde: ${this.configPath}`);
            return this.config;
        } catch (error) {
            console.error('Error al cargar la configuración:', error);
            throw error;
        }
    }

    /**
     * Crea un archivo de configuración por defecto
     */
    createDefaultConfig() {
        const defaultConfig = {
            whatsappCacheTemp: "",
            adminPhone: "",
            clientPhone: "",
            mailUser: "",
            passSmtpPassword: ""
        };

        fs.writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 4), 'utf-8');
        console.log(`✓ Archivo de configuración por defecto creado en: ${this.configPath}`);
    }

    /**
     * Obtiene un valor de configuración por clave
     * @param {string} key - Clave de configuración (ej: 'adminPhone', 'mailUser')
     * @param {*} defaultValue - Valor por defecto si no existe la clave
     * @returns {*} Valor de configuración
     */
    get(key, defaultValue = null) {
        if (!this.config) {
            throw new Error('La configuración no ha sido cargada. Ejecuta load() primero.');
        }

        return this.config[key] !== undefined ? this.config[key] : defaultValue;
    }

    /**
     * Recarga la configuración desde el archivo
     */
    reload() {
        return this.load();
    }
}

// Crear instancia global
const configManager = new ConfigManager();

// Exportar tanto la instancia como la clase
module.exports = configManager;
module.exports.ConfigManager = ConfigManager;

