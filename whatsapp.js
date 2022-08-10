const { Client, MessageMedia, Location, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const t = require("./utils/textos");
const textos = new t();

const { consulta_nis } = require('./utils/consultas');

let client = null;
var qr_text = null;

async function IniciarConexion2(req, res) {

    let send = "";

    console.log("Iniciando la conexion");
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: [

                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                //  '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // <- this one doesn't works in Windows
                // '--disable-gpu'

            ]
        }
    });
    client.on('ready', () => {
        console.log("Ready");
        //res.send("Conexion Ready")
        sessions = 1;
        clienteWS = client;
        send = "ready";
    });


    client.on('qr', (qr) => {
        console.log("qrrr,", qr);
        clienteWS = client;
        qrWS = qr;
        //req.params.qq=qr;
        send = "qr";
        //res.status(301).redirect("/qr");
    });



    client.on('auth_failure', msg => {
        console.error('AUTHENTICATION FAILURE', msg);
        sessions = 0;
        clienteWS = null;
    });

    await client.initialize();

    client.on('disconnected', (reason) => {
        console.log('Whatsapp is disconnected! ' + reason);
        sessions = 0;
        client.destroy();
        clienteWS = null;
        //client.initialize();
    });


    client.on("message", async (msg) => {
        const { from, to, body } = msg;
        console.log(from, to, body);

        let comando = body.trim().toLowerCase();

        if (comando == "/ayuda") {
            await client.sendMessage(from, textos.ayuda());
        }

        if (comando.substring(0, 4) == "/nis") {
            console.log("buscnado nis " + comando);
            await client.sendMessage(from, "Consultando Nis..." + comando.substring(4, 11));
            let resp = await consulta_nis(comando.substring(4, 11));

            //console.log("resp "+resp);
            await client.sendMessage(from, (resp=="0"?"NIS no encontrado":resp));
            if (resp != 0) {
                console.log(resp,"loscalizacion")                
                await client.sendMessage(from, new Location(37.422, -122.084, 'Googleplex\nGoogle Headquarters'));
            }

        }



        /*
        let iphone = '51981359205@c.us';
        if (from === iphone) {
            //await descargarMedia('http://localhost/api-sedapal/barra.php');
            const media = await MessageMedia.fromUrl('http://localhost/api-sedapal/barra.php');
            media.mimetype = "image/png";
            media.filename = "agua.png";
            await client.sendMessage('51998322450@c.us', media, { caption: 'Avisos en Proceso de Atencion de Agua' });
            //client.sendMessage('51998322450@c.us',"hola amix");
        }
        */
    });

    if (send == "qr")
        res.status(301).redirect("/qr");

    if (send == "ready")
        res.send("Conexion Ready")

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

module.exports = { client, IniciarConexion2 }