const express  = require("express");
const router = express.Router();
const {buscar_avisos_agua,avisos_agua} = require('./utils/agua');
const {buscar_avisos_desague,avisos_desague } = require('./utils/desague');
const {consulta_sanmarcos,aleatorio_carros} = require('./utils/ubicar');
const {client,IniciarConexion2} = require('./whatsapp');
const qr = require('qrcode');
const {randomInteger} = require('./utils/ayudas');

const t = require("./utils/textos");
const textos = new t(); 


//console.log(textos.start());
var estado=0;

const ir_qr = (res) => {
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
        await clienteWS.destroy();
        //wait clienteWS.logout();
        clienteWS = null;
        console.log("se salio del ws");
        res.send("Ya se salio del WS");
    } catch (error) {
        console.log("salir error: " + error);
        //console.log(client);
        res.send("no se pudo" + error);
    }
}

const salir2 = async (res) => {
    try {
        //await clienteWS.destroy();
        await clienteWS.logout();
        clienteWS = null;
        console.log("se salio del ws");
        res.send("Ya se salio del WS");
    } catch (error) {
        console.log("salir error: " + error);
        //console.log(client);
        res.send("no se pudo" + error);
    }
}

router.get('/algo',(req,res)=>{
    res.send("algooooooo");
});



router.get("/agua", avisos_agua);
router.get("/desague",avisos_desague);


router.get('/', async function (req, res) {

    if (clienteWS == null){
        await IniciarConexion2(req,res);
      
    }else {
        let estado = await clienteWS.getState();
        if(estado==null){
            res.status(301).redirect("/qr");
        }else
        res.send("El estado del Servidor es: " + estado);
    }

});

router.get("/qr", async function (req, res) {
    if(clienteWS==null ){
        console.log("redirigimos al iniciio");
        res.redirect("/");
        return;
    }

      const estado = await clienteWS.getState();
    if (estado == "CONNECTED") {
        res.status(301).redirect("/activo");
        return;
    }
    //console.log(req.query);
    qr.toDataURL(qrWS, new Date, function (err, url) {
        if (err) return console.log("error occurred en el qr ", qrWS);
        res.render("index", { 'qr': url });
    })
});


router.get("/activo", async function (req, res) {
    await clienteWS.sendMessage("51981359205@c.us","Ya esta listo para el trabajo");
    res.send("Ya esta ok");
   
});

router.get("/salir", function (req, res) {
    salir(res);
});

router.get("/salir2", function (req, res) {
    salir2(res);
});


router.get("/demo", function (req, res) {
    aleatorio_carros((row)=>{        
        res.send(row);
    })
});






setInterval( async() => {    
    await buscar_avisos_agua();
    await buscar_avisos_desague();
}, 1000*10);


setInterval( async() => {    
    await consulta_sanmarcos();
}, 1000*60);

module.exports = router;