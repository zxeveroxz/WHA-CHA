const puppeteer = require('puppeteer');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./db/avisos.db');
const {randomInteger} = require('./ayudas');
const path = require('path');

/*
(async () => {
   const browser = await puppeteer.launch({headless: true});
   const page = await browser.newPage();
   await page.setViewport({ width: 1920, height: 1080 });
   await page.goto('https://www.w3schools.com/howto/howto_js_remove_property_object.asp');
   await page.screenshot({path: 'buddy-screenshot.png'});

   await browser.close();
   console.log("termino");
})();
*/

const consulta_sanmarcos = async () => {
   const url = `http://localhost/sanmarcos/final_gps.php`;

   return axios({
      method: "get",
      url: url,
      data: "",
      headers: { "Content-Type": "multipart/form-data" },
   })
      .then(function (response) {
         let sm = response.data;
         let datos_sm = [];
         for (let x = 0; x < sm.tot; x++) {
            let key = sm[x].data[1].replace(/'/g, '')
            if (key == 'BXK-176' || key == 'BTV-155' || key == 'AZB-936' || key == 'BXH-089' || key == 'AZY-895' || key == 'BNI-298')
               continue;

            datos_sm[key] = {
               "placa": key,
               "id": sm[x].data[0].replace(/'/g, ''),
               "lat": sm[x].data[2],
               "lng": sm[x].data[3],
               "fec": sm[x].data[7].replace(/'/g, ''),
               "tip": sm[x].data[27].replace(/'/g, '')
            };
            //console.log( datos_sm[key]);          
            let valores = Object.values(datos_sm[key]);
            let sql = `INSERT INTO tbl_carros VALUES  (null,?,?,?,?,?,?,DateTime('now','localtime'))`;
            db.run(sql, valores, function (err) {
               if (err) {
                  return console.error(err.message);
               }
              
               //console.log(`Fila Insertada caroo: ${this.changes}`);
            });
           
         }
      })
      .catch(function (response) {
         console.log(response);
      });
}

const listar_carros = async (placa, callback) => {
   db.serialize(() => {
      let data = {};
      return db.each(`SELECT 
                              * 
                        FROM 
                              tbl_carros 
                        WHERE 
                              placa = '${placa}'                        
                        ORDER BY 
                              fecha DESC
                        LIMIT
                              1`, function (err, row) {
         data = row;
      }, function () { // calling function when all rows have been pulled                        
         callback(data);
      });
   })
}


const aleatorio_carros = async (callback) => {
   db.serialize(() => {
      let data = [];
      return db.each(`SELECT 
                              * 
                        FROM 
                              carros_vista  
                        `, function (err, row) {
         data.push(row.placa);
      }, function () { // calling function when all rows have been pulled         
         let key = randomInteger(0,data.length-1);              
         callback(data[key]);
      });
   })
}


const buscar_carros = async () => {
   try {
      let datos_sm = [];
      let sm = await consulta_sanmarcos();

      for (let x = 0; x < sm.tot; x++) {
         let key = sm[x].data[1].replace(/'/g, '')
         if (key == 'BXK-176' || key == 'BTV-155' || key == 'AZB-936' || key == 'BXH-089' || key == 'AZY-895' || key == 'BNI-298')
            continue;

         datos_sm[key] = {
            "id": sm[x].data[0].replace(/'/g, ''),
            "lat": sm[x].data[2],
            "lng": sm[x].data[3],
            "fec": sm[x].data[7].replace(/'/g, ''),
            "tip": sm[x].data[27].replace(/'/g, '')
         };
      }

   } catch (error) {
      console.log(error);
      return [];
   }

}

const foto = async (placa, lat, lng, texo = '') => {
   const browser = await puppeteer.launch({ headless: true });
   const page = await browser.newPage();
   await page.setViewport({ width: 400, height: 600 }); 
   await page.goto(`http://localhost/open2/foto.php?lat=${lat}&lng=${lng}&placa=${placa}`, { timeout: 30000, waitUntil: 'networkidle0' });
   let name = placa+'.png';
   await page.screenshot({ path: path.join(RAIZ,'tmp',name)});
   await browser.close();
   return name;

}

module.exports = { foto, consulta_sanmarcos, listar_carros, buscar_carros,aleatorio_carros };