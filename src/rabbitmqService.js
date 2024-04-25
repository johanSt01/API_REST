import * as amqp from 'amqplib';

export async function sendMessage(tipo_log, metodo,application, modulo, fecha, mensaje) {
    try {
        // Conectar a RabbitMQ
        const connection = await amqp.connect('amqp://rabbitmq');
        const channel = await connection.createChannel();

        // Declarar la cola
        const queue = 'logs';
        await channel.assertQueue(queue, { durable: true });

        const bodyMessage = `${tipo_log}#${metodo}#${application}#${modulo}#${fecha}#${mensaje}`;
        
        // Publicar un mensaje en la cola
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(bodyMessage)));

        // Cerrar la conexión a RabbitMQ
        setTimeout(() => {
            connection.close();
        }, 500);
    } catch (error) {
        console.error('Error al enviar mensaje a la cola:', error);
    }
}
