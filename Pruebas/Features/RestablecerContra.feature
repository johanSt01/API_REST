Feature: Restablecer contraseña

  Escenario: Restablecer contraseña exitosamente
    Dado que se tiene un token de recuperación válido para el email "usuario@example.com"
    Cuando se realiza una solicitud POST a "/restablecimiento_contra" con el email, nueva contraseña y token de recuperación válidos
    Entonces la respuesta debe tener un código de estado 200
    Y la respuesta debe incluir un mensaje de éxito "Contraseña actualizada exitosamente"

  Escenario: Error al restablecer contraseña debido a token de recuperación inválido o expirado
    Dado que se intenta restablecer la contraseña con un token de recuperación inválido o expirado
    Cuando se realiza una solicitud POST a "/restablecimiento_contra" con el email, nueva contraseña y token de recuperación inválidos
    Entonces la respuesta debe tener un código de estado 400
    Y la respuesta debe incluir un mensaje de error "Token de recuperación inválido o expirado"

  Escenario: Error al restablecer contraseña porque no se encontró el token de recuperación
    Dado que se intenta restablecer la contraseña pero no se encuentra el token de recuperación asociado al email
    Cuando se realiza una solicitud POST a "/restablecimiento_contra" con el email, nueva contraseña y token de recuperación válidos
    Entonces la respuesta debe tener un código de estado 400
    Y la respuesta debe incluir un mensaje de error "No se encontró el token de recuperación"

  Escenario: Error interno al restablecer contraseña
    Dado que hay un problema en el servidor al intentar procesar la solicitud de restablecimiento de contraseña
    Cuando se realiza una solicitud POST a "/restablecimiento_contra"
    Entonces la respuesta debe tener un código de estado 500
    Y la respuesta debe incluir un mensaje de error "Error al restablecer la contraseña"
