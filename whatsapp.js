const { Client, MessageMedia, Location,Buttons, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const t = require("./utils/textos");
const textos = new t();

const { consulta_nis, consulta_deuda_nis,listar_historico_agua,listar_historico_desague,consulta_sanmarcos } = require('./utils/consultas');

const {buscar_chat} = require('./chat');

const {foto} = require('./utils/ubicar');

let client = null;
var qr_text = null;


const carros = async () => {
    //listar_agua();
    let datos_sm = [];
    let sm = await consulta_sanmarcos();

    for (let x = 0; x < sm.tot; x++) {
        let key = sm[x].data[1].replace(/'/g, '')
        datos_sm[key] = {
            "id": sm[x].data[0].replace(/'/g, ''),
            "lat": sm[x].data[2],
            "lng": sm[x].data[3],
            "fec": sm[x].data[7].replace(/'/g, ''),
            "tip": sm[x].data[27].replace(/'/g, '')
        };
    }
    return datos_sm;
}


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
 //         await client.sendMessage(from, "Consultando Nis..." + comando.substring(4, 11));
            let resp = await consulta_nis(comando.substring(4, 11));
            await delay(randomInteger(1,10));
            await client.sendMessage(from, (resp=="0"?"NIS no encontrado":resp));            
        }

        if (comando.substring(0, 4) == "/deu") {
            console.log("buscnado nis " + comando);
 //         await client.sendMessage(from, "Consultando Nis..." + comando.substring(4, 11));
            let resp = await consulta_deuda_nis(comando.substring(4, 11));
            await delay(randomInteger(1,10));
            await client.sendMessage(from, (resp=="0"?"NIS no encontrado":resp));            
        }

        if (comando.substring(0, 6) == "/aguas") {
            console.log("buscnado nis " + comando);
            await delay(randomInteger(1,10));
            let fecha = '2022-08-09';
            let turno = 2;
            listar_historico_agua(fecha, turno, async (resp) => {
                const media = await MessageMedia.fromUrl("http://localhost/api-sedapal/agua_historia.php?turno="+turno+"&fecha="+fecha+"&datos="+encodeURIComponent(JSON.stringify(resp)));
                media.mimetype = "image/png";
                media.filename = "historico_agua.png";
                await client.sendMessage('51998322450@c.us', media, { caption: 'Historico Agua '+fecha });
            });
          
        }

        if (comando.substring(0, 9) == "/desagues") {
            console.log("buscnado historico desague " + comando);
            await delay(randomInteger(1,10));
            let fecha = '2022-08-09';
            let turno = 2;
            listar_historico_desague(fecha, turno, async (resp) => {
                const media = await MessageMedia.fromUrl("http://localhost/api-sedapal/desague_historia.php?turno="+turno+"&fecha="+fecha+"&datos="+encodeURIComponent(JSON.stringify(resp)));
                media.mimetype = "image/png";
                media.filename = "historico_desague.png";
                await client.sendMessage('51998322450@c.us', media, { caption: 'Historico Desague '+fecha });
            });
          
        }

        if (comando.substring(0, 6) == "/placa") {
            console.log("buscnado placa ");
            await delay(randomInteger(1,10));
            await foto('BKM-741','-12.2031','-76.9773','camionetaaa');
        }

        if (comando.substring(0, 6) == "/carro") {
            console.log("buscnado carro ");
            await delay(randomInteger(1,10));
            await client.sendMessage(from,"Buscando los carros de San Marcos");
            let car = await carros();
            let key = Object.keys(car);
            //console.log(key);
           let todo = key.join("|");
           //console.log(todo);
           await delay(randomInteger(1,20));
           await client.sendMessage(from,todo);
        }

        

/**
        buscar_chat(from,body, async(row)=>{
            await delay(randomInteger(1,10));
            await client.sendMessage(from, "Tu  ultimo mensaje fue: "+ row[0].mensaje);
        });

*/


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

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time*800));
  }

  function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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