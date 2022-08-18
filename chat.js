const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./db/avisos.db');

const buscar_chat = (from,body,callback) => {
  
    console.log(from);
    let data = [];
    db.serialize(()=> {       
         db.each(`SELECT 
                    * 
                FROM
                    tbl_chat 
                WHERE 
                    numero = '${from}'
                ORDER BY idx DESC`, function(err, row) {                                   
                    data.push(row);                    
                }, function(){             
                    guardar_chat(from,"e",body);    
                    if(data.length==0){
                        data[{mensaje:"Al parecer es tu primer mensaje del dia de hoy"}];
                    }     
                    callback(data); 
                });
    });
}

const guardar_chat= (from,direccion,mensaje,callback)=>{
    let hoy = new Date().toJSON().substring(0,19).replace("T"," ");
    let valores = [from,direccion,hoy,mensaje];

    let sql = `INSERT INTO tbl_chat VALUES  (0,?,?,?,?)`;
    db.run(sql, valores, function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Fila Insertada: ${this.changes}`);
    });           
}

module.exports = {buscar_chat};