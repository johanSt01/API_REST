import express from 'express';
import crearConexion from './database/db.js';
import { sendMessage } from '../src/rabbitmqService.js';
import { consumeMessages } from "./EventProfile/eventAutomatized.js";

const app = express();
const port = process.env.PORT_PROFILES;
app.use(express.json()); // Middleware para parsear el body de las solicitudes como JSON

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

const db = await esperarConexion();

//Listar los perfiles
app.get('/profiles', async (req, res) => {
    try {
        const [results] = await db.execute('SELECT * FROM Perfil');

        //Mensaje de los logs
        const tipo_log = "Lista de perfiles";
        const metodo = "GET";
        const application = "PROFILE_API";
        const modulo = "routes.js"
        const fecha = new Date().toISOString();
        const mensaje = "UN USUARIO HA LISTADO LOS PERFILES";
        //Enviar mensaje
        await sendMessage(tipo_log, metodo,application, modulo, fecha, mensaje);


        return res.json(results);
    } catch (error) {
        console.error(error);
        return res.json({ error: 'Error al obtener todos los perfiles' });
    }
});

//Listar perfil por id
app.get('/profiles/:id', async (req, res) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({
                mensaje: 'No autorizado, token no existente'
            });
        }

        const id = req.params.id;
        const [results] = await db.execute('SELECT * FROM Perfil WHERE id = ?', [id]);
        if (results.length > 0) {

            //Mensaje de los logs
            const tipo_log = "Listar perfil por id";
            const metodo = "GET";
            const application = "PROFILES_API";
            const modulo = "routes.js"
            const fecha = new Date().toISOString();
            const mensaje = "UN USUARIO HA LISTADO LOS PERFILES";
            //Enviar mensaje
            await sendMessage(tipo_log, metodo,application, modulo, fecha, mensaje);

            return res.json(results[0]);
        } else {
            return res.status(404).json({ mensaje: 'No se encontró el perfil' });
        }
    } catch (error) {
        console.error(error);
        return res.json({ error: error.message });
    }
});

