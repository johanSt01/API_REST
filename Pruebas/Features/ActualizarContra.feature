Feature: Actualizar contraseña del usuario

  Escenario: Actualizar contraseña exitosamente
    Dado que existe un usuario con ID "1" y contraseña actual "contraseña123"
    Cuando se realiza una solicitud PUT a "/usuarios/1/clave" con la contraseña actual y nueva contraseña válidas
    Entonces la respuesta debe tener un código de estado 200
    Y la respuesta debe incluir un mensaje de éxito "Contraseña actualizada con éxito"

  Escenario: Error al actualizar contraseña debido a campos faltantes
    Dado que no se proporcionan ID de usuario, contraseña actual y nueva contraseña en la solicitud de actualización de contraseña
    Cuando se realiza una solicitud PUT a "/usuarios//clave" sin los campos requeridos
    Entonces la respuesta debe tener un código de estado 400
    Y la respuesta debe incluir un mensaje de error "Todos los campos son obligatorios"

  Escenario: Error al actualizar contraseña porque el usuario no existe
    Dado que se intenta actualizar la contraseña de un usuario que no existe en la base de datos
    Cuando se realiza una solicitud PUT a "/usuarios/999/clave" con la contraseña actual y nueva contraseña válidas
    Entonces la respuesta debe tener un código de estado 404
    Y la respuesta debe incluir un mensaje de error "Usuario no encontrado"

  Escenario: Error al actualizar contraseña porque la contraseña actual es incorrecta
    Dado que se intenta actualizar la contraseña con una contraseña actual incorrecta
    Cuando se realiza una solicitud PUT a "/usuarios/1/clave" con una contraseña actual incorrecta
    Entonces la respuesta debe tener un código de estado 401
    Y la respuesta debe incluir un mensaje de error "Contraseña actual incorrecta"

  Escenario: Error interno al actualizar contraseña
    Dado que hay un problema en el servidor al intentar actualizar la contraseña del usuario
    Cuando se realiza una solicitud PUT a "/usuarios/1/clave"
    Entonces la respuesta debe tener un código de estado 500
    Y la respuesta debe incluir un mensaje de error "Error en el servidor"
