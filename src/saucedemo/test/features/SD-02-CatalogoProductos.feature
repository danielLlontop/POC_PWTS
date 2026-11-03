# language: es
@SD-02 @catalogo @paralelo
Característica: SD-02 - Exploración, Ordenamiento y Selección en el Catálogo de Productos
  Como cliente autenticado en Sauce Demo
  Quiero explorar el catálogo, aplicar criterios de ordenamiento y seleccionar productos
  Para gestionar los artículos que deseo comprar

  Antecedentes:
    Dado que el cliente ha iniciado sesión como "STANDARD"

  @SD-02-EC01
  Escenario: SD-02-EC01 - Ordenamiento del catálogo por precio de menor a mayor
    Cuando ordena el catálogo de productos por "Precio (menor a mayor)"
    Entonces los productos se visualizan ordenados por precio de forma "menor a mayor"

  @SD-02-EC02
  Escenario: SD-02-EC02 - Ordenamiento del catálogo alfabéticamente de forma descendente
    Cuando ordena el catálogo de productos por "Nombre (Z a A)"
    Entonces los productos se visualizan ordenados alfabéticamente de forma "descendente"

  @SD-02-EC03
  Escenario: SD-02-EC03 - Agregar y remover productos desde el catálogo actualizando el carrito
    Cuando agrega el producto "Sauce Labs Backpack" al carrito de compras
    Y agrega el producto "Sauce Labs Bike Light" al carrito de compras
    Entonces el contador del carrito muestra 2 productos
    Cuando remueve el producto "Sauce Labs Bike Light" del catálogo
    Entonces el contador del carrito muestra 1 producto

