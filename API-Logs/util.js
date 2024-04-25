import { promises as fs } from 'fs';
import { DateTime } from 'luxon';
import path from 'path';

// Función para filtrar los datos de respuesta por un rango de fechas
async function getDataFilteredByDate(initial_date, final_date) {
    const data_filtered = [];
    const initialDate = DateTime.fromFormat(initial_date, "yyyy-MM-dd").toJSDate();
    const finalDate = DateTime.fromFormat(final_date, "yyyy-MM-dd").toJSDate();

    if (initialDate > finalDate) {
        throw new Error("Fecha inicial mayor a fecha final");
    }

    const logFiles = await fs.readdir('logs');
    for (const logFile of logFiles) {
        const formattedDate = logFile.split("_")[1].split(".")[0];
        const currentDate = DateTime.fromFormat(formattedDate, "yyyy-MM-dd").toJSDate();
        if (currentDate >= initialDate && currentDate <= finalDate) {
            data_filtered.push(formattedDate);
        }
    }

    return data_filtered;
}

// Función para filtrar los logs por un rango de fechas
async function getLogsFilteredByDate(data_filtered_by_date_range) {
    const logs = [];
    for (const dateFiltered of data_filtered_by_date_range) {
        const logFilePath = path.join('logs', `log_${dateFiltered}.log`);
        try {
            const logContent = await fs.readFile(logFilePath, 'utf8');
            const logEntries = logContent.trim().split("\n\n");
            for (const entry of logEntries) {
                const logData = {};
                const lines = entry.trim().split("\n");
                for (const line of lines) {
                    const [key, value] = line.split(": ", 2);
                    logData[key] = value;
                }
                logs.push(logData);
            }
        } catch (err) {
            console.error(`Error al leer el archivo ${logFilePath}: ${err}`);
        }
    }
    return logs;
}

// Función para filtrar los logs por tipo de log
function getLogsFilteredByType(logsFilteredByDateRange, log_type) {
    const logsFilteredByType = [];
    for (const log of logsFilteredByDateRange) {
        if (log["TIPO DE LOG"] === log_type) {
            logsFilteredByType.push(log);
        }
    }
    return logsFilteredByType;
}

export { getDataFilteredByDate, getLogsFilteredByDate, getLogsFilteredByType };
