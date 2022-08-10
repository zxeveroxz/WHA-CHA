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
            //console.log(response.data.features.length, url_nis);
            if (response.data.features.length > 0) {

                let attr2 = {};
                let attr = response.data.features[0].attributes;
                for (const key in attr) {
                    let val = attr[key] + "";
                    attr2[key] = val.trim();
                    //console.log(`${aa}: ${attr[aa]}`);
                }
                //console.log(attr2);
                let respuesta = `*NIS: ${attr2.SUPPLYID}*\n`;
                let dir = `Dir: ${attr2.NOM_CALLE} ${attr2.NUM_PUERTA} ${attr2.DUPLICADOR} ${attr2.NOM_LOCAL} ${attr2.NOM_MUNIC}\n`;
                let dia = `Dia: ${attr2.DIAMETRO_CONEXION} MM\n`;
                let med = `Med: ${attr2.NUM_APA}\n`;
                let sec = `Sec: ${attr2.COD_SECTOR}\n`;
                respuesta += dir + dia + med + sec;
                return respuesta.trim();
            } else {
                return 0;
            }

        })
        .catch(function (response) {
            //handle error
            console.log(response);
        });

}


module.exports = { consulta_nis }