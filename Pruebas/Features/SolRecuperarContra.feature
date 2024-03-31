    Feature: Solicitar recuperación de contraseña

  Escenario: Solicitar recuperación de contraseña exitosamente
    Dado que existe un usuario con email "usuario@example.com" registrado en la base de datos
    Cuando se realiza una solicitud POST a "/recuperacion_contra" con el email del usuario
    Entonces la respuesta debe tener un código de estado 200
    Y la respuesta debe incluir un mensaje de éxito "Se ha generado un token de recuperación"
    Y la respuesta debe incluir un token de recuperación

  Escenario: Error al solicitar recuperación de contraseña debido a correo electrónico no registrado
    Dado que se intenta solicitar recuperación de contraseña para un correo electrónico no registrado en la base de datos
    Cuando se realiza una solicitud POST a "/recuperacion_contra" con un correo electrónico no registrado
    Entonces la respuesta debe tener un código de estado 404
    Y la respuesta debe incluir un mensaje de error "El correo electrónico no está registrado"

  Escenario: Error interno al solicitar recuperación de contraseña
    Dado que hay un problema en el servidor al intentar procesar la solicitud de recuperación de contraseña
    Cuando se realiza una solicitud POST a "/recuperacion_contra"
    Entonces la respuesta debe tener un código de estado 500
    Y la respuesta debe incluir un mensaje de error "Error al verificar el correo electrónico en la base de datos"
