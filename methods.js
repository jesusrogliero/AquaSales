const { ipcMain } = require('electron');
const { Queue } = require('./utils/queue');
const sleep = require('./utils/sleep');
const dirs = require('./dirs');
const log = require('electron-log');
const methodsLoaded = {};
const nodes = Queue();


ipcMain.setMaxListeners(50);

const loadMethods = function (files) {
  try {
    for (const file of files) {
      const methodsFile = require(dirs.methods + file);

      for (const [name, method] of Object.entries(methodsFile)) {
        if (methodsLoaded[name])
          throw `Disculpe el siguiente metodo (${name}) ha sido repetido`;

        if (typeof method !== 'function')
          throw 'Disculpe intento agregar un atributo que no es un metodo';

        methodsLoaded[name] = method;
      }
    }

    const methods = Object.keys(methodsLoaded);
    console.log(`Methods loaded ${methods.length}`);

    return methods;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// funcion que se encarga de crear una cola de procesos
const executeMethod = async function ({ name, params }) {
  try {
    // agregando una identidad al metodo a ejecutar
    const key = `${Date.now()}-${Math.random()}-${nodes.size()}`;
    nodes.add({ params, name, key });

    // realizando la espera 10ms evaluando si la llamada fue realizada
    while (!nodes.empty() && nodes.front().key !== key) {
      await sleep(10);
    }

    const current = nodes.front();
    log.info('Method executing...\n', { name: current.name, params: current.params }, '\n\n');

    const method = methodsLoaded[current.name];
    if (!method) throw 'Disculpe el metodo no ha sido encontrado';

    const startTime = Date.now();
    const response = method.constructor.name === 'AsyncFunction' 
      ? await method(current.params)
      : method(current.params);

    const time = Date.now() - startTime;
    return { response, time };
  } catch (error) {
    log.error(error);
    console.error(error);
    throw error;
  } finally {
    nodes.pop();
  }
};

// respondiendo a la solicitud emitida
ipcMain.on('asynchronous-execute-send', async (event, arg) => {
  const { idp } = arg;
  try {
    const response = await executeMethod(arg);
    event.reply('asynchronous-execute-response', { ...response, idp });
  } catch (error) {
    event.reply('asynchronous-execute-response', { error, idp });
  }
});

module.exports = { loadMethods };
