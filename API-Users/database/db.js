import { createPool } from 'mysql2/promise';
import { config } from 'dotenv';
config();

export const crearConexion = async () => {
    try {
        const pool = await createPool({
            host: process.env.MYSQLDB_HOST,
            user: process.env.MYSQLDB_USER,
            password: process.env.MYSQLDB_ROOT_PASSWORD,
            port: process.env.MYSQLDB_DOCKER_PORT,
            database: process.env.MYSQLDB_DATABASE
        });

        console.log('¡Conectado a la base de datos de users en MySQL!');
        return pool;
    } catch (error) {
        console.error('El error de conexión es:', error);
        throw error; // Re-lanzar el error para que sea manejado en el código que importe esta función
    }
}

export default crearConexion;