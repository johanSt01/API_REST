import * as amqp from 'amqplib';
import fs from 'fs';
import path from 'path';

// Ruta donde se guardarán los logs
const logsFolder = './Logs';

async function callback(msg) {
    const message_info = msg.content.toString('utf-8').split('#');
    console.log(`TIPO DE LOG: ${message_info[0]}`);
    console.log(`METODO-HTTP: ${message_info[1]}`);
    console.log(`APLICACION: ${message_info[2]}`);
    console.log(`MODULO: ${message_info[3]}`);
    console.log(`FECHA: ${message_info[4]}`);
    console.log(`ACCION: ${message_info[5]}`);

   // Verificar si la carpeta "logs" existe, si no, crearla
    if (!fs.existsSync(logsFolder)) {
        fs.mkdirSync(logsFolder, { recursive: true });
    }

    // Construir el nombre del archivo de log con la ruta de la carpeta
    const logFilename = path.join(logsFolder, new Date().toISOString().slice(0, 10) + ".log");

    console.log('nombre del archivo log', logFilename);

    // Escribir el mensaje de log en el archivo
    fs.appendFileSync(logFilename, `TIPO DE LOG: ${message_info[0]}\n`);
    fs.appendFileSync(logFilename, `METODO-HTTP: ${message_info[1]}\n`);
    fs.appendFileSync(logFilename, `APLICACION: ${message_info[2]}\n`);
    fs.appendFileSync(logFilename, `MODULO: ${message_info[3]}\n`);
    fs.appendFileSync(logFilename, `FECHA: ${message_info[4]}\n`);
    fs.appendFileSync(logFilename, `ACCION: ${message_info[5]}\n\n`);
}

async function receiveMessage() {
    try {
        console.log("Conectando a RabbitMQ...");
        const connection = await amqp.connect('amqp://rabbitmq');
        const channel = await connection.createChannel();

        // Eliminar la cola existente
        await channel.deleteQueue('logs');

        // Declarar la cola
        const queue = 'logs';
        await channel.assertQueue(queue, { durable: true });

        console.log("Esperando mensajes...");

        // Consumir mensajes de la cola
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                callback(msg); // Llama al callback personalizado
                channel.ack(msg);
            }
        });

    } catch (error) {
        console.error('Error al recibir mensajes:', error);
    }
}

// Iniciar la recepción de mensajes
receiveMessage();