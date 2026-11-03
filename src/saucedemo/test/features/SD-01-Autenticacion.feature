# language: es
@SD-01 @autenticacion @paralelo
Característica: SD-01 - Autenticación y Control de Acceso en Sauce Demo
  Como usuario de la plataforma Sauce Demo
  Quiero autenticarme con mis credenciales
  Para acceder al catálogo de productos o recibir la retroalimentación adecuada si mi acceso está restringido

  Antecedentes:
    Dado que el cliente se encuentra en la página de inicio de sesión de Sauce Demo

  @SD-01-EC01 @smoke
  Escenario: SD-01-EC01 - Inicio de sesión exitoso con usuario estándar
    Cuando inicia sesión con usuario "standard_user" y contraseña "secret_sauce"
    Entonces se visualiza el título de página "Products"

  @SD-01-EC02
  Escenario: SD-01-EC02 - Intento de inicio de sesión con usuario bloqueado
    Cuando intenta iniciar sesión con el perfil de usuario "LOCKED_OUT"
    Entonces se visualiza el mensaje de error "Sorry, this user has been locked out."
    Y permanece en la pantalla de inicio de sesión

  @SD-01-EC03
  Esquema del escenario: SD-01-EC03 - Validación de credenciales inválidas o incompletas
    Cuando inicia sesión con usuario "<usuario>" y contraseña "<password>"
    Entonces se visualiza un mensaje de error que contiene "<mensaje_esperado>"
    Y permanece en la pantalla de inicio de sesión

    Ejemplos:
      | usuario         | password        | mensaje_esperado                      |
      | usuario_invalido| secret_sauce    | Username and password do not match    |
      | standard_user   | clave_erronea   | Username and password do not match    |
      |                 | secret_sauce    | Username is required                  |

