class textos {
    ayuda() {
        return `Para solicitar informacion de un suministro por el numero del NIS enviar la palabra \"Nis\" seguido de 7 numeros,
ejemplo: Nis1234567

Para solicitar informacion de un suministro por el Numero de MEDIDOR enviar la palabra \"Me.\" seguido del codigo del medidor,
ejemplo: Me.EA20187830

Para solicitar informacion de la DEUDA de un suministro enviar la palabra \"Deu\" seguido de 7 numeros,
ejemplo: Deu1234567`;
    }

    start() {
        return "Bienvenido al Bot de Consultas, si necesita ayuda para conocer los 'comandos' disponibles, escriba /ayuda";
    }



};

module.exports = textos;