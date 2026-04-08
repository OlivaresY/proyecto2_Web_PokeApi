// stage-1/main.js

import TRAINER from "../trainer.config.js";

// =========================
// DATOS DEL ENTRENADOR
// =========================
document.getElementById("trainer-name").textContent = TRAINER.name;
document.getElementById("trainer-town").textContent = TRAINER.hometown;
document.getElementById("trainer-phrase").textContent = TRAINER.catchphrase;

// =========================
// ELEMENTOS DEL DOM
// =========================
const playerCardEl = document.getElementById("player-card");
const opponentCardEl = document.getElementById("opponent-card");
const searchInput = document.getElementById("search");
const battleBtn = document.getElementById("battle-btn");

// =========================
// EMOJIS Y FUNCIONES AUXILIARES
// =========================
function typeEmoji(type) {
  const emojis = {
    electric: "⚡",
    water: "💧",
    fire: "🔥",
    grass: "🌿",
    psychic: "🔮",
    dragon: "🐉",
    ghost: "👻",
    normal: "⬜",
  };
  return emojis[type] || "❓";
}

function heartEmoji() { return "❤️"; }

// =========================
// MAPA DE COLORES POR TIPO (Paso 3)
const typeColors = {
  electric: "#f9f871",
  water: "#3dc4f3",
  fire: "#f76c6c",
  grass: "#4cd964",
  psychic: "#c07efb",
  dragon: "#f9933b",
  ghost: "#a179c7",
  normal: "#dcdcdc",
};

// Aplica el tema al lado del jugador
function applyTypeTheme(type) {
  const color = typeColors[type] || "#ffffff";
  const playerSection = document.querySelector(".pokemon.player");
  playerSection.style.borderColor = color;
  playerSection.style.backgroundColor = hexToAlpha(color, 0.2); // ligero fondo
}

// Convierte HEX a rgba con opacidad
function hexToAlpha(hex, alpha) {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// =========================
// RENDERIZADO DE POKÉMON
// =========================
function renderPokemonInfo(data, container, isPlayer = false) {
  const name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
  const type = data.types[0].type.name;
  const emoji = typeEmoji(type);
  const hp = data.stats.find(s => s.stat.name === "hp")?.base_stat || "?";
  const power = data.stats.find(s => s.stat.name === "attack")?.base_stat || "?";
  const defense = data.stats.find(s => s.stat.name === "defense")?.base_stat || "?";
  const energy = data.stats.find(s => s.stat.name === "speed")?.base_stat || "?";
  const sprite = data.sprites.front_default || "";

  container.innerHTML = `
    <img src="${sprite}" alt="${name}" class="pokemon-sprite">
    <p><strong>${name} ${emoji}</strong></p>
    <div class="pokemon-stats">
        <span>HP: ${heartEmoji()} ${hp}</span>
        <span>Poder: ${power} ⚔️</span>
        <span>Defensa: ${defense}🛡️</span>
        <span>Energía: ${energy} 🔋</span>
    </div>
  `;

  if (isPlayer) {
    applyTypeTheme(type); // <--- aplica tema al jugador
  }
}

// =========================
// CARGA DEL POKÉMON FAVORITO
// =========================
async function loadPlayerPokemon() {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${TRAINER.favoritePokemon.toLowerCase()}`);
    if (!res.ok) throw new Error("Error cargando Pokémon favorito");
    const data = await res.json();
    renderPokemonInfo(data, playerCardEl, true);
    battleBtn.disabled = true; // espera a oponente
  } catch (err) {
    playerCardEl.innerHTML = `<p>Error cargando tu Pokémon.</p>`;
  }
}

// =========================
// ESTADO DEL OPONENTE
// =========================
let opponentData = null;

// =========================
// BÚSQUEDA DEL OPONENTE
// =========================
async function searchOpponent(name) {
  if (!name) {
    opponentCardEl.innerHTML = `<p class="loading">Sin seleccionar</p>`;
    battleBtn.disabled = true;
    opponentData = null;
    return;
  }

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
    if (!res.ok) throw new Error("Pokémon no encontrado");
    const data = await res.json();
    opponentData = data;
    renderPokemonInfo(data, opponentCardEl);
    battleBtn.disabled = false; // ambos Pokémon listos
  } catch {
    opponentCardEl.innerHTML = `<p class="loading">Pokémon no encontrado</p>`;
    battleBtn.disabled = true;
    opponentData = null;
  }
}

// =========================
// DEBOUNCE PARA LA BÚSQUEDA
// =========================
let debounceTimeout;
searchInput.addEventListener("input", (e) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    const value = e.target.value.trim();
    searchOpponent(value);
  }, 400);
});

// =========================
// PRECARGAR ÚLTIMO OPONENTE
// =========================
const lastOpponent = localStorage.getItem("lastOpponent");
if (lastOpponent) {
  searchInput.value = lastOpponent;
  searchOpponent(lastOpponent);
}

// =========================
// BOTÓN DE BATALLA
// =========================
battleBtn.addEventListener("click", () => {
  if (!opponentData) return;
  localStorage.setItem("playerPokemon", JSON.stringify(TRAINER.favoritePokemon));
  localStorage.setItem("opponentPokemon", JSON.stringify(opponentData.name));
  localStorage.setItem("lastOpponent", opponentData.name);
  window.location.href = "../stage-2/index.html";
});

// =========================
// INICIALIZA POKÉMON DEL JUGADOR
// =========================
loadPlayerPokemon();