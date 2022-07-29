const { DownloaderHelper } = require('node-downloader-helper');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const qr = require('qrcode');

let client = null;
var qr_text =null;



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
     client =  new Client({ authStrategy: new LocalAuth(), puppeteer: { headless: false } });

    client.on('qr', (qr) => {
        console.log("qrrr");
        qr_text=qr;
        ir_qr(res);
    });

    client.on('ready', () => {     
        console.log("Ready");   
       activo(res);
    });

    client.on('auth_failure', msg => {
        console.error('AUTHENTICATION FAILURE', msg);
    });

    await client.initialize();
    console.log("ya");
}

const ir_qr = (res)=>{
    //const encoded = Buffer.from(qr, 'utf8').toString('base64') ;
    //console.log("ir_qr ",qr_text);
    //console.log("se ejecuta qr", encoded);
    res.status(301).redirect("/qr");
}

const activo = (res)=>{
    
    try {
        res.send("Activo");
        console.log("esta activo");
       
    } catch (error) {
        console.log(error);
    }
}

const salir = (res)=>{
    try {
        client.destroy();
        //client.logout();
        client=null;
        console.log("se salio del ws");
    } catch (error) {
        console.log("salir error: ");
    }
}

const app = express();
app.set('views',__dirname+'/views');
app.set('view engine','ejs');


app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, parameterLimit: 50000, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

app.get('/',  function (req, res) {
    //res.send("inicindo");
    if(client==null)
        IniciarConexion2(res);
    else
    client.getState();
});

app.get("/qr", async function(req,res){

    //console.log(req.query);
    qr.toDataURL(qr_text,new Date ,function (err, url) {
        if(err) return console.log("error occurred en el qr ",qr_text);
        res.render("index",{'qr':url});
      })
});


app.get("/iniciar", async function(req,res){
   // await IniciarConexion2(res);
});

app.get("/activo",function(req,res){    
    res.send("Ya esta ok");
});

app.get("/salir",function(req,res){    
    salir(res);
    res.send("ya salio");
});




http.createServer({
    //key: fs.readFileSync('my_cert.key'),
    //cert: fs.readFileSync('my_cert.crt')
}, app).listen(3000, () => {
    console.log("My HTTPS server listening on port 3000...");
});

