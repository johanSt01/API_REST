Feature: Agregar un nuevo usuario

  Escenario: Agregar un nuevo usuario exitosamente
    Dado que se tiene un nuevo usuario con nombre "Alice", contraseña "123456" y correo electrónico "alice@example.com"
    Cuando se realiza una solicitud POST a "/usuarios" con los datos del nuevo usuario
    Entonces la respuesta debe tener un código de estado 200
    Y la respuesta debe incluir un mensaje de éxito "Usuario agregado con éxito"

  Escenario: Error al agregar un nuevo usuario debido a campos faltantes
    Dado que se tiene un nuevo usuario con campos faltantes
    Cuando se realiza una solicitud POST a "/usuarios" con datos incompletos
    Entonces la respuesta debe tener un código de estado 400
    Y la respuesta debe incluir un mensaje de error "Todos los campos son obligatorios"

  Escenario: Error al agregar un nuevo usuario porque el correo electrónico ya está registrado
    Dado que el correo electrónico "bob@example.com" ya está registrado en la base de datos
    Cuando se realiza una solicitud POST a "/usuarios" con el correo electrónico "bob@example.com"
    Entonces la respuesta debe tener un código de estado 400
    Y la respuesta debe incluir un mensaje de error "El correo electrónico ya está registrado"

  Escenario: Error interno al agregar un nuevo usuario
    Dado que hay un problema en el servidor al intentar agregar un nuevo usuario
    Cuando se realiza una solicitud POST a "/usuarios"
    Entonces la respuesta debe tener un código de estado 500
    Y la respuesta debe incluir un mensaje de error "Error en el servidor"
