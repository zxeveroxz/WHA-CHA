const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path')
const { consulta_nis, consulta_deuda_nis, listar_agua, listar_historico_agua, consulta_sanmarcos } = require('./utils/consultas');

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
global.RAIZ = __dirname;

//Routers
app.use(require('./routes'));


http.createServer({
}, app).listen(3000, () => {
    console.log("My HTTPS server listening on port 3000...");
});

