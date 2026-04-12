# ⚔️ Pokémon Battle

## 🌐 Live Demo
👉 https://www.loom.com/share/bff98b5bc5ea4b289bf1dba10cbacb34

---

## 🧠 Mi Pokémon Favorito: Golduck
Elegí a **Golduck** porque representa el equilibrio perfecto entre elegancia y poder. Su conexión con habilidades psíquicas y acuáticas lo convierte en un luchador versátil. En este proyecto, personifica la agilidad necesaria para dominar el sistema de combate en tiempo real.

---

## 💥 Movimiento Definitivo (Ultimate)
**Nombre:** Tsunami Final 🌊  
**Descripción:** Una ola colosal envuelve el escenario, eliminando cualquier rastro de resistencia enemiga. Es una victoria técnica instantánea que limpia el tablero.

**Inspiración:** Está inspirado en la fuerza imparable de la naturaleza. Busqué un ataque que no solo hiciera daño, sino que "congelara" la lógica del juego (cancelando procesos asíncronos del oponente) para dar un cierre épico y limpio a la batalla.

---

## 🎮 Instrucciones de Juego (Gameplay)

El motor de combate es de **acción en tiempo real** (Action-RPG). La victoria depende de tus reflejos:

1.  **Movilidad:** Usa **Flecha Izquierda (←)** y **Flecha Derecha (→)** para moverte entre los 3 carriles del grid.
2.  **Ataque:** Haz clic con el **mouse** en los movimientos disponibles. Cada ataque tiene un **Cooldown (enfriamiento)** visual que debes gestionar.
3.  **Esquiva:** Si una celda del suelo parpadea en **rojo**, el enemigo atacará ahí en milisegundos. ¡Muévete a un carril seguro!
4.  **Especial:** El botón de Movimiento Definitivo se habilita una vez por batalla para asegurar el KO final.

---

## 🎨 Type Theming Dinámico
El proyecto implementa un sistema de **colores dinámicos** basados en el tipo elemental (Fuego, Agua, Planta, etc.) obtenido de la PokeAPI.

-   **Identidad Visual:** El sistema inyecta variables CSS en tiempo real para cambiar sombras neón, fondos de barras de vida y degradados de tarjetas.
-   **Extensión:** Aunque el requerimiento pedía theming para el jugador, lo extendí al oponente para mejorar la inmersión y facilitar la identificación visual del rival.

---

## ⚙️ Funcionalidades Implementadas

### 🔹 Stage 1: Preparación y Búsqueda
✔ **Configuración Dinámica:** Carga automática del Pokémon favorito desde `trainer.config.js`.  
✔ **Optimización de Búsqueda:** Implementación de **Debounce** para evitar saturar la API.  
✔ **Control de Flujo:** Uso de **AbortController** para cancelar peticiones de búsqueda obsoletas.  
✔ **Experiencia de Usuario (UX):** Skeleton loading independiente para jugador y oponente.  
✔ **Persistencia:** Guardado del último oponente y estado de preparación en `localStorage`.

### 🔹 Stage 2: Motor de Batalla (Real-Time)
✔ **Sistema de Grid 3x1:** Lógica de posiciones para esquivar ataques entrantes.  
✔ **IA de Combate:** Ciclos de ataque aleatorios con tiempos de reacción dinámicos.  
✔ **Feedback de Impacto:** Animaciones de sacudida (`dmg-shake`) y marcadores visuales (✘) al recibir daño.  
✔ **Gestión Asíncrona Robusta:** Uso de un array de `timers` para rastrear y cancelar `setTimeout` al finalizar la batalla, evitando "ataques fantasma" post-mortem.  
✔ **Renderizado de 60fps:** Uso de `requestAnimationFrame` para cooldowns y barras de vida fluidas.

---

## 🧠 Conceptos Clave de Desarrollo

### 1. Manejo de Estado Global (State Management)
Ubicación: `stage-2/battle.js`  
Toda la aplicación se rige por un único objeto `state`. Esto permite que la función de renderizado sea **predecible**: si el estado cambia (vida, posición, fase), la UI se actualiza automáticamente.

### 2. Sincronización de Procesos
Para el Stage 2, implementamos una lógica de **"Fase de Batalla"**. Al activar la victoria o derrota, el sistema cambia a `phase: 'ended'`, bloqueando inmediatamente los listeners del teclado y limpiando todos los procesos asíncronos pendientes para garantizar un cierre de código limpio.

### 3. Fórmulas de Combate
Ubicación: `stage-2/battle.js`  
El daño no es estático; se calcula mediante algoritmos que consideran el `power` del movimiento y las estadísticas base (`attack`, `hp`) escaladas para ofrecer una experiencia equilibrada.

---

## 📁 Estructura del Proyecto
```text
PROYECTO2_WEB_POKEAPI/
│
├── index.html              # Pantalla de inicio
├── style.css               # Estilos globales y animaciones
├── trainer.config.js       # Configuración del Pokémon favorito
│
├── stage-1/                # Módulo de búsqueda
│   ├── index.html
│   ├── main.js             # Lógica de búsqueda y filtrado
│   ├── api.js              # Fetching y AbortController
│   └── render.js           # Skeletons y renderizado de tarjetas
│
├── stage-2/                # Módulo de batalla (Real-Time)
│   ├── index.html
│   ├── main.js             # Game Loop y Event Listeners
│   ├── battle.js           # Estado global y fórmulas
│   └── render.js           # Motor de renderizado dinámico
│
└── README.md