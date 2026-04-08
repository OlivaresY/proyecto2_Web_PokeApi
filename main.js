// stage-1/main.js

import TRAINER from "../trainer.config.js";


//Datos del entrenador

document.getElementById("trainer-name").textContent = TRAINER.name;
document.getElementById("trainer-town").textContent = TRAINER.hometown;
document.getElementById("trainer-phrase").textContent = TRAINER.catchphrase;


//Elementos del DOM
const playerCardEl = document.getElementById("player-card");
const opponentCardEl = document.getElementById("opponent-card");
const searchInput = document.getElementById("search");
const battleBtn = document.getElementById("battle-btn");


//Emojis y funciones
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

//Renderiozado de pokemon
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
  }
}

//Carga del pokemon favorito
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


// Estado del oponente
let opponentData = null;

// Busqueda del oponente
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


//DEBOUNCE pra la busqueda
let debounceTimeout;
searchInput.addEventListener("input", (e) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    const value = e.target.value.trim();
    searchOpponent(value);
  }, 400);
});

//Precargar ultimo oponente
const lastOpponent = localStorage.getItem("lastOpponent");
if (lastOpponent) {
  searchInput.value = lastOpponent;
  searchOpponent(lastOpponent);
}

//Boton de batalla
battleBtn.addEventListener("click", () => {
  if (!opponentData) return;
  // Guardar datos para Stage 2
  localStorage.setItem("playerPokemon", JSON.stringify(TRAINER.favoritePokemon));
  localStorage.setItem("opponentPokemon", JSON.stringify(opponentData.name));
  localStorage.setItem("lastOpponent", opponentData.name);
  // Redirigir a Stage 2
  window.location.href = "../stage-2/index.html";
});

//Inicializa pokemon del jugador
loadPlayerPokemon();