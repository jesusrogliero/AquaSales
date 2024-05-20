const axios = require('axios');

module.exports = async (endpoint, params) => {
  try {

    const response = await axios.post('http://127.0.0.1:3000/'+endpoint, params);
    console.log('Respuesta:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};