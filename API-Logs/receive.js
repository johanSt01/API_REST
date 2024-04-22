import * as amqp from 'amqplib';

async function receiveMessage() {
    try {
        // Conectarse a RabbitMQ
        const connection = await amqp.connect('amqp://rabbitmq');
        const channel = await connection.createChannel();

        // Declarar la cola
        const queue = 'autenticaciones';
        await channel.assertQueue(queue, { durable: false });

        console.log("Esperando mensajes...");

        // Consumir mensajes de la cola
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const message = JSON.parse(msg.content.toString());
                console.log("Mensaje recibido:", message);
                channel.ack(msg);
            }
        });

    } catch (error) {
        console.error('Error al recibir mensajes:', error);
    }
}

// Iniciar la recepción de mensajes
receiveMessage();
