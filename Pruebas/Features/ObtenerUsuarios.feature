Feature: Obtener todos los usuarios

  Escenario: Obtener todos los usuarios exitosamente
    Dado que hay usuarios en el sistema
    Cuando se realiza una solicitud GET a "/usuarios"
    Entonces la respuesta debe tener un código de estado 200
    Y la respuesta debe incluir la información de los usuarios

  Escenario: Error al obtener usuarios
    Dado que hay un problema en el servidor
    Cuando se realiza una solicitud GET a "/usuarios"
    Entonces la respuesta debe tener un código de estado 500
    Y la respuesta debe incluir un mensaje de error
