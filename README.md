# 🧩 Pokémon Battle — Vanilla JS Project

## 🌐 Live Demo
👉 (Agrega aquí tu GitHub Pages URL)

---

## 🧠 Mi Pokémon Favorito

Elegí a **Golduck** porque siempre me ha llamado la atención su diseño y su conexión con habilidades psíquicas y acuáticas. Además, es un Pokémon que combina velocidad y ataque, lo cual lo hace ideal para un estilo de batalla dinámico.

---

## 💥 Movimiento Definitivo

**Nombre:** Tsunami Final  
**Descripción:**  
Una ola gigante destruye todo a su paso, arrasando al oponente sin posibilidad de escape.

**Inspiración:**  
Está inspirado en el poder del agua como fuerza imparable de la naturaleza, combinando el estilo agresivo de Golduck con un ataque visualmente impactante.

---

## 🎨 Type Theming

El proyecto implementa un sistema de **colores dinámicos basados en el tipo principal del Pokémon** obtenido desde la API.

- El **jugador** aplica el color dinámico según su Pokémon favorito (requerimiento obligatorio).
- El **oponente** también aplica un color dinámico según su tipo.

👉 Aunque el requisito solo exigía el theming para el jugador, decidí extenderlo al oponente para mejorar la experiencia visual y hacer más intuitiva la identificación de tipos en pantalla.

---

## ⚙️ Funcionalidades (Stage 1)

✔ Carga automática del Pokémon favorito desde `trainer.config.js`  
✔ Render dinámico de sprite, stats y movimientos  
✔ Tarjeta de entrenador personalizada (nombre, pueblo, frase)  
✔ Búsqueda en tiempo real de oponente (con debounce)  
✔ Cancelación de peticiones con `AbortController`  
✔ Skeleton loading independiente para jugador y oponente  
✔ Manejo de errores sin romper la UI  
✔ Guardado del último oponente en `localStorage`  
✔ Botón de batalla habilitado solo cuando ambos Pokémon están listos  
✔ Transferencia de datos a Stage 2 usando `localStorage`  

---

## 🧠 Conceptos Clave

### 🔹 Fetch API
- Ubicación: `stage-1/api.js`
- Se utiliza para obtener datos desde PokeAPI (Pokémon y movimientos)

---

### 🔹 Render dinámico (DOM)
- Ubicación: `stage-1/render.js`
- Toda la UI se genera dinámicamente a partir del estado

---

### 🔹 Manejo de estado global
- Ubicación: `stage-1/main.js`
- Un único objeto `state` controla toda la aplicación

---

## 📁 Estructura del Proyecto
PROYECTO2_WEB_POKEAPI/
│
├── index.html
├── style.css
├── trainer.config.js
│
├── stage-1/
│ ├── index.html
│ ├── main.js
│ ├── api.js
│ ├── render.js
│ └── style.css
│
├── stage-2/
│ └── (pendiente)
│
└── README.md

---

## ⚠️ Problemas conocidos

- Stage 2 aún no implementado
- Algunos movimientos pueden no tener `power` en la API (se manejará en la siguiente fase)

---

## 🚀 Estado del Proyecto

✅ Stage 1 completo  
⏳ Stage 2 en desarrollo  

---

## 👨‍💻 Autor

Proyecto desarrollado por Yordy Olivares Rosales como parte de evaluación de la materia Web1 (Vanilla JS).
