const utmObj = require('utm-latlng');
const utm = new utmObj('WGS 84');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./db/avisos.db');


const url_avisos_agua = "https://gisprd.sedapal.com.pe/arcgis/rest/services/Publicaciones/SGIO_SUR/MapServer/2/query?where=NCOD_CENTRO%3D7&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&f=json";

const avisos_agua = async (req, res) => {
    const resp = await buscar_avisos_agua();
    res.send(resp);

}

const buscar_avisos_agua = ()=>{
    console.log("Buscando avisos de agua "+new Date());
    return  axios.get(url_avisos_agua)
        .then(response => {
            let avisos = [];
            avisos = response.data.features.map((datos) => {
                const ns = utm.convertUtmToLatLng(datos.geometry.x, datos.geometry.y, 18, "");
                delete datos.attributes.ESRI_OID;
                delete datos.attributes.T_ATENCION;
                delete datos.attributes.F_RESOL;
                delete datos.attributes.T_RESOL;
                delete datos.attributes.F_FINALIZACION;
                delete datos.attributes.T_FINALIZACION;
                delete datos.attributes.USUARIO;
                delete datos.attributes.USUARIO_GESTOR;
                delete datos.attributes.CODIGO_ABASTEC;
                delete datos.attributes.NRO_LLAMADAS;
                delete datos.attributes.EST_SUMINISTRO;
                delete datos.attributes.FRECUENCIA;
                datos.attributes.gpslat = ns.lat;
                datos.attributes.gpslng = ns.lng;
                //datos.geometry = ns;
                let valores = Object.values(datos.attributes);
                let placeholders = valores.map((valores) => '?').join(',');
                let key = Object.keys(datos.attributes);
                let key_name = key.map((val) => `'${val}'`).join(',');

                let sql = `INSERT OR REPLACE INTO tbl_avisos(${key_name}) VALUES  (${placeholders})`;
                db.run(sql, valores, function (err) {
                    if (err) {
                        return console.error(err.message);
                    }
                    //console.log(`Fila Insertada: ${this.changes}`);
                    //console.log(this);
                });                
                return datos.attributes;//[datos.attributes, ];
            });
          return avisos;
        })
        .catch(error => {
            return error;
            console.log(error);
        });
}


module.exports = {avisos_agua,buscar_avisos_agua};
