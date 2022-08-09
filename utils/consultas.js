const axios = require('axios');


const tok = require('../token');

const TOKEN = () => {
    const token = new tok({
        host: "",
        arcgis: {
            url: "https://gisprd.sedapal.com.pe/arcgis",
            username: "gisweb",
            password: "AbCd123.",
            tokenExpires: 3600
        }

    });
    const r = token.get();

    return r;
}

const consulta_nis = async (nis) => {
    const aut = await TOKEN();
    const url_nis = `https://gisprd.sedapal.com.pe/arcgis/rest/services/AguaPotable/MapServer/35/query?f=json&where=SUPPLYID%20IN%20(%27${nis}%27)&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*&token=${aut.token}`;

    return axios({
            method: "get",
            url: url_nis,
            data: "",
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then(function (response) {
            //handle success
            //console.log(response.data.features, url_nis);
            return response.data;
        })
        .catch(function (response) {
            //handle error
            // console.log(response);
        });

}


module.exports = { consulta_nis }