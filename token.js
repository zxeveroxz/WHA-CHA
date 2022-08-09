const axios = require('axios');
const querystring = require('querystring');

/* eslint-disable no-unused-vars */
class token {
  constructor (options) {
    this.options = options || {};
  }

  get (id, params) {
    const arcgis = this.options.arcgis;

    // auth data
    const data = {
      f: 'json',
      client: 'requestip',
      referer: this.options.host,
      request: 'getToken',
      expiration: arcgis.tokenExpires, // 60 minutes
      username: arcgis.username,
      password: arcgis.password
    };

    // token url
    const url = arcgis.url + '/tokens/generateToken';
    
    // some headers for passing form data
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Accept': 'application/json'
    };

    return axios.post(url, querystring.stringify(data), {
      headers
    }).then(result => {
      Object.assign(result.data, {
        server: arcgis.url + '/rest/services',
        ssl: true
      });
      return result.data;
    });
  }
}

module.exports = function (options) {
  return new token(options);
};

module.exports.token = token;