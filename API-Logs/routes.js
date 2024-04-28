import express from 'express';
import mongoose from 'mongoose';
//import { enviarMensaje } from './rabbitmqReceive.js';
//import { getDataFilteredByDate, getLogsFilteredByDate, getLogsFilteredByType } from './util.js';
import { config } from 'dotenv';
config();

const app = express();
// Obtener la dirección IP y el puerto desde las variables de entorno
const host = process.env.MONGODB_HOST;
const port = process.env.MONGODB_PORT;
const username = process.env.MONGODB_USER;
const password = process.env.MONGODB_PASSWORD;
//Puerto del servidor
const portServer = process.env.PORT_LOGS;
app.use(express.json()); // Middleware para parsear el body de las peticiones como JSON

// URL de conexión a tu instancia de MongoDB
const url = `mongodb://${username}:${password}@${host}:${port}/?authSource=admin`;

// Conexión a la base de datos MongoDB
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Conectado correctamente a la base de datos MongoDB');
        //Iniciar el servidor una vez que se haya establecido la conexión a la base de datos
        app.listen(portServer, () => {
            console.log(`Servidor logs escuchando en el puerto ${portServer}`);
        });
    })
    .catch((error) => console.error('Error al conectar a la base de datos MongoDB:', error));

// Método REST para obtener los logs
app.get('/logs', async (req, res) => {
    try {        
        // Parámetros de paginación
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        // Parámetros de ordenamiento
        const sortField = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.order || 'desc';
        const sortOptions = { [sortField]: sortOrder };

        // Definir el esquema de los logs
        const logSchema = new mongoose.Schema({
            TIPO_DE_LOG: String,
            METODO_HTTP: String,
            APLICACION: String,
            MODULO: String,
            FECHA: String,
            ACCION: String
        });
  
        // Crear el modelo de logs
        const Log = mongoose.model('Log', logSchema);

        // Parámetros de filtro
        const query = {};
        if (req.query.startDate) {
            query.createdAt = { $gte: new Date(req.query.startDate) };
        }
        if (req.query.endDate) {
            query.createdAt = { ...query.createdAt, $lte: new Date(req.query.endDate) };
        }
        if (req.query.logType) {
            query.TIPO_DE_LOG = req.query.logType;
        }

        const logs = await Log.find(query)
            .sort(sortOptions)
            .limit(perPage)
            .skip((page - 1) * perPage);

        res.json(logs);
    } catch (error) {
        console.error('Error al recuperar los logs:', error);
        res.status(500).json({ error: 'Error al recuperar los logs' });
    }
});
