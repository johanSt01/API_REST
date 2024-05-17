import * as amqp from 'amqplib';
import crearConexion from '../database/db.js';

const esperarConexion = async () => {
    while (true) {
        try {
            const db = await crearConexion();
            return db;
        } catch (error) {
            console.log('Reintentando conexión a la base de datos en 5 segundos...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}
// Establecer la conexión a la base de datos
const db = await esperarConexion();

/**
 * Función asíncrona para procesar un mensaje recibido desde RabbitMQ 
 * y crear un perfil de usuario en la base de datos.
 */
async function procesarMensaje(msg) {
    try {
        // Convertir el mensaje a una cadena de texto
        const mensaje = msg.content.toString();
        // Convertir el mensaje JSON a un objeto JavaScript
        const datosPerfil = JSON.parse(mensaje);

        // Extraer los datos del perfil del objeto
        const {
            id,
            nombre,
            email
        } = datosPerfil;
        
        const url_pagina = email;
        const apodo = `${nombre}`;
        const informacion_publica = 1;
        const direccion_correspondencia = "N/A";
        const biografia = "N/A";
        const organizacion = "N/A";
        const pais = "N/A";

        // Crear un array con los valores del perfil para la consulta SQL
        const values = [
            id,
            url_pagina,
            apodo,
            informacion_publica,
            direccion_correspondencia,
            biografia,
            organizacion,
            pais
        ];

        // Ejecutar la consulta SQL para insertar el perfil en la base de datos
        const [results] = await db.execute('INSERT INTO Perfil (id, url_pagina, apodo, informacion_publica, direccion_correspondencia, biografia, organizacion, pais) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', values);

        if (results.affectedRows > 0) {
            console.log('Perfil creado exitosamente en la base de datos');
        } else {
            console.error('Error al crear el perfil en la base de datos');
        }

    } catch (error) {
        console.error('Error al procesar el mensaje:', error);
    }
}

// Bandera para controlar si está escuchando
let isListening = false; 

async function connectToRabbitMQ() {
    try {
        const connection = await amqp.connect(`amqp://rabbitmq`);
        const channel = await connection.createChannel();

        const queue = 'profile';
        await channel.assertQueue(queue, { durable: true });

        // Consumir mensajes de la cola
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                procesarMensaje(msg);
                channel.ack(msg);
            }
        });

        console.log('Esperando mensajes para creación automática del perfil...');
        isListening = true; // Establecer la bandera a true para indicar que está escuchando
    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.name === 'AMQPConnectionError') {
            console.error('Error de conexión a RabbitMQ:', error.message);

            // Reintentar la conexión después de un tiempo
            await new Promise(resolve => setTimeout(resolve, 5000));
            await connectToRabbitMQ(); // Volver a llamar a la función de conexión
        } else {
            console.error('Error no manejado:', error);
        }
    }
}

export async function consumeMessages() {
    await connectToRabbitMQ(); // Conexión inicial

    while (isListening) {
        // Se queda escuchando mientras la conexión sea exitosa
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}