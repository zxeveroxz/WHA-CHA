
//const { DownloaderHelper } = require('node-downloader-helper');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path')
const { consulta_nis, consulta_deuda_nis, listar_agua, listar_historico_agua,consulta_sanmarcos } = require('./utils/consultas');
const { Console } = require('console');



const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, parameterLimit: 50000, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));


global.sessions = 0;
global.clienteWS = null;
global.qrWS = null;

//G

//Routers
app.use(require('./routes'));



const ejemplo = async () => {
    //listar_agua();
    let datos_sm=[];
    let sm = await consulta_sanmarcos();

    for(let x=0;x<sm.tot;x++){
        let key = sm[x].data[1].replace(/'/g,'')        
        datos_sm[key]={"id":sm[x].data[0].replace(/'/g,''),
                        "lat":sm[x].data[2],
                        "lng":sm[x].data[3],
                        "fec":sm[x].data[7].replace(/'/g,''),
                        "tip":sm[x].data[27].replace(/'/g,'')};
    }
    console.log(datos_sm['BLJ-730']);
}
ejemplo();

http.createServer({
}, app).listen(3000, () => {
    console.log("My HTTPS server listening on port 3000...");
});

