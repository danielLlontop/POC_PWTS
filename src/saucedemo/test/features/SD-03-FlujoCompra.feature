# language: es
@SD-03 @compra @e2e @smoke @paralelo
Característica: SD-03 - Flujo de Compra de Extremo a Extremo (E2E)
  Como cliente de Sauce Demo
  Quiero completar el proceso de checkout con mis artículos elegidos
  Para recibir la confirmación de mi orden y verificar los cálculos de costos e impuestos

  Antecedentes:
    Dado que el cliente ha iniciado sesión como "STANDARD"

  @SD-03-EC01
  Escenario: SD-03-EC01 - Compra exitosa de múltiples productos con cálculo verificado
    Dado que el cliente tiene 2 productos agregados en el carrito de compras
    Cuando inicia el proceso de compra
    Y completa el formulario con sus datos de envío
    Y confirma la orden de compra
    Entonces se visualiza la pantalla de confirmación con el mensaje "Thank you for your order!"
    Y el número de ítems en el resumen de orden es 2
    Y el total calculado de la compra coincide con el subtotal más los impuestos

