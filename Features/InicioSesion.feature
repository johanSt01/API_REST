Feature: Inicio de sesión de usuario

  Escenario: Inicio de sesión exitoso
    Dado que existe un usuario con email "usuario@example.com" y contraseña "contraseña123"
    Cuando se realiza una solicitud POST a "/sesion" con el email y contraseña válidos
    Entonces la respuesta debe tener un código de estado 200
    Y la respuesta debe incluir un mensaje de éxito "Inicio de sesión exitoso"
    Y la respuesta debe incluir un token JWT

  Escenario: Error al iniciar sesión debido a campos faltantes
    Dado que no se proporcionan email y contraseña en la solicitud de inicio de sesión
    Cuando se realiza una solicitud POST a "/sesion" sin los campos requeridos
    Entonces la respuesta debe tener un código de estado 400
    Y la respuesta debe incluir un mensaje de error "Email y contraseña son obligatorios"

  Escenario: Error al iniciar sesión debido a credenciales inválidas
    Dado que se intenta iniciar sesión con credenciales inválidas (email no registrado o contraseña incorrecta)
    Cuando se realiza una solicitud POST a "/sesion" con credenciales inválidas
    Entonces la respuesta debe tener un código de estado 401
    Y la respuesta debe incluir un mensaje de error "Credenciales inválidas"

  Escenario: Error interno al iniciar sesión
    Dado que hay un problema en el servidor al intentar iniciar sesión
    Cuando se realiza una solicitud POST a "/sesion"
    Entonces la respuesta debe tener un código de estado 500
    Y la respuesta debe incluir un mensaje de error "Error en el servidor"
