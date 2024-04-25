import express from 'express';
import { DateTime } from 'luxon';
import { enviarMensaje } from './rabbitmqReceive.js';
import { getDataFilteredByDate, getLogsFilteredByDate, getLogsFilteredByType } from './util.js';

const app = express();
const port = 5005;
app.use(express.json()); // Middleware para parsear el body de las peticiones como JSON

// Método REST para obtener los logs
// tipo_log+"#"+metodo+"#"+ruta+"#"+modulo+"#"+fecha+"#"+ip+"#"+usuario_autenticado+"#"+token+"#"+mensaje
app.get('/logs', (req, res) => {
    try {
        const formattedDate = DateTime.now().toFormat("yyyy-MM-dd");
        // Obtener los parámetros de paginación de la URL (opcional)
        const { page = 1, per_page = 10, initial_date = '2020-01-01', final_date = formattedDate, log_type } = req.query;

        // Obtener los datos filtrados por fecha del módulo
        const dataFilteredByDateRange = getDataFilteredByDate(initial_date, final_date);
        
        // Obtener los logs filtrados del módulo
        const logsFilteredByDate = getLogsFilteredByDate(dataFilteredByDateRange);

        // Obtener los logs filtrados por tipo de log
        const logs = log_type ? getLogsFilteredByType(logsFilteredByDate, log_type) : logsFilteredByDate;

        // Aplicar paginación
        const start = (page - 1) * per_page;
        const paginatedLogs = logs.slice(start, start + per_page);

        // Retornar la lista de logs en formato JSON junto con información de paginación
        res.status(200).json({
            page: parseInt(page),
            per_page: parseInt(per_page),
            initial_date,
            final_date,
            log_type,
            logs: paginatedLogs,
        });
    } catch (err) {
        console.error("Exception:", err);
        res.status(500).json({ error: "Error al obtener los logs de aplicación, razón: " + err });
    }
});

// Método REST para obtener los logs de una aplicación específica
app.get('/logs/:application', async (req, res) => {
    try {
        const formattedDate = DateTime.now().toFormat("yyyy-MM-dd");
        // Obtener los parámetros de paginación de la URL (opcional)
        const page = parseInt(req.query.page || 1);
        const per_page = parseInt(req.query.per_page || 10);
        const initial_date = req.query.initial_date || '2020-01-01';
        const final_date = req.query.final_date || formattedDate;
        const log_type = req.query.log_type;

        // Obtener los dates filtrados del directorio logs filtradas por rango de fecha
        const data_filtered_by_date_range = await getDataFilteredByDate(initial_date, final_date);
                
        // Obtener los logs filtrados del directorio logs
        const logs_filtered_by_date = await getLogsFilteredByDate(data_filtered_by_date_range);

        // Obtener los logs filtrados por tipo de log
        const logs = log_type ? getLogsFilteredByType(logs_filtered_by_date, log_type) : logs_filtered_by_date;

        // Filtrar los logs por la aplicación específica
        const logs_by_application = logs.filter(log => log['APLICACION'] === req.params.application);

        // Ordenar los logs por fecha de creación
        logs_by_application.sort((a, b) => a['FECHA'].localeCompare(b['FECHA']));

        // Aplicar paginación
        const start = (page - 1) * per_page;
        const paginated_logs = logs_by_application.slice(start, start + per_page);

        // Retornar la lista de logs en formato JSON junto con información de paginación
        const response = {
            page: page,
            per_page: per_page,
            initial_date: initial_date,
            final_date: final_date,
            log_type: log_type,
            logs: paginated_logs,
        };
        
        return res.status(200).json(response);
    } catch (err) {
        console.error("Exception:", err);
        return res.status(500).json({ error: "Error al obtener los logs de aplicación, razón: " + err });
    }
});

// Método REST para crear un LOG
app.post('/logs', (req, res) => {
    try {
        // Obtener datos del cuerpo de la solicitud JSON
        const data = req.body;

        // Verificar si todos los campos requeridos están presentes en los datos
        const requiredFields = ['TIPO-LOG', 'METODO-HTTP', 'RUTA', 'MODULO', 'APLICACION', 'FECHA', 'IP', 'ACCION'];
        for (const field of requiredFields) {
            if (!data[field]) {
                return res.status(400).json({ error: `El campo '${field}' es requerido` });
            }
        }

        const {
            'TIPO-LOG': tipo_log,
            'METODO-HTTP': metodo_log,
            'RUTA': ruta_log,
            'MODULO': modulo_log,
            'APLICACION': aplicacion_log,
            'FECHA': fecha_log,
            'IP': ip_log,
            'USUARIO-AUTENTICADO': usuario_log = 'GUEST',
            'TOKEN': token_log = 'NO TOKEN',
            'ACCION': accion_log
        } = data;

        // Crear el log
        enviarMensaje(tipo_log, metodo_log, ruta_log, modulo_log, aplicacion_log, fecha_log, ip_log, usuario_log, token_log, accion_log);

        return res.status(201).json({ message: "Log registrado exitosamente" });
    } catch (err) {
        console.error("Error: ", err);
        return res.status(500).json({ error: "Error al registrar el log" });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
