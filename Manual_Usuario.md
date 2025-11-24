# Manual de Usuario – Colombia Royale
### 1. Introducción

Colombia Royale es una recreación inspirada en Clash Royale, pero con un toque colombiano: cartas, personajes y escenarios basados en la cultura local.
Fue desarrollado como proyecto académico utilizando JavaScript, HTML y Canvas.

Este manual explica cómo ejecutar el juego, cómo moverte por el menú principal, configurar tu mazo, cambiar el mapa (arena) y entender el gameplay básico.

### 2. Cómo Ejecutar el Juego

- Descarga el proyecto desde GitHub.

- Dentro de la carpeta del juego, ubica el archivo: **index.html**

- Haz doble clic sobre index.html para abrirlo en tu navegador.

Puedes jugar en cualquier navegador moderno como:

- Google Chrome

- Firefox

- Edge

No necesitas instalar nada. El juego corre 100% en el navegador.

### 3. Pantalla Principal

Cuando abres el juego, verás:

- Contador de Victorias y derrotas
- Selector de arena:
    En esta seccion se encontraran tres escenarios, Ingenieria, Medicina y Plaza che.
- Botón "¡A PELEAR!" para iniciar la partida.
- Botón "Ver Mazo"
  
<img width="352" height="638" alt="image" src="https://github.com/user-attachments/assets/1c87326b-29bb-4a34-81d5-359795d22c75" />


### 4. Configuración del Mazo

En esta seccion se vera un apartado donde iran las cartas de el mazo.
Mas abajo se encuentra la coleccion de cartas disponibles para jugar, se pueden agregar al mazo solo pulsandolas y tendras que escoger 
6 cartas para jugar.
En la parte de abajo hay 3 botones
- "Aleatorio" para poner las cartas aleatoriamente
- "Confirmar"
- "Cancelar"
 <img width="360" height="634" alt="image" src="https://github.com/user-attachments/assets/653ed3b5-d88b-48b2-9224-c314b6840cf4" />
 
> Al final de el documento estan todas las cartas y sus estadisticas

### 5. Gameplay 
El jugador tendra que enfrentarse contra un bot que hara lo posible para ganar.
Hay dos tipos de cartas, tropas y hechizos, los hechizos se pueden poner en cualquier parte de la arena y haran daño en tres segundos en el rango estimado a partir de su posicionamiento.
Hay dos tropas que solo atacaran a las torres, con el fin de que no se distraigan atacando tropas enemigas y sea mas facil ganar.
Se deberan desplegar las tropas en el campo propio (la mitad inferior de la pantalla), las cuales deberan atravezar el rio de el medio y atacar al rival.
El jugador estara limitado por el elixir, que determina cuando se pueden lanzar las cartas dependiendo su costo.

#### Objetivo del juego
En cada lado de la arena hay tres torres, dos torres pequeñas y una grande. Cada torre atacara a las cartas enemigas con el fin de apoyar a las aliadas.
El objerivo es destruir las torres de el enemigo y defender las propias. Se tendran tres minutos para hacer esto y el ganador sera el que destruya mas torres. 
Si el tiempo se acaba y ninguna torre ha caido, perdera el que tenga las torres con menos vida.

<img width="353" height="626" alt="image" src="https://github.com/user-attachments/assets/f65c89de-56e2-48bb-b3a5-907dc859b007" />


## TROPAS

## Indio
<img width="1024" height="1432" alt="image" src="https://github.com/user-attachments/assets/fb769ddc-ee22-4e43-9ce4-0139b39d1eb8" />


- Tipo: Tropa
- Coste: 3
- Descripción: Dispara lanzas a distancia.

**Estadísticas:**
- Vida: 800
- Daño: 120
- Vel. de ataque: 1.2 s
- Objetivo: Todas las entidades.
- Aereo: No

  

## Gigante
<img width="1024" height="1430" alt="image" src="https://github.com/user-attachments/assets/f5236c9f-3899-4315-9883-7728f67af075" />

- Tipo: Tropa
- Coste: 5
- Descripción: Tanque pesado que ataca exclusivamente estructuras.

**Estadísticas:**
- Vida: 2000
- Daño: 150
- Vel. de ataque: 1.5 s
- Objetivo: Estructuras
- Aereo: No



## Policía
<img width="1024" height="1430" alt="image" src="https://github.com/user-attachments/assets/b1d8e4fa-5cca-455e-bde2-215ab39ea858" />


- Tipo: Tropa
- Coste: 4
- Descripción: Unidad a distancia que mantiene el orden.
  
**Estadísticas:**
- Vida: 500
- Daño: 250
- Vel. de ataque: 1.8 s
- Objetivo: Todos
- Aereo: No


  
## Gymbro
<img width="1024" height="1430" alt="image" src="https://github.com/user-attachments/assets/47af7b41-c81f-4eea-ac15-abf0d15be5d7" />

- Tipo: Tropa
  
- Coste: 4
  
- Descripción: Peleador cuerpo a cuerpo con daño alto.

**Estadísticas:**
- Vida: 800
- Daño: 250
- Vel. de ataque: 1.8 s
- Objetivo: Tierra
- Aereo: No



## Policía Oscuro
<img width="1024" height="1431" alt="image" src="https://github.com/user-attachments/assets/e36837cb-4dc5-40c0-b528-0e662adc9226" />

- Tipo: Tropa
- Coste: 4
- Descripción: Unidad antidisturbios con escudo.
  
**Estadísticas:**
- Vida: 1000
- Daño: 180
- Vel. de ataque: 1.5 s
- Objetivo: Tierra
- Aereo: No



## Campesino
<img width="1024" height="1430" alt="image" src="https://github.com/user-attachments/assets/9d072b8b-4113-447c-86c6-add98b5acc09" />

- Tipo: Tropa
- Coste: 4
- Descripción: Avanza rápido, salta el río y ataca torres directamente.

**Estadísticas:**
- Vida: 800
- Daño: 200
- Vel. de ataque: 1.3 s
- Objetivo: Estructuras
- Aereo: No



### Dron
<img width="1024" height="1431" alt="image" src="https://github.com/user-attachments/assets/085fa7dc-0952-45d6-b8af-a9a111d9d60b" />

- Tipo: Tropa
- Coste: 3
- Descripción: Unidad voladora de soporte.
  
**Estadísticas:**
- Vida: 150
- Daño: 100
- Vel. de ataque: 1.0 s
- Objetivo: Cualquier tipo
- Aereo: Sí



## Skater
<img width="1024" height="1430" alt="image" src="https://github.com/user-attachments/assets/78cfcec1-99c1-4d0b-94b6-dffb398e6879" />

- Tipo: Tropa
- Coste: 5
- Descripción: Avanza rápidamente y golpea fuerte.

**Estadísticas:**
- Vida: 900
- Daño: 300
- Vel. de ataque: 1.5 s
- Objetivo: Tierra
- Aereo: No

## HECHIZOS

### Piedras
<img width="1024" height="1430" alt="image" src="https://github.com/user-attachments/assets/a88d9213-e15c-4ad6-8558-46f8ce3dcddf" />

- Tipo: Hechizo
- Coste: 2
- Descripción: Daño de área pequeño.

**Estadísticas:**
- Daño: 150
- Radio: 2.5
- Objetivo: Todos



### Bomba
<img width="1024" height="1430" alt="image" src="https://github.com/user-attachments/assets/65e1cbff-4423-44f4-bb76-6cc56f91755c" />

- Tipo: Hechizo
- Coste: 4
- Descripción: Explosión fuerte en área reducida.

**Estadísticas:**
- Daño: 400
- Radio: 2.0
- Objetivo: Todos
