Feature: Eliminar un usuario por ID

  Escenario: Eliminar un usuario exitosamente
    Dado que existe un usuario con ID "1"
    Cuando se realiza una solicitud DELETE a "/usuarios/1"
    Entonces la respuesta debe tener un código de estado 200
    Y la respuesta debe incluir un mensaje de éxito "Usuario eliminado con éxito"

  Escenario: Error al eliminar usuario debido a ID no proporcionado
    Dado que no se proporciona un ID de usuario
    Cuando se realiza una solicitud DELETE a "/usuarios/"
    Entonces la respuesta debe tener un código de estado 400
    Y la respuesta debe incluir un mensaje de error "ID de usuario no proporcionado"

  Escenario: Error al eliminar usuario porque el usuario no existe
    Dado que se intenta eliminar un usuario que no existe en la base de datos
    Cuando se realiza una solicitud DELETE a "/usuarios/999"
    Entonces la respuesta debe tener un código de estado 404
    Y la respuesta debe incluir un mensaje de error "Usuario no encontrado"

  Escenario: Error interno al eliminar usuario
    Dado que hay un problema en el servidor al intentar eliminar un usuario
    Cuando se realiza una solicitud DELETE a "/usuarios/1"
    Entonces la respuesta debe tener un código de estado 500
    Y la respuesta debe incluir un mensaje de error "Error en el servidor"
