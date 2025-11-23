# Colombia Royale
> #### Elaborado por:
> - Sebastian David Perez
> - Juan Esteban Cristiano
> - Brayan Santiago Amado

Colombia Royale es un proyecto desarrollado en JavaScript que recrea la esencia del juego Clash Royale, pero adaptado con un estilo, personajes y temática más colombiana.
A diferencia del juego original, este proyecto introduce:
> - Cartas inspiradas en personajes colombianos.
> - Arena con escenarios inspirados en la Universidad Nacional de Colombia.
> - IA rival simplificada pero funcional.
> - Uso de estructuras de datos implementadas manualmente (matrices dispersas, árboles de decisión, colas, diccionarios).
**Este proyecto fue desarrollado para la materia de Estructuras de Datos en la Universidad Nacional de Colombia.**

#### 1. Diccionario (Hash Map)
##### Implementación:
Se utiliza un Objeto JavaScript (cardsData en data.js) que funciona como un Mapa Hash o Diccionario.

##### Propósito:
Almacenar la información estática de todas las cartas del juego. Permite acceso inmediato O(1) a los datos de una carta (vida, daño, sprite, coste) utilizando su clave única (ID).

##### Ejemplo de Uso:
Cuando el jugador selecciona la carta "Indio", el sistema busca:

**cardsData["indio"]*
para instanciar la unidad con sus estadísticas base sin tener que recorrer un array.

#### 2. Matriz Dispersa (Sparse Matrix)
##### Implementación:
Clase personalizada SparseMatrix en game.js.
Utiliza un Map interno donde las claves son cadenas compuestas por coordenadas:
"fila,columna"

##### Propósito:

Gestionar el mapa de colisiones y zonas lógicas (río, puentes) de la arena.
Eficiencia de Memoria: Solo se almacenan en memoria las celdas que contienen obstáculos (Río = 1, Puente = 2). Las celdas vacías (caminables) no ocupan espacio.
Lógica de Pathfinding: Las unidades consultan esta matriz para saber si pueden caminar o si deben buscar un puente.

#### 3. Árbol de Decisiones (Decision Tree)
##### Implementación:
Función updateEnemyAI() en game.js.

##### Propósito:

Controlar la Inteligencia Artificial del rival. Evalúa el estado del juego en cada ciclo y toma decisiones ramificadas:

- Nodo Raíz: ¿Tengo suficiente elixir?
- Rama Defensiva: ¿Hay unidades enemigas en mi territorio?
    Sí: Buscar carta barata y desplegar cerca de la amenaza.
- Rama Ofensiva: ¿Tengo elixir casi lleno (>8)?
    Sí: Seleccionar carta fuerte y desplegar en un puente aleatorio para atacar.

#### 4. Colas y Arrays (Queue & List)
##### Mazo y Ciclo (Deck Cycle):
Se utilizan Arrays manipulados como colas (FIFO) para gestionar la rotación de cartas.
- hand: Array de 3 elementos visibles.
- deckPile: Pila oculta. Cuando se juega una carta, esta sale de la mano, va al final de la pila, y la siguiente carta de la pila entra a la mano.

##### Listas de Entidades:
Arrays dinámicos units[] y towers[] que almacenan los objetos vivos en el juego.
Se recorren en cada frame para:
- Actualizar su posición
- Verificar colisiones
- Dibujar en el Canvas
  
> #### Uso de IA
> Para la realizacion de este proyecto se uso un aproximado de 40% de Inteligencia Artificial, empleada para hacer la parte grafica (Imagen de cartas, Animaciones, Interfaces, etc) y en la realizacion del bot enemigo. 
