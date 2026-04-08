// stage-1
import TRAINER from "../trainer.config.js";


// Elementos del Doom
const playerCardEl = document.getElementById("player-card");
const opponentCardEl = document.getElementById("opponent-card");
const searchInput = document.getElementById("search");
const battleBtn = document.getElementById("battle-btn");


// Datos del entrenador
document.getElementById("trainer-name").textContent = TRAINER.name;
document.getElementById("trainer-town").textContent = TRAINER.hometown;
document.getElementById("trainer-phrase").textContent = TRAINER.catchphrase;


// EMOJIS
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

// Render de pokemon
function renderPokemonInfo(data, container) {
  const name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
  const type = data.types[0].type.name;
  const emoji = typeEmoji(type);
  const hp = data.stats.find(s => s.stat.name === "hp")?.base_stat || "?";
  const attack = data.stats.find(s => s.stat.name === "attack")?.base_stat || "?";
  const defense = data.stats.find(s => s.stat.name === "defense")?.base_stat || "?";
  const speed = data.stats.find(s => s.stat.name === "speed")?.base_stat || "?";
  const sprite = data.sprites.front_default || "";

  container.innerHTML = `
    <img src="${sprite}" alt="${name}" class="pokemon-sprite">
    <p><strong>${name} ${emoji}</strong></p>
    <div class="pokemon-stats">
      <span>HP: ${heartEmoji()} ${hp}</span>
      <span>Ataque: ${attack} ⚔️</span>
      <span>Defensa: ${defense} 🛡️</span>
      <span>Velocidad: ${speed} ⚡</span>
    </div>
  `;
}


// Carga del pokemon favorito
async function loadPlayerPokemon() {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${TRAINER.favoritePokemon.toLowerCase()}`);
    if (!res.ok) throw new Error("Error cargando Pokémon favorito");
    const data = await res.json();
    renderPokemonInfo(data, playerCardEl);
    battleBtn.disabled = true; // aún no hay oponente
  } catch (err) {
    playerCardEl.innerHTML = `<p>Error cargando tu Pokémon.</p>`;
    console.error(err);
  }
}


// Inicializar
loadPlayerPokemon();