const { ipcRenderer } = require('electron');
let idp = 1;

const execute = function (name, params) {
  const ipcid = idp;
  idp += 1;

  const handleResponse = function (resolve, reject) {
    const listener = (event, { response, error, idp }) => {
      if (idp == ipcid && !error) {
        ipcRenderer.removeListener('asynchronous-execute-response', listener);
        resolve(response);
      } else if (idp == ipcid && error) {
        ipcRenderer.removeListener('asynchronous-execute-response', listener);
        reject(error);
      }
    };
    
    ipcRenderer.on('asynchronous-execute-response', listener);
  };

  setTimeout(ipcRenderer.send('asynchronous-execute-send', { name, params, idp: ipcid }), 10);
  return new Promise(handleResponse);
};

module.exports = execute;
