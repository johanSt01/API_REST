import express from 'express';
import { createPool } from 'mysql2/promise';
import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import VerificarToken from '../VerificacionToken/verificarToken.js';
import { v4 as uuidv4 } from 'uuid';
import { sendMessage } from './rabbitmqService.js';
import healthRouter from './health.js';
config();

const app = express();
const port = process.env.PORT;
app.use(express.json()); // Middleware para parsear el body de las solicitudes como JSON
const verificarToken = new VerificarToken();

const pool = createPool({
    host: process.env.MYSQLDB_HOST,
    user: process.env.MYSQLDB_USER,
    password: process.env.MYSQLDB_ROOT_PASSWORD,
    port: process.env.MYSQLDB_DOCKER_PORT,
    database: process.env.MYSQLDB_DATABASE
});

// Objeto para almacenar los tokens de reseteo
const resetTokens = {};

// Agregar enrutador de salud
app.use('/', healthRouter);

// Configurar la ruta para crear la tabla
app.post('/create-table', async (req, res) => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            contraseña VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL
        )`);
        console.log('Tabla usuarios creada con éxito (o ya existe).');

        // Consultas para agregar dos registros a la tabla
        await pool.query(`
            INSERT INTO usuarios (nombre, contraseña, email)
            VALUES ('Usuario1', '123', 'usuario1@example.com');
        `);
        await pool.query(`
            INSERT INTO usuarios (nombre, contraseña, email)
            VALUES ('Usuario2', '123', 'usuario2@example.com');
        `);

        console.log('(Usuarios creados con exito).');
        res.send('Tabla usuarios y datos creados con éxito (o ya existe).');        
    } catch (err) {
        console.error('Error al crear la tabla usuarios:', err);
        res.status(500).send('Error al crear la tabla usuarios');
    }
});

// Ruta para obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
    try {
        const page = req.query.page || 1; // Página actual
        const perPage = req.query.perPage || 10; // Usuarios por página
        const offset = (page - 1) * perPage;

        const countQuery = 'SELECT COUNT(*) AS total FROM usuarios';
        const usersQuery = `SELECT * FROM usuarios LIMIT ? OFFSET ?`;

        // Obtener el total de usuarios
        const [countRows] = await pool.query(countQuery);
        const totalUsers = countRows[0].total;

        // Obtener los usuarios para la página actual
        const [rows] = await pool.query(usersQuery, [parseInt(perPage), offset]);

        //Mensaje de los logs
        const tipo_log = "Lista de usuarios";
        const metodo = "GET";
        const application = "USERS_API_REST";
        const modulo = "app.js"
        const fecha = new Date().toISOString();
        const mensaje = "UN USUARIO HA LISTADO LOS USUARIOS";
        //Enviar mensaje
        await sendMessage(tipo_log, metodo,application, modulo, fecha, mensaje);

        res.json({
            page,
            perPage: parseInt(perPage),
            totalUsers,
            users: rows,
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para agregar un nuevo usuario
app.post('/usuarios', async (req, res) => {
    const { nombre, contrasena, email } = req.body;

    if (!nombre || !contrasena || !email) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Verificar si el correo electrónico ya existe en la base de datos
        const [existingUser] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);

        if (existingUser.length > 0) {
            // Si el correo electrónico ya existe, responder con un error
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }

        // Insertar el nuevo usuario en la base de datos
        await pool.query('INSERT INTO usuarios (nombre, contraseña, email) VALUES (?, ?, ?)', [nombre, contrasena, email]);

        //Mensaje de los logs
        const tipo_log = "Crear un usuario";
        const metodo = "POST";
        const application = "USERS_API_REST";
        const modulo = "app.js"
        const fecha = new Date().toISOString();
        const mensaje = "SE HA CREADO UN NUEVO USUARIO";
        //Enviar mensaje
        await sendMessage(tipo_log, metodo,application, modulo, fecha, mensaje);

        res.json({ message: 'Usuario agregado con éxito' });
    } catch (error) {
        console.error('Error al agregar usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta para actualizar los datos de un usuario por ID
app.put('/usuarios/:id', async (req, res) => {
    const userId = req.params.id;
    const { nombre, email } = req.body;

    if (!userId || (!nombre && !email)) {
        return res.status(400).json({ error: 'Se requiere al menos un campo para actualizar (nombre o email)' });
    }

    try {
        // Verificar si el usuario existe en la base de datos
        const [userRows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [userId]);
        const user = userRows[0];

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Construir la consulta SQL para actualizar los campos proporcionados
        const updateFields = [];
        const updateValues = [];

        if (nombre) {
            updateFields.push('nombre = ?');
            updateValues.push(nombre);
        }

        if (email) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }

        updateValues.push(userId);

        const updateQuery = `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`;
        await pool.query(updateQuery, updateValues);

        //Mensaje de los logs
        const tipo_log = "Datos de usuario actualizados";
        const metodo = "PUT";
        const application = "USERS_API_REST";
        const modulo = "app.js"
        const fecha = new Date().toISOString();
        const mensaje = "LOS DATOS DE UN USUARIO SE HAN ACTUALIZADO";
        //Enviar mensaje
        await sendMessage(tipo_log, metodo,application, modulo, fecha, mensaje);

        res.json({ message: 'Datos de usuario actualizados con éxito' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta para eliminar un usuario por ID
app.delete('/usuarios/:id', async (req, res) => {
    const userId = req.params.id;

    if (!userId) {
        return res.status(400).json({ error: 'ID de usuario no proporcionado' });
    }

    try {
        const result = await pool.query('DELETE FROM usuarios WHERE id = ?', [userId]);
        if (!result.error) {
            //Mensaje de los logs
            const tipo_log = "Eliminar usuario";
            const metodo = "DELETE";
            const application = "USERS_API_REST";
            const modulo = "app.js"
            const fecha = new Date().toISOString();
            const mensaje = "SE HA ELIMINADO UN USUARIO";
            //Enviar mensaje
            await sendMessage(tipo_log, metodo,application, modulo, fecha, mensaje);

            res.json({ message: 'Usuario eliminado con éxito' });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});


// Ruta para el inicio de sesión de usuario
app.post('/sesion', async (req, res) => {
    const { email, contrasena } = req.body;

    // Validar los datos de inicio de sesión
    if (!email || !contrasena) {
        res.status(400).json({ error: 'Email y contraseña son obligatorios' });
        return;
    }

    try {
        // Verificar si el usuario existe en la base de datos
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        const user = rows[0];

        if (!user || contrasena !== user.contraseña) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }

        // Generar un token JWT con los datos del usuario
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        //Mensaje de los logs
        const tipo_log = 'Inicio sesion';
        const metodo = "POST.";
        const application = "USERS_API_REST";
        const modulo = "app.js"
        const fecha = new Date().toISOString();
        const mensaje = "UN USUARIO HA INICIADO SESION.";

        console.log('fecha server: ', fecha);
        //Enviar mensaje
        await sendMessage(tipo_log, metodo,application, modulo, fecha, mensaje);

        // Enviar el token como respuesta
        res.json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta para actualizar la contraseña del usuario
app.put('/usuarios/:id/clave', verificarToken.verificarToken, async (req, res) => {
    const userId = req.params.id;
    const { contrasenaActual, nuevaContrasena } = req.body;

    if (!userId || !contrasenaActual || !nuevaContrasena) {
        res.status(400).json({ error: 'Todos los campos son obligatorios' });
        return;
    }

    // Aquí agregamos una impresión para mostrar el token recibido
    console.log('Token recibido en la solicitud PUT:', req.header('Authorization'));

    try {
        // Verificar si el usuario existe en la base de datos
        const [rows] = await pool.execute('SELECT * FROM usuarios WHERE id = ?', [userId]);
        const user = rows[0];

        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }

        // Verificar que la contraseña actual coincida con la almacenada en la base de datos
        if (user.contraseña !== contrasenaActual) {
            res.status(401).json({ error: 'Contraseña actual incorrecta' });
            return;
        }

        // Actualizar la contraseña del usuario en la base de datos
        await pool.execute('UPDATE usuarios SET contraseña = ? WHERE id = ?', [nuevaContrasena, userId]);

        //Mensaje de los logs
        const tipo_log = "Actualizar contraseña";
        const metodo = "PUT";
        const application = "USERS_API_REST";
        const modulo = "app.js"
        const fecha = new Date().toISOString();
        const mensaje = "SE HA ACTUALIZADO LA CONTRASEÑA DE UN USUARIO";
        //Enviar mensaje
        await sendMessage(tipo_log, metodo,application, modulo, fecha, mensaje);

        res.json({ message: 'Contraseña actualizada con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta para solicitar recuperación de contraseña
app.post('/recuperacion_contra', async (req, res) => {
    const { email } = req.body;

    try {
        // Consultar la base de datos para verificar si el correo electrónico está registrado
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        
        // Si no se encuentra ningún usuario con el correo electrónico proporcionado, responder con un mensaje de error
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'El correo electrónico no está registrado' });
        }

        // Generar un token de recuperación de contraseña
        const resetToken = uuidv4();
        const expirationTime = new Date(Date.now() + 30 * 60 * 1000);
        resetTokens[email] = { token: resetToken, expirationTime };

        //Mensaje de los logs
        const tipo_log = "Recuperar contraseña";
        const metodo = "POST";
        const application = "USERS_API_REST";
        const modulo = "app.js"
        const fecha = new Date().toISOString();
        const mensaje = "SE HA RECUPERADO LA CONTRASEÑA DE UN USUARIO";
        //Enviar mensaje
        await sendMessage(tipo_log, metodo,application, modulo, fecha, mensaje);

        // Aquí solo mostramos el token generado
        return res.status(200).json({ mensaje: 'Se ha generado un token de recuperación', token: resetToken });
    } catch (error) {
        console.error('Error al verificar el correo electrónico en la base de datos:', error);
        return res.status(500).json({ mensaje: 'Error al verificar el correo electrónico en la base de datos' });
    }
});

// Ruta para restablecer la contraseña
app.post('/restablecimiento_contra', async (req, res) => {
    const { email, new_password, reset_token } = req.body;

    try {
        // Verificar si el token coincide con el token almacenado
        if (resetTokens[email]) {
            const tokenInfo = resetTokens[email];
            const token = tokenInfo.token;
            const expirationTime = tokenInfo.expirationTime;

            if (token === reset_token && expirationTime > new Date()) {
                // Actualizar la contraseña en la base de datos
                await pool.query('UPDATE usuarios SET contraseña = ? WHERE email = ?', [new_password, email]);

                // Eliminar el token después de su uso
                delete resetTokens[email];

                //Mensaje de los logs
                const tipo_log = 'Restablecer contraseña';
                const metodo = "POST";
                const application = "USERS_API_REST";
                const modulo = "app.js"
                const fecha = new Date().toISOString();
                const mensaje = "RESTABLECIMIENTO DE LA CONTRASEÑA DE UN USUARIO";
                //Enviar mensaje
                await sendMessage(tipo_log, metodo,application, modulo, fecha, mensaje);

                return res.status(200).json({ mensaje: 'Contraseña actualizada exitosamente' });
            } else {
                return res.status(400).json({ mensaje: 'Token de recuperación inválido o expirado' });
            }
        } else {
            return res.status(400).json({ mensaje: 'No se encontró el token de recuperación' });
        }
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        return res.status(500).json({ mensaje: 'Error al restablecer la contraseña' });
    }
});


//iniciar el servidor en el puerto predeterminado 3000
app.listen(port, () => {
    console.log('Servidor Express escuchando en el puerto', port);
});
