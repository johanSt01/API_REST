import express from 'express';
import mongoose from 'mongoose';
import Log from './util.js';
import { sendMessage } from '../API-Users/rabbitmqService.js';
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

app.get('/health', (req, res) => {
    res.status(200).send('ok')
});

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


//Metodo rest para obtener los logs por aplicación
app.get('/logs/:application', async (req, res) =>{
    try{
        //tipo de aplicación a filtrar
        const application = req.params.application;

        // Parámetros de paginación
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;
        
        // Parámetros de ordenamiento
        const sortField = req.query.sortBy || 'FECHA';
        const sortOrder = req.query.order || 'asc';
        const sortOptions = { [sortField]: sortOrder };

        const query = { APLICACION: application };

        // Filtrar por fechas
        if (req.query.startDate) {
            query.FECHA = { ...query.FECHA, $gte: new Date(req.query.startDate) };
        }
        if (req.query.endDate) {
            query.FECHA = { ...query.FECHA, $lte: new Date(req.query.endDate) };
        }

        // Filtrar por tipo de log
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

    }catch(error) {
        console.error('Error al recuperar los logs por aplicacion: ', error);
        res.status(500).json({ error: 'Error al recuperar los logs por aplicacion' });
    }
});


// Ruta POST para crear un nuevo log
app.post('/logs', async (req, res) => {
    try {
        //Mensaje de los logs
        const tipo_log = "INFO";
        const metodo = "POST";
        const application = "LOGS_API_REST";
        const modulo = "routes.js"
        const fecha = new Date().toISOString();
        const mensaje = "LOG CREADO CORRECTAMENTE DESDE LA API DE LOGS";
        //Enviar mensaje
        await sendMessage(tipo_log, metodo,application, modulo, fecha, mensaje);

        // Devolver la respuesta con el log creado
        res.status(201).json('Log creado correctamente');
    }catch(error){
        console.error('Error al crear el log:', error);
        res.status(500).json({ error: 'Error al crear el log' });
    }
});

app.get('/health', (req, res) => {
    res.status(200).send('ok')
});