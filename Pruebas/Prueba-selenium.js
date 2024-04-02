import { Builder } from 'selenium-webdriver';
import fetch from 'node-fetch';
/*
(async function testCreateTable() {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        // Crear una solicitud POST usando fetch
        const response = await fetch('http://localhost:3000/create-table', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Aquí puedes poner los datos que quieres enviar en la solicitud
            })
        });

        // Verificar el código de respuesta
        if (response.ok) {
            console.log('Tabla y datos creados con éxito.');
        } else {
            console.error('Error al crear la tabla:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await driver.quit();
    }
})();

(async function testUsuarios() {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        // Enviar una solicitud GET a la ruta /usuarios
        const response = await fetch('http://localhost:3000/usuarios');
        const data = await response.json();

        // Verificar si la respuesta contiene los datos esperados
        if (response.ok) {
            console.log('Respuesta recibida:', data);
            // Aquí puedes agregar aserciones para verificar los datos recibidos
        } else {
            console.error('Error al obtener usuarios:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await driver.quit();
    }
})();

(async function testAgregarUsuario() {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        // Datos del nuevo usuario
        const nuevoUsuario = {
            nombre: 'New user',
            contrasena: '1234',
            email: 'usuarioNew@example.com'
        };

        // Enviar una solicitud POST a la ruta /usuarios con los datos del nuevo usuario
        const response = await fetch('http://localhost:3000/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoUsuario)
        });

        // Verificar si la respuesta contiene los datos esperados
        if (response.ok) {
            const responseData = await response.json();
            console.log('Respuesta recibida:', responseData);
            // Aquí puedes agregar aserciones para verificar la respuesta
        } else {
            console.error('Error al agregar usuario:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await driver.quit();
    }
})();

(async function testActualizarUsuario() {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        // Datos actualizados del usuario
        const datosActualizados = {
            nombre: 'Nuevo Nombre',
            email: 'usuarioNew@example.com'
        };

        // ID del usuario a actualizar
        const userId = 14; // Reemplazar con el ID del usuario que deseas actualizar

        // Enviar una solicitud PUT a la ruta /usuarios/:id con los datos actualizados del usuario
        const response = await fetch(`http://localhost:3000/usuarios/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosActualizados)
        });

        // Verificar si la respuesta contiene los datos esperados
        if (response.ok) {
            const responseData = await response.json();
            console.log('Respuesta recibida:', responseData);
            // Aquí puedes agregar aserciones para verificar la respuesta
        } else {
            console.error('Error al actualizar usuario:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await driver.quit();
    }
})();

(async function testEliminarUsuario() {
    const driver = await new Builder().forBrowser('chrome').build();

    try{
        //ID del usuario a eliminar
        const userId = 14

        // Enviar una solicitud DELETE a la ruta /usuarios/:id
        const response = await fetch(`http://localhost:3000/usuarios/${userId}`, {
            method: 'DELETE',
        });

        // Verificar si la respuesta contiene los datos esperados
        if (response.ok) {
            const responseData = await response.json();
            console.log('Respuesta recibida:', responseData);
        } else {
            console.error('Error al eliminar usuario:', response.statusText);
        }

    }catch(error){
        console.error('Error:', error);
    }finally{
        await driver.quit();
    }
})();

(async function testIniciarSesion() {
    const driver = await new Builder().forBrowser('chrome').build();

    try{
        //Datos de inicio de sesion
        const DatosInicioSesion = {
            email: 'User@example.com',
            contrasena: '12345'
        };
        //Enviar una solicitud POST a la ruta /sesion con los datos del inicio de sesion
        const response = await fetch(`http://localhost:3000/sesion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(DatosInicioSesion)
        });

        // Verificamos si la respuesta contiene los datos esperados
        if(response.ok){
            const responseData = await response.json();
            console.log('Respuesta recibida: ', responseData);
        }else{
            console.error('Error al iniciar sesion:', response.statusText);
        }
    }catch(error){
        console.error('Error:', error);
    }finally{
        await driver.quit();
    }
})();

(async function testActualizarContraseña() {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        // Datos de la contraseña actualizada
        const datosContraseña = {
            contrasenaActual: '12345',
            nuevaContrasena: 'nuevaContraseña'
        };

        // ID del usuario cuya contraseña se va a actualizar
        const userId = 7; // Reemplazar con el ID del usuario que deseas actualizar la contraseña

        // Enviar una solicitud PUT a la ruta /usuarios/:id/clave con los datos de la contraseña actualizada
        const response = await fetch(`http://localhost:3000/usuarios/${userId}/clave`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // Aquí puedes incluir el token de autenticación si es necesario
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsImlhdCI6MTcxMjAyMzc1NSwiZXhwIjoxNzEyMDI3MzU1fQ.CAawueLo_LL8G3ub7V8on1Ut2odzC9GWgdzbS9Zw9HQ'
            },
            body: JSON.stringify(datosContraseña)
        });

        // Verificar si la respuesta contiene los datos esperados
        if (response.ok) {
            const responseData = await response.json();
            console.log('Respuesta recibida:', responseData);
            // Aquí puedes agregar aserciones para verificar la respuesta
        } else {
            console.error('Error al actualizar la contraseña:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await driver.quit();
    }
})();

(async function testReestablecerContra() {
    const driver = await new Builder().forBrowser('chrome').build();

    try{

        //Email del usuario para recibir el token de recuperacion de contraseña
        const email = 'User@example.com';

        //Enviar la solicitud POST a la ruta /restablecimiento_contra con el email del usuario
        const response = await fetch(`http://localhost:3000/recuperacion_contra`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        //Verificar si la respuesta tiene los datos esperados
        if(response.ok){
            const responseData = await response.json();
            console.log('Respuesta recibida:', responseData);
        }else{
            console.error('Error al solicitar recuperación de contraseña:', response.statusText);
        }
    }catch(error){
        console.error('Error:', error);
    }finally{
        await driver.quit();
    }
})();
*/
(async function testRestablecimientoContraseña() {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        // Datos para el restablecimiento de contraseña
        const datosRestablecimiento = {
            email: 'User@example.com',
            new_password: '12345678',
            reset_token: '5903f999-69f4-47b8-a57f-7cd790702247'
        };

        // Enviar una solicitud POST a la ruta /restablecimiento_contra con los datos de restablecimiento de contraseña
        const response = await fetch('http://localhost:3000/restablecimiento_contra', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosRestablecimiento)
        });

        // Verificar si la respuesta contiene los datos esperados
        if (response.ok) {
            const responseData = await response.json();
            console.log('Respuesta recibida:', responseData);
            // Aquí puedes agregar aserciones para verificar la respuesta
        } else {
            console.error('Error al restablecer la contraseña:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await driver.quit();
    }
})();