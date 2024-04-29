import express from 'express';
import mongoose from 'mongoose';
import Log from './util.js';
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
        const sortField = req.query.sortBy || 'FECHA';
        const sortOrder = req.query.order || 'asc';
        const sortOptions = { [sortField]: sortOrder };

        // Parámetros de filtro
        const query = {};
        
        // Filtrar por fechas
        if (req.query.startDate) {
            query.FECHA = { ...query.FECHA, $gte: new Date(req.query.startDate) };
        }
        if (req.query.endDate) {
            query.FECHA = { ...query.FECHA, $lte: new Date(req.query.endDate) };
        }
        //Filtrar por tipo de log
        if (req.query.logType) {
            query.TIPO_DE_LOG = req.query.logType;
        }

        // Contar total de logs
        const totalLogs = await Log.countDocuments(query);

        const logs = await Log.find(query)
            .sort(sortOptions)
            .limit(perPage)
            .skip((page - 1) * perPage);

        res.json({
            page,
            perPage,
            totalLogs,
            logs
        });
    } catch (error) {
        console.error('Error al recuperar los logs:', error);
        res.status(500).json({ error: 'Error al recuperar los logs' });
    }
});
