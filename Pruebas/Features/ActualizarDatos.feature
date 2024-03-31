Feature: Actualizar datos de un usuario por ID

  Escenario: Actualizar datos de un usuario exitosamente
    Dado que existe un usuario con ID "1"
    Cuando se realiza una solicitud PUT a "/usuarios/1" con los datos actualizados: nombre "NuevoNombre" y email "nuevo@example.com"
    Entonces la respuesta debe tener un código de estado 200
    Y la respuesta debe incluir un mensaje de éxito "Datos de usuario actualizados con éxito"

  Escenario: Error al actualizar datos de un usuario debido a campos faltantes
    Dado que se intenta actualizar los datos de un usuario con campos faltantes
    Cuando se realiza una solicitud PUT a "/usuarios/1" con datos incompletos
    Entonces la respuesta debe tener un código de estado 400
    Y la respuesta debe incluir un mensaje de error "Se requiere al menos un campo para actualizar (nombre o email)"

  Escenario: Error al actualizar datos de un usuario porque el usuario no existe
    Dado que se intenta actualizar los datos de un usuario que no existe en la base de datos
    Cuando se realiza una solicitud PUT a "/usuarios/999" con los datos actualizados
    Entonces la respuesta debe tener un código de estado 404
    Y la respuesta debe incluir un mensaje de error "Usuario no encontrado"

  Escenario: Error interno al actualizar datos de un usuario
    Dado que hay un problema en el servidor al intentar actualizar los datos de un usuario
    Cuando se realiza una solicitud PUT a "/usuarios/1"
    Entonces la respuesta debe tener un código de estado 500
    Y la respuesta debe incluir un mensaje de error "Error en el servidor"
