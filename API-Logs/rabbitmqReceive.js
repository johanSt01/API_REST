import * as amqp from 'amqplib';
import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
config();

// Obtener la dirección IP y el puerto desde las variables de entorno
const host = process.env.MONGODB_HOST;
const port = process.env.MONGODB_PORT;
const username = process.env.MONGODB_USER;
const password = process.env.MONGODB_PASSWORD;
// URL de conexión a tu instancia de MongoDB
const url = `mongodb://${username}:${password}@${host}:${port}/?authSource=admin`;
// Nombre de la base de datos
const dbName = process.env.MONGODB_DATABASE


async function callback(msg) {
    const message_info = msg.content.toString('utf-8').split('#');
    console.log(`TIPO DE LOG: ${message_info[0]}`);
    console.log(`METODO-HTTP: ${message_info[1]}`);
    console.log(`APLICACION: ${message_info[2]}`);
    console.log(`MODULO: ${message_info[3]}`);
    console.log(`FECHA: ${message_info[4]}`);
    console.log(`ACCION: ${message_info[5]}`);

    const TIPO_DE_LOG = message_info[0];
    const METODO_HTTP = message_info[1];
    const APLICACION = message_info[2];
    const MODULO = message_info[3];
    const FECHA = message_info[4];
    const ACCION = message_info[5];

    // Datos a insertar en la colección
    const data = [
        { TIPO_DE_LOG: TIPO_DE_LOG, 
            METODO_HTTP: METODO_HTTP,
            APLICACION: APLICACION,
            MODULO: MODULO,
            FECHA: FECHA,
            ACCION: ACCION}
    ];

    // Llamar a la función para insertar datos
    insertData(data);

}

async function insertData(data) {
    const client = new MongoClient(url);
  
    try {
      await client.connect();
      console.log('Conectado correctamente al servidor de MongoDB');
  
      const db = client.db(dbName);
      const collection = db.collection('Logs');
  
      // Insertar datos en la colección
      const result = await collection.insertMany(data);
      console.log(`${result.insertedCount} documentos insertados correctamente`);

    } catch (error) {
      console.error('Error al conectar o insertar datos:', error);
    } finally {
      // Cerrar la conexión al finalizar
      await client.close();
      console.log('Conexión cerrada');
    }
  }

async function receiveMessage() {
    try {
        console.log("Conectando a RabbitMQ...");
        const connection = await amqp.connect('amqp://rabbitmq');
        const channel = await connection.createChannel();

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