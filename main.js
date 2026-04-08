import TRAINER from "../trainer.config.js";

// DOM
const playerCardEl = document.getElementById("player-card");
const opponentCardEl = document.getElementById("opponent-card");
const searchInput = document.getElementById("search");
const battleBtn = document.getElementById("battle-btn");

// Trainer info
document.getElementById("trainer-name").textContent = TRAINER.name;
document.getElementById("trainer-town").textContent = TRAINER.hometown;
document.getElementById("trainer-phrase").textContent = TRAINER.catchphrase;

// Emojis
const typeEmoji = (type) => ({
  electric: "⚡",
  water: "💧",
  fire: "🔥",
  grass: "🌿",
}[type] || "❓");

// Colores
const typeColor = (type) => ({
  electric: "#f9e045",
  water: "#3da4f7",
  fire: "#f75c03",
  grass: "#63c74d",
}[type] || "#777");

// Render Pokémon
async function renderPokemonInfo(data, container, isPlayer = false) {
  const name = data.name;
  const type = data.types[0].type.name;
  const hp = data.stats.find(s => s.stat.name === "hp").base_stat;
  const sprite = data.sprites.front_default;

  container.classList.add("dynamic-bg");
  container.style.backgroundColor = typeColor(type);

  container.innerHTML = `
    <img src="${sprite}" class="pokemon-sprite">
    <p><strong>${name} ${typeEmoji(type)}</strong></p>
    <p>HP: ${hp}</p>
    <div class="moves-buttons"></div>
  `;

  if (isPlayer) {
    const movesContainer = container.querySelector(".moves-buttons");

    const moves = data.moves.slice(0, 3);

    for (let move of moves) {
      const btn = document.createElement("button");
      btn.className = "move-btn";
      btn.textContent = move.move.name;
      movesContainer.appendChild(btn);
    }
  }
}

// Cargar Pokémon jugador
async function loadPlayerPokemon() {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${TRAINER.favoritePokemon}`);
  const data = await res.json();
  renderPokemonInfo(data, playerCardEl, true);
}

// Buscar oponente
async function searchOpponent(name) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const data = await res.json();
    renderPokemonInfo(data, opponentCardEl);
    battleBtn.disabled = false;
  } catch {
    battleBtn.disabled = true;
  }
}

// Evento input
searchInput.addEventListener("input", (e) => {
  searchOpponent(e.target.value);
});

// Botón batalla
battleBtn.addEventListener("click", () => {
  window.location.href = "../stage-2/index.html";
});

// Init
loadPlayerPokemon();