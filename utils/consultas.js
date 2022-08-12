const axios = require('axios');
const tok = require('../token');

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./db/avisos.db');


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
            if (response.data.features.length > 0) {

                let attr2 = {};
                let attr = response.data.features[0].attributes;
                for (const key in attr) {
                    let val = attr[key] + "";
                    attr2[key] = val.trim();
                }
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
            console.log(response);
        });

}

const consulta_deuda_nis = async (nis) => {
    const aut = await TOKEN();
    const url_nis = `https://gisprd.sedapal.com.pe/arcgis/rest/services/movilSGIO/mapserver/4/query?where=SUPPLYID%20in%20(%27${nis}%27)&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&f=json&token=${aut.token}`;

    return axios({
        method: "get",
        url: url_nis,
        data: "",
        headers: { "Content-Type": "multipart/form-data" },
    })
        .then(function (response) {
            //console.log(response.data.features);            return;
            if (response.data.features.length > 0) {
                let attr2 = {};
                let attr = response.data.features[0].attributes;
                for (const key in attr) {
                    let val = attr[key] + "";
                    attr2[key] = val.trim();
                }
                let respuesta = `*NIS: ${attr2.SUPPLYID}*\n`;
                let deu = `Deuda: ${attr2.DEUDA}\n`;
                let est = `Estado: ${attr2.SITUACION}\n`;
                let med = `Medidor: ${attr2.NUM_APA}\n`;
                respuesta += deu + est + med;
                return respuesta.trim();
            } else {
                return 0;
            }
        })
        .catch(function (response) {
            console.log(response);
        });

}


const listar_agua=()=>{
/** 
    const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (let i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();
*/
 
    db.each("SELECT *,DATE(F_ALTA/1000, 'auto') AS F_ALTA,DATE(F_ATENCION/1000, 'auto') AS F_ATENCION FROM tbl_avisos where DATE(F_ALTA/1000, 'auto')='2022-08-10' and TIPO_RED='AGUA'", (err, row) => {
        //let f = new Date(row.F_ALTA);
        //console.log(row.NUM_AVISO + ": " + row.SUMINISTRO+ ": " + row.TIPO_RED+ ": " + f.getDate() +"/" + (f.getMonth()+1));
        console.log(row);
    });

}


module.exports = { consulta_nis ,consulta_deuda_nis,listar_agua}