// Crear el perfil de un usuario
app.post('/profiles', async (req, res) => {
    try {
        const { id, nombre, apellido, email } = req.body;

        if (!id || !nombre || !contrasena || !email) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const url_pagina = email;
        const apodo = `${nombre} ${apellido}`;
        const informacion_publica = 1;
        const direccion_correspondencia = "N/A";
        const biografia = "N/A";
        const organizacion = "N/A";
        const pais = "N/A";

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

        const [results] = await db.execute('INSERT INTO Perfil (id, url_pagina, apodo, informacion_publica, direccion_correspondencia, biografia, organizacion, pais) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', values);
            
        if(results.affectedRows > 0){
            //Mensaje de los logs
            const tipo_log = "Crear perfil";
            const metodo = "POST";
            const application = "PROFILE_API";
            const modulo = "routes.js"
            const fecha = new Date().toISOString();
            const mensaje = "UN USUARIO HA CREADO UN PERFIL";
            //Enviar mensaje
            await sendMessage(tipo_log, metodo,application, modulo, fecha, mensaje);
            
            return res.status(200).json({
                mensaje: "Perfil creado exitosamente",
                detalles: "Filas afectadas: "+ results.affectedRows
            });
        }else{
            return res.status(500).json({
                mensaje: "Perfil no creado",
                detalles: "Ha ocurrido un error en la base de datos al crear el perfil"
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Ha ocurrido un error al crear el perfil',
            detalles: error.message
        });
    }
});

// Actualizar el perfil de un usuario
app.put('/profiles/:id', async (req, res) => {
    try {
        //Verificar si el token de bearer token es válido
        if (!req.headers.authorization) {
            return res.status(401).json({
                mensaje: 'No autorizado, token no existente'
            });
        }

        const token_auth = req.headers.authorization.split(' ')[1];

        const profile_id = parseInt(req.params.id);
        
        const {
            url_pagina,
            apodo, 
            informacion_publica, 
            direccion_correspondencia, 
            biografia, 
            organizacion, 
            pais
        } = req.body;
        
        const values = [];
        let updateQuery = `UPDATE Perfil SET `;
        
        if (url_pagina !== undefined && url_pagina !== '') {
            updateQuery += `url_pagina = ?, `;
            values.push(url_pagina);
        }
        
        if (apodo !== undefined && apodo !== '') {
            updateQuery += `apodo = ?, `;
            values.push(apodo);
        }
        
        if (informacion_publica !== undefined && informacion_publica !== '') {
            updateQuery += `informacion_publica = ?, `;
            values.push(informacion_publica);
        }
        
        if (direccion_correspondencia !== undefined && direccion_correspondencia !== '') {
            updateQuery += `direccion_correspondencia = ?, `;
            values.push(direccion_correspondencia);
        }
        
        if (biografia !== undefined && biografia !== '') {
            updateQuery += `biografia = ?, `;
            values.push(biografia);
        }
        
        if (organizacion !== undefined && organizacion !== '') {
            updateQuery += `organizacion = ?, `;
            values.push(organizacion);
        }
        
        if (pais !== undefined && pais !== '') {
            updateQuery += `pais = ?, `;
            values.push(pais);
        }
        
        // Quitar la última coma y espacio del string updateQuery
        updateQuery = updateQuery.slice(0, -2);
        
        // Agregar la condición WHERE
        updateQuery += ` WHERE id = ?`;
        values.push(profile_id);
        
        const [results] = await db.execute(updateQuery, values);
            
        if(results.affectedRows > 0){
            //Mensaje de los logs
            const tipo_log = "Perfil actualizado de un usuario";
            const metodo = "PUT";
            const application = "PROFILE_API";
            const modulo = "routes.js"
            const fecha = new Date().toISOString();
            const mensaje = "UN USUARIO HA ACTUALIZADO SU PERFIL";
            //Enviar mensaje
            await sendMessage(tipo_log, metodo,application, modulo, fecha, mensaje);
                
            return res.status(200).json({
                mensaje: "Perfil actualizado exitosamente",
                detalles: "Filas actualizadas: "+ results.affectedRows
            });
        }else{
            return res.status(401).json({
                mensaje: "Perfil no actualizado",
                detalles: "El perfil no ha sido encontrado"
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Ha ocurrido un error al actualizar el perfil',
            detalles: error.message
        });
    }
});

// Eliminar el perfil de un usuario por ID
app.delete('/profiles/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [results] = await db.execute('DELETE FROM Perfil WHERE id = ?', [id]);

        if (results.affectedRows > 0) {
            //Mensaje de los logs
            const tipo_log = "Eliminar perfil del usuario";
            const metodo = "GET";
            const application = "PROFILE_API";
            const modulo = "routes.js"
            const fecha = new Date().toISOString();
            const mensaje = "UN USUARIO HA ELIMINADO UN PERFIL";
            //Enviar mensaje
            await sendMessage(tipo_log, metodo,application, modulo, fecha, mensaje);

            return res.status(200).json({
                mensaje: "Perfil eliminado exitosamente",
                detalles: "Filas afectadas: " + results.affectedRows
            });
        } else {
            return res.status(404).json({
                mensaje: "Perfil no encontrado",
                detalles: "El perfil con el ID proporcionado no existe en la base de datos"
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Ha ocurrido un error al eliminar el perfil',
            detalles: error.message
        });
    }
});

app.get('/health', (req, res) => {
    res.status(200).send('ok')
});

app.listen(port, () => {
    console.log(`Api de perfiles corriendo en el puerto: ${port}`);
});

// Iniciar proceso consumidor de eventos para la creacion automatica de los profiles
consumeMessages().catch((error) => {
    console.error('Error al iniciar consumeMessagesProfiles:', error);
    server.close();
});