import * as amqp from 'amqplib';
import mongoose from 'mongoose';
import Log from './util.js';
import { config } from 'dotenv';
config();

// Obtener la dirección IP y el puerto desde las variables de entorno
const host = process.env.MONGODB_HOST;
const port = process.env.MONGODB_PORT;
const username = process.env.MONGODB_USER;
const password = process.env.MONGODB_PASSWORD;
// URL de conexión a tu instancia de MongoDB
const url = `mongodb://${username}:${password}@${host}:${port}/?authSource=admin`;

async function callback(msg) {
    const message_info = msg.content.toString('utf-8').split('#');
    console.log(`TIPO DE LOG: ${message_info[0]}`);
    console.log(`METODO-HTTP: ${message_info[1]}`);
    console.log(`APLICACION: ${message_info[2]}`);
    console.log(`MODULO: ${message_info[3]}`);
    console.log(`FECHA: ${message_info[4]}`);
    console.log(`ACCION: ${message_info[5]}`);

    const TIPO_DE_LOG = message_info[0].replace(/"/g, '');
    const METODO_HTTP = message_info[1].replace(/"/g, '');
    const APLICACION = message_info[2].replace(/"/g, '');
    const MODULO = message_info[3].replace(/"/g, '');
    const FECHA = new Date(message_info[4]);
    const ACCION = message_info[5].replace(/"/g, '');

    // Crear una instancia del modelo Log con los datos recibidos
    const log = new Log({
      TIPO_DE_LOG,
      METODO_HTTP,
      APLICACION,
      MODULO,
      FECHA,
      ACCION
    });

   // Guardar el log en la base de datos
   try {
    await log.save();
    console.log('Log insertado correctamente en la base de datos');

  } catch (error) {
    console.error('Error al insertar el log en la base de datos:', error);
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

        //Crear la conexion con la base de datos de mongo
        connectToDatabase();

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
        console.log('Reintentando en 5 segundos...');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos antes de reintentar
    }
}

// Iniciar la recepción de mensajes
receiveMessage();

async function connectToDatabase() {
  try {
      await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Conectado correctamente a la base de datos MongoDB');

      // Crear índices en la base de datos para mejorar el rendimiento de las consultas
      await Log.createIndexes();

  } catch (error) {
      console.error('Error al conectar a la base de datos MongoDB:', error);
      throw error;
  }
}