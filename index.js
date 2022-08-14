
const { DownloaderHelper } = require('node-downloader-helper');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path')
const { consulta_nis, consulta_deuda_nis, listar_agua, listar_historico_agua } = require('./utils/consultas');
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
    let rep = await consulta_deuda_nis('2525123');
    console.log(rep);
    listar_agua();
}
ejemplo();


setInterval(async () => {
    listar_historico_agua('2022-08-08', 3, (resp) => {
      
        let url = "http://localhost/api-sedapal/agua_historia.php?datos="+encodeURIComponent(JSON.stringify(resp));
        const dirPath = path.join(__dirname, '/media/');


        const dl = new DownloaderHelper(url, dirPath,{fileName: filename => `agua_historia.png`,override: { skip: false, skipSmaller: true },});
        dl.on('end', () => console.log('Download Completed'));
        dl.on('error', (err) => console.log('Download Failed', err));
        dl.start().catch(err => console.error(err));
    });
}, 1000 * 4);





http.createServer({
}, app).listen(3000, () => {
    console.log("My HTTPS server listening on port 3000...");
});

