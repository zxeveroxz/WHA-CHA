const { DownloaderHelper } = require('node-downloader-helper');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path')
const qrcode = require('qrcode-terminal');
const qr = require('qrcode');

let client = null;
var qr_text = null;



const IniciarConexion = () => {
    console.log("Iniciando la conexion");
    client = new Client({ authStrategy: new LocalAuth(), puppeteer: { headless: true } });

    client.on('qr', (qr) => {
        // qrcode.generate(qr, { small: true });

    });

    client.on('authenticated', () => {
        console.log('AUTHENTICATED');
    });

    client.on('auth_failure', msg => {
        // Fired if session restore was unsuccessful
        console.error('AUTHENTICATION FAILURE', msg);
    });

    client.initialize();
}



async function IniciarConexion2(res) {
    console.log("Iniciando la conexion");
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // <- this one doesn't works in Windows
                '--disable-gpu'
            ]
        }
    });

    client.on('qr', (qr) => {
        console.log("qrrr");
        qr_text = qr;
        ir_qr(res);
    });

    client.on('ready', () => {
        console.log("Ready");
        listenMessage();
        activo(res);
    });

    client.on('auth_failure', msg => {
        console.error('AUTHENTICATION FAILURE', msg);
    });

    await client.initialize();

    client.on('disconnected', (reason) => {
        console.log('Whatsapp is disconnected! ' + reason);
        //client.destroy();
        client.initialize();
    });
    console.log("ya");
}

const ir_qr = (res) => {
    //const encoded = Buffer.from(qr, 'utf8').toString('base64') ;
    //console.log("ir_qr ",qr_text);
    //console.log("se ejecuta qr", encoded);
    res.status(301).redirect("/qr");
}

const activo = (res) => {

    try {
        res.send("Activo");
        console.log("esta activo");

    } catch (error) {
        console.log(error);
    }
}

const salir = async (res) => {
    try {
        await client.destroy();
        //await client.logout();
        client = null;
        console.log("se salio del ws");
        res.send("Ya se salio del WS");
    } catch (error) {
        console.log("salir error: " + error);
        console.log(client);
        res.status(301).redirect("/?no_se_salio_ws");
    }
}


const listenMessage = async () => {
    client.on("message", async (msg) => {

        const { from, to, body } = msg;
        console.log(from, to, body);

        let iphone = '51981359205@c.us';

        if (from === iphone) {

            //await descargarMedia('http://localhost/api-sedapal/barra.php');
            const media = await MessageMedia.fromUrl('http://localhost/api-sedapal/barra.php');
            media.mimetype = "image/png";
            media.filename = "agua.png";
            await client.sendMessage('51998322450@c.us', media, { caption: 'Avisos en Proceso de Atencion de Agua' });
/*
            const media2 = await MessageMedia.fromUrl('http://localhost/api-sedapal/barra_des.php');
            media.mimetype = "image/png";
            media.filename = "desague.png";
            await client.sendMessage('51998322450@c.us', media2, { caption: 'Avisos en Proceso de Atencion de Desague' });
*/
        }
    });
}

const descargarMedia = (url) => {

    const dirPath = path.join(__dirname, '/media/');

    const options = {
        method: 'GET', // Request Method Verb
        // Custom HTTP Header ex: Authorization, User-Agent
        headers: {},
        retry: { maxRetries: 3, delay: 3000 }, // { maxRetries: number, delay: number in ms } or false to disable (default)
        fileName: filename => `agua.png`,//`${filename}.jpg`, // Custom filename when saved
        /* override
        object: { skip: skip if already exists, skipSmaller: skip if smaller }
        boolean: true to override file, false to append '(number)' to new file name
        */
        override: { skip: false, skipSmaller: true },
        forceResume: false, // If the server does not return the "accept-ranges" header but it does support it
        removeOnStop: true, // remove the file when is stopped (default:true)
        removeOnFail: true, // remove the file when fail (default:true)    
        httpRequestOptions: {}, // Override the http request options  
        httpsRequestOptions: {} // Override the https request options, ex: to add SSL Certs
    };

    const dl = new DownloaderHelper(url, dirPath, options);

    dl.on('end', () => console.log('Download Completed'));
    dl.on('error', (err) => console.log('Download Failed', err));
    dl.start().catch(err => console.error(err));
}




const app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, parameterLimit: 50000, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

app.get('/', async function (req, res) {
    //res.send("inicindo");
    if (client == null)
        IniciarConexion2(res);
    else {
        const estado = await client.getState();
        res.send("El estado del Servidor es: " + estado);
    }

});

app.get("/qr", async function (req, res) {

    const estado = await client.getState();
    if(estado=="CONNECTED"){
        res.status(301).redirect("/activo");
        return;
    }
    //console.log(req.query);
    qr.toDataURL(qr_text, new Date, function (err, url) {
        if (err) return console.log("error occurred en el qr ", qr_text);
        res.render("index", { 'qr': url });
    })
});


app.get("/iniciar", async function (req, res) {
    // await IniciarConexion2(res);
});

app.get("/activo", function (req, res) {
    res.send("Ya esta ok");
});

app.get("/salir", function (req, res) {
    salir(res);
});




http.createServer({
    //key: fs.readFileSync('my_cert.key'),
    //cert: fs.readFileSync('my_cert.crt')
}, app).listen(3000, () => {
    console.log("My HTTPS server listening on port 3000...");


});